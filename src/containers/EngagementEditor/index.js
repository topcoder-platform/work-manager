import _ from 'lodash'
import moment from 'moment-timezone'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EngagementEditor from '../../components/EngagementEditor'
import {
  loadEngagementDetails,
  createEngagement,
  updateEngagementDetails,
  partiallyUpdateEngagementDetails,
  deleteEngagement
} from '../../actions/engagements'
import { loadProject } from '../../actions/projects'
import { checkAdmin, checkManager } from '../../util/tc'
import { PROJECT_ROLES } from '../../config/constants'
import {
  normalizeEngagement as normalizeEngagementShape,
  toEngagementStatusApi
} from '../../util/engagements'

const getEmptyEngagement = () => ({
  id: null,
  title: '',
  description: '',
  startDate: null,
  endDate: null,
  durationAmount: '',
  durationUnit: 'weeks',
  timezones: [],
  countries: [],
  skills: [],
  applicationDeadline: null,
  status: 'Open'
})

class EngagementEditorContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      engagement: getEmptyEngagement(),
      submitTriggered: false,
      validationErrors: {},
      showDeleteModal: false,
      isSaving: false
    }

    this.onUpdateInput = this.onUpdateInput.bind(this)
    this.onUpdateDescription = this.onUpdateDescription.bind(this)
    this.onUpdateSkills = this.onUpdateSkills.bind(this)
    this.onUpdateDate = this.onUpdateDate.bind(this)
    this.onSaveDraft = this.onSaveDraft.bind(this)
    this.onSavePublish = this.onSavePublish.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onToggleDelete = this.onToggleDelete.bind(this)
  }

  componentDidMount () {
    const { match, loadEngagementDetails, loadProject } = this.props
    const projectId = this.getProjectId(match)
    const engagementId = _.get(match.params, 'engagementId', null)
    if (projectId) {
      loadProject(projectId)
    }
    if (engagementId) {
      loadEngagementDetails(projectId, engagementId)
    }
  }

  componentWillReceiveProps (nextProps) {
    const { match } = this.props
    const currentProjectId = this.getProjectId(match)
    const nextProjectId = this.getProjectId(nextProps.match)
    const currentEngagementId = _.get(match.params, 'engagementId', null)
    const nextEngagementId = _.get(nextProps.match.params, 'engagementId', null)

    if (currentProjectId !== nextProjectId && nextProjectId) {
      this.props.loadProject(nextProjectId)
    }

    if (currentEngagementId !== nextEngagementId) {
      if (nextEngagementId) {
        this.props.loadEngagementDetails(nextProjectId, nextEngagementId)
      } else {
        this.setState({ engagement: getEmptyEngagement(), submitTriggered: false, validationErrors: {} })
      }
    }

    if (
      nextProps.engagementDetails &&
      nextProps.engagementDetails.id &&
      nextProps.engagementDetails.id !== this.state.engagement.id
    ) {
      this.setState({
        engagement: this.normalizeEngagement(nextProps.engagementDetails),
        submitTriggered: false,
        validationErrors: {}
      })
    }
  }

  getProjectId (match) {
    let projectId = _.get(match.params, 'projectId', null)
    projectId = projectId ? parseInt(projectId, 10) : null
    return projectId
  }

  normalizeEngagement (details) {
    const normalized = normalizeEngagementShape(details)
    const duration = normalized.duration || {}
    return {
      ...getEmptyEngagement(),
      ...normalized,
      startDate: normalized.startDate ? moment(normalized.startDate).toDate() : null,
      endDate: normalized.endDate ? moment(normalized.endDate).toDate() : null,
      applicationDeadline: normalized.applicationDeadline ? moment(normalized.applicationDeadline).toDate() : null,
      durationAmount: normalized.durationAmount || duration.amount || '',
      durationUnit: normalized.durationUnit || duration.unit || 'weeks',
      timezones: normalized.timezones || [],
      countries: normalized.countries || [],
      skills: normalized.skills || []
    }
  }

  normalizeDateValue (value) {
    if (!value) {
      return null
    }
    const rawValue = value && value.target ? value.target.value : value
    const parsed = moment(rawValue)
    return parsed.isValid() ? parsed.toDate() : null
  }

  onUpdateInput (event) {
    const { name, value } = event.target
    this.setState((prevState) => ({
      engagement: {
        ...prevState.engagement,
        [name]: value
      }
    }))
  }

  onUpdateDescription (value) {
    this.setState((prevState) => ({
      engagement: {
        ...prevState.engagement,
        description: value
      }
    }))
  }

  onUpdateSkills (skills) {
    this.setState((prevState) => ({
      engagement: {
        ...prevState.engagement,
        skills
      }
    }))
  }

  onUpdateDate (field, value) {
    const normalized = this.normalizeDateValue(value)
    this.setState((prevState) => ({
      engagement: {
        ...prevState.engagement,
        [field]: normalized
      }
    }))
  }

  getValidationErrors (engagement) {
    const errors = {}

    if (!engagement.title || !engagement.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!engagement.description || !engagement.description.trim()) {
      errors.description = 'Description is required'
    }

    const hasDateRange = Boolean(engagement.startDate && engagement.endDate)
    const hasDuration = Boolean(engagement.durationAmount)
    if (!hasDateRange && !hasDuration) {
      errors.duration = 'Start date and end date are required'
    }

    if (!engagement.applicationDeadline) {
      errors.applicationDeadline = 'Application deadline is required'
    }

    if (!engagement.skills || !engagement.skills.length) {
      errors.skills = 'Select at least one skill'
    }

    if (!engagement.status) {
      errors.status = 'Status is required'
    }

    return errors
  }

  buildPayload (engagement, isDraft) {
    const hasDateRange = Boolean(engagement.startDate && engagement.endDate)
    const hasDuration = Boolean(engagement.durationAmount)
    const status = engagement.status || (isDraft ? 'Open' : '')
    const requiredSkills = (engagement.skills || [])
      .map((skill) => {
        if (!skill) {
          return null
        }
        if (typeof skill === 'string') {
          return skill
        }
        return skill.id || skill.value || null
      })
      .filter(Boolean)

    const payload = {
      title: engagement.title,
      description: engagement.description,
      timeZones: engagement.timezones || [],
      countries: engagement.countries || [],
      requiredSkills,
      applicationDeadline: engagement.applicationDeadline
        ? moment(engagement.applicationDeadline).toISOString()
        : null,
      status: toEngagementStatusApi(status)
    }

    if (hasDateRange) {
      payload.durationStartDate = moment(engagement.startDate).toISOString()
      payload.durationEndDate = moment(engagement.endDate).toISOString()
    } else if (hasDuration) {
      const amount = Number(engagement.durationAmount)
      if ((engagement.durationUnit || 'weeks') === 'months') {
        payload.durationMonths = amount
      } else {
        payload.durationWeeks = amount
      }
    }

    return payload
  }

  async onSaveDraft () {
    await this.onSave(true)
  }

  async onSavePublish () {
    await this.onSave(false)
  }

  async onSave (isDraft) {
    if (this.state.isSaving) {
      return
    }
    const { engagement } = this.state
    const { history, match } = this.props
    const projectId = this.getProjectId(match)

    if (!isDraft) {
      const validationErrors = this.getValidationErrors(engagement)
      if (Object.keys(validationErrors).length) {
        this.setState({ submitTriggered: true, validationErrors })
        return
      }
      this.setState({ submitTriggered: false, validationErrors: {} })
    }

    try {
      this.setState({ isSaving: true })
      const payload = this.buildPayload(engagement, isDraft)
      if (engagement.id) {
        await this.props.updateEngagementDetails(engagement.id, payload, projectId)
      } else {
        await this.props.createEngagement(payload, projectId)
      }
      this.setState({ isSaving: false })
      history.push(`/projects/${projectId}/engagements`)
    } catch (error) {
      this.setState({ isSaving: false })
    }
  }

  onCancel () {
    const { history, match } = this.props
    const projectId = this.getProjectId(match)
    history.push(`/projects/${projectId}/engagements`)
  }

  onToggleDelete () {
    this.setState((prevState) => ({ showDeleteModal: !prevState.showDeleteModal }))
  }

  async onDelete () {
    if (this.state.isSaving) {
      return
    }
    const { history, match } = this.props
    const projectId = this.getProjectId(match)
    const engagementId = this.state.engagement.id

    if (!engagementId) {
      return
    }

    try {
      this.setState({ isSaving: true })
      await this.props.deleteEngagement(engagementId, projectId)
      this.setState({ isSaving: false, showDeleteModal: false })
      history.push(`/projects/${projectId}/engagements`)
    } catch (error) {
      this.setState({ isSaving: false })
    }
  }

  canEdit () {
    const { auth, projectDetail } = this.props
    const isAdmin = checkAdmin(auth.token)
    const isManager = checkManager(auth.token)
    const members = _.get(projectDetail, 'members', [])
    const userId = _.get(auth, 'user.userId')
    const isProjectManager = members.some(member => member.userId === userId && member.role === PROJECT_ROLES.MANAGER)
    return isAdmin || isManager || isProjectManager
  }

  render () {
    const { match, isLoading } = this.props
    const engagementId = _.get(match.params, 'engagementId', null)
    const isNew = !engagementId

    return (
      <EngagementEditor
        engagement={this.state.engagement}
        isNew={isNew}
        isLoading={isLoading}
        isSaving={this.state.isSaving}
        canEdit={this.canEdit()}
        submitTriggered={this.state.submitTriggered}
        validationErrors={this.state.validationErrors}
        showDeleteModal={this.state.showDeleteModal}
        onToggleDelete={this.onToggleDelete}
        onUpdateInput={this.onUpdateInput}
        onUpdateDescription={this.onUpdateDescription}
        onUpdateSkills={this.onUpdateSkills}
        onUpdateDate={this.onUpdateDate}
        onSaveDraft={this.onSaveDraft}
        onSavePublish={this.onSavePublish}
        onCancel={this.onCancel}
        onDelete={this.onDelete}
      />
    )
  }
}

EngagementEditorContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
      engagementId: PropTypes.string
    })
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func
  }).isRequired,
  auth: PropTypes.shape({
    token: PropTypes.string,
    user: PropTypes.shape({
      userId: PropTypes.number
    })
  }).isRequired,
  projectDetail: PropTypes.shape({
    members: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.number,
      role: PropTypes.string
    }))
  }),
  engagementDetails: PropTypes.shape(),
  isLoading: PropTypes.bool,
  loadEngagementDetails: PropTypes.func.isRequired,
  createEngagement: PropTypes.func.isRequired,
  updateEngagementDetails: PropTypes.func.isRequired,
  partiallyUpdateEngagementDetails: PropTypes.func.isRequired,
  deleteEngagement: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  engagementDetails: state.engagements.engagementDetails,
  isLoading: state.engagements.isLoading,
  auth: state.auth,
  projectDetail: state.projects.projectDetail
})

const mapDispatchToProps = {
  loadEngagementDetails,
  createEngagement,
  updateEngagementDetails,
  partiallyUpdateEngagementDetails,
  deleteEngagement,
  loadProject
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementEditorContainer)
)
