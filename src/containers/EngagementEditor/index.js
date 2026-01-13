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
  fromEngagementRoleApi,
  fromEngagementWorkloadApi,
  toEngagementRoleApi,
  toEngagementWorkloadApi,
  toEngagementStatusApi
} from '../../util/engagements'

const getEmptyEngagement = () => ({
  id: null,
  title: '',
  description: '',
  durationWeeks: '',
  role: null,
  workload: null,
  compensationRange: '',
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

    const nextEngagementDetailsId = _.get(nextProps.engagementDetails, 'id', null)
    if (
      nextEngagementId &&
      nextEngagementDetailsId &&
      `${nextEngagementDetailsId}` === `${nextEngagementId}` &&
      nextEngagementDetailsId !== this.state.engagement.id
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
    const rawDurationWeeks = normalized.durationWeeks != null && normalized.durationWeeks !== ''
      ? normalized.durationWeeks
      : duration.unit === 'weeks' && duration.amount != null && duration.amount !== ''
        ? duration.amount
        : ''
    const parsedDurationWeeks = rawDurationWeeks !== '' ? parseInt(rawDurationWeeks, 10) : ''
    const durationWeeks = Number.isNaN(parsedDurationWeeks) ? '' : parsedDurationWeeks
    return {
      ...getEmptyEngagement(),
      ...normalized,
      durationWeeks,
      role: fromEngagementRoleApi(normalized.role),
      workload: fromEngagementWorkloadApi(normalized.workload),
      compensationRange: normalized.compensationRange || '',
      applicationDeadline: normalized.applicationDeadline ? moment(normalized.applicationDeadline).toDate() : null,
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

    const durationValue = engagement.durationWeeks
    const parsedDurationWeeks = Number(durationValue)
    if (
      durationValue === '' ||
      durationValue == null ||
      Number.isNaN(parsedDurationWeeks) ||
      !Number.isInteger(parsedDurationWeeks) ||
      parsedDurationWeeks < 4
    ) {
      errors.durationWeeks = 'Duration must be at least 4 weeks'
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

    if (engagement.durationWeeks !== '' && engagement.durationWeeks != null) {
      const durationWeeks = parseInt(engagement.durationWeeks, 10)
      if (!Number.isNaN(durationWeeks)) {
        payload.durationWeeks = durationWeeks
      }
    }

    if (engagement.role) {
      payload.role = toEngagementRoleApi(engagement.role)
    }

    if (engagement.workload) {
      payload.workload = toEngagementWorkloadApi(engagement.workload)
    }

    if (engagement.compensationRange) {
      payload.compensationRange = engagement.compensationRange
    }

    return payload
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
