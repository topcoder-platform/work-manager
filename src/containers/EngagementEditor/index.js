import _ from 'lodash'
import moment from 'moment-timezone'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EngagementEditor from '../../components/EngagementEditor'
import Modal from '../../components/Modal'
import PaymentForm from '../../components/PaymentForm'
import {
  loadEngagementDetails,
  createEngagement,
  updateEngagementDetails,
  partiallyUpdateEngagementDetails,
  deleteEngagement
} from '../../actions/engagements'
import { createMemberPayment } from '../../actions/payments'
import { loadProject } from '../../actions/projects'
import { checkAdmin, checkManager, checkTaskManager } from '../../util/tc'
import { toastFailure } from '../../util/toaster'
import { PROJECT_ROLES } from '../../config/constants'
import { fetchProfile } from '../../services/user'
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
  status: 'Open',
  isPrivate: false,
  requiredMemberCount: '',
  assignedMemberHandle: '',
  assignments: [],
  assignedMembers: [],
  assignedMemberHandles: []
})

const getMemberHandle = (member) => {
  if (!member) {
    return null
  }
  if (typeof member === 'string') {
    return member
  }
  return member.handle || member.memberHandle || member.username || member.name || member.userHandle || member.userName || null
}

const getMemberId = (member) => {
  if (!member || typeof member === 'string') {
    return null
  }
  return member.id || member.memberId || member.userId || null
}

const normalizeMemberInfo = (member, index, memberIdLookup = {}) => {
  if (!member) {
    return { id: null, handle: '-', key: `member-${index}` }
  }
  if (typeof member === 'string') {
    return {
      id: memberIdLookup[member] || null,
      handle: member,
      key: member || `member-${index}`
    }
  }
  const handle = getMemberHandle(member) || '-'
  const id = getMemberId(member) || (handle !== '-' ? memberIdLookup[handle] : null)
  return {
    ...member,
    id,
    handle,
    key: id || handle || `member-${index}`
  }
}

class EngagementEditorContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      engagement: getEmptyEngagement(),
      submitTriggered: false,
      validationErrors: {},
      showDeleteModal: false,
      isSaving: false,
      showPaymentModal: false,
      selectedMember: null,
      memberIdLookup: {}
    }

    this.onUpdateInput = this.onUpdateInput.bind(this)
    this.onUpdateDescription = this.onUpdateDescription.bind(this)
    this.onUpdateSkills = this.onUpdateSkills.bind(this)
    this.onUpdateDate = this.onUpdateDate.bind(this)
    this.onSavePublish = this.onSavePublish.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onToggleDelete = this.onToggleDelete.bind(this)
    this.onOpenPaymentModal = this.onOpenPaymentModal.bind(this)
    this.onClosePaymentModal = this.onClosePaymentModal.bind(this)
    this.onSubmitPayment = this.onSubmitPayment.bind(this)
    this.resolveMemberIds = this.resolveMemberIds.bind(this)
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
      const normalizedEngagement = this.normalizeEngagement(nextProps.engagementDetails)
      this.setState({
        engagement: normalizedEngagement,
        submitTriggered: false,
        validationErrors: {}
      })
      this.resolveMemberIds(normalizedEngagement)
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
    const assignments = Array.isArray(normalized.assignments) ? normalized.assignments : []
    const assignedMembersFromAssignments = assignments.map((assignment) => assignment.memberId).filter(Boolean)
    const assignedMemberHandlesFromAssignments = assignments.map((assignment) => assignment.memberHandle).filter(Boolean)
    const assignedMembers = assignedMembersFromAssignments.length
      ? assignedMembersFromAssignments
      : (normalized.assignedMembers || [])
    const assignedMemberHandles = assignedMemberHandlesFromAssignments.length
      ? assignedMemberHandlesFromAssignments
      : (normalized.assignedMemberHandles || [])
    return {
      ...getEmptyEngagement(),
      ...normalized,
      durationWeeks,
      role: fromEngagementRoleApi(normalized.role),
      workload: fromEngagementWorkloadApi(normalized.workload),
      compensationRange: normalized.compensationRange || '',
      isPrivate: normalized.isPrivate || false,
      requiredMemberCount: normalized.requiredMemberCount || '',
      assignedMemberHandle: normalized.assignedMemberHandle || '',
      assignments,
      assignedMembers,
      assignedMemberHandles,
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

    if (engagement.isPrivate && (!engagement.assignedMemberHandle || !engagement.assignedMemberHandle.trim())) {
      errors.assignedMemberHandle = 'Member handle is required for private engagements'
    }

    if (engagement.requiredMemberCount !== '' && engagement.requiredMemberCount != null) {
      const parsedRequiredMemberCount = Number(engagement.requiredMemberCount)
      if (
        Number.isNaN(parsedRequiredMemberCount) ||
        !Number.isInteger(parsedRequiredMemberCount) ||
        parsedRequiredMemberCount < 1
      ) {
        errors.requiredMemberCount = 'Required members must be a positive number'
      }
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

    if (engagement.isPrivate !== undefined) {
      payload.isPrivate = engagement.isPrivate
    }

    if (engagement.requiredMemberCount !== '' && engagement.requiredMemberCount != null) {
      const requiredMemberCount = parseInt(engagement.requiredMemberCount, 10)
      if (!Number.isNaN(requiredMemberCount)) {
        payload.requiredMemberCount = requiredMemberCount
      }
    }

    if (engagement.isPrivate && engagement.assignedMemberHandle) {
      payload.assignedMemberHandle = engagement.assignedMemberHandle
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

  onOpenPaymentModal (member) {
    this.setState({
      showPaymentModal: true,
      selectedMember: member
    })
  }

  onClosePaymentModal () {
    this.setState({
      showPaymentModal: false,
      selectedMember: null
    })
  }

  async onSubmitPayment (member, paymentTitle, amount) {
    const { engagement, selectedMember } = this.state
    const { payments, projectDetail, createMemberPayment } = this.props
    if (payments && payments.isProcessing) {
      return
    }
    const memberToPay = member || selectedMember
    if (!memberToPay) {
      toastFailure('Error', 'Member is required to create a payment')
      return
    }
    const memberHandle = getMemberHandle(memberToPay)
    let memberId = getMemberId(memberToPay)
    if (!memberId && memberHandle) {
      try {
        const profile = await fetchProfile(memberHandle)
        memberId = profile && (profile.userId || profile.id || profile.memberId)
      } catch (error) {
        // Keep memberId unset to fall through to validation error.
      }
    }
    if (!memberId) {
      toastFailure('Error', 'Member ID is required to create a payment')
      return
    }
    const billingAccountId = _.get(projectDetail, 'billingAccountId')
    if (!billingAccountId) {
      toastFailure('Error', 'Billing account is required to create a payment')
      return
    }
    if (!window.confirm('Are you sure you want to submit this payment?')) {
      return
    }
    try {
      await createMemberPayment(
        engagement.id,
        memberId,
        memberHandle,
        paymentTitle,
        amount,
        billingAccountId
      )
      this.onClosePaymentModal()
    } catch (error) {
      // Keep modal open to show error toast from reducer.
    }
  }

  async resolveMemberIds (engagement) {
    if (!engagement) {
      return
    }
    const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []
    const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
    const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles) ? engagement.assignedMemberHandles : []
    const memberCandidates = assignments.length
      ? assignments
      : assignedMembers.length
        ? assignedMembers
        : assignedMemberHandles
    if (!memberCandidates.length) {
      return
    }
    const handlesToLookup = memberCandidates.reduce((acc, member) => {
      const handle = getMemberHandle(member)
      const id = getMemberId(member)
      if (
        handle &&
        !id &&
        !Object.prototype.hasOwnProperty.call(this.state.memberIdLookup, handle) &&
        !acc.includes(handle)
      ) {
        acc.push(handle)
      }
      return acc
    }, [])
    if (!handlesToLookup.length) {
      return
    }
    const results = await Promise.all(handlesToLookup.map(async (handle) => {
      try {
        const profile = await fetchProfile(handle)
        const id = profile && (profile.userId || profile.id || profile.memberId)
        return { handle, id: id || null }
      } catch (error) {
        return { handle, id: null }
      }
    }))
    this.setState((prevState) => {
      const nextLookup = { ...prevState.memberIdLookup }
      results.forEach(({ handle, id }) => {
        if (!Object.prototype.hasOwnProperty.call(nextLookup, handle) || (id && !nextLookup[handle])) {
          nextLookup[handle] = id
        }
      })
      return { memberIdLookup: nextLookup }
    })
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
    const isTaskManager = checkTaskManager(auth.token)
    const members = _.get(projectDetail, 'members', [])
    const userId = _.get(auth, 'user.userId')
    const isProjectManager = members.some(member => member.userId === userId && member.role === PROJECT_ROLES.MANAGER)
    return isAdmin || isManager || isTaskManager || isProjectManager
  }

  render () {
    const { match, isLoading, payments } = this.props
    const engagementId = _.get(match.params, 'engagementId', null)
    const isNew = !engagementId
    const isPaymentProcessing = Boolean(payments && payments.isProcessing)
    const shouldShowPaymentModal = this.state.showPaymentModal && this.state.selectedMember
    const assignedMembersForPayment = this.getAssignedMembersForPayment()

    return (
      <React.Fragment>
        <EngagementEditor
          engagement={this.state.engagement}
          isNew={isNew}
          isLoading={isLoading}
          isSaving={this.state.isSaving}
          canEdit={this.canEdit()}
          isPaymentProcessing={isPaymentProcessing}
          submitTriggered={this.state.submitTriggered}
          validationErrors={this.state.validationErrors}
          showDeleteModal={this.state.showDeleteModal}
          resolvedAssignedMembers={assignedMembersForPayment}
          onToggleDelete={this.onToggleDelete}
          onUpdateInput={this.onUpdateInput}
          onUpdateDescription={this.onUpdateDescription}
          onUpdateSkills={this.onUpdateSkills}
          onUpdateDate={this.onUpdateDate}
          onSavePublish={this.onSavePublish}
          onCancel={this.onCancel}
          onDelete={this.onDelete}
          onOpenPaymentModal={this.onOpenPaymentModal}
        />
        {shouldShowPaymentModal && (
          <Modal onCancel={this.onClosePaymentModal}>
            <PaymentForm
              engagement={this.state.engagement}
              member={this.state.selectedMember}
              availableMembers={assignedMembersForPayment}
              isProcessing={isPaymentProcessing}
              onSubmit={this.onSubmitPayment}
              onCancel={this.onClosePaymentModal}
            />
          </Modal>
        )}
      </React.Fragment>
    )
  }

  getAssignedMembersForPayment () {
    const { engagement } = this.state
    const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []

    if (assignments.length > 0) {
      return assignments.map((assignment, index) => ({
        id: assignment.memberId,
        handle: assignment.memberHandle,
        key: assignment.id || assignment.memberId || `assignment-${index}`,
        assignmentId: assignment.id
      }))
    }

    const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
    const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles) ? engagement.assignedMemberHandles : []
    const memberCandidates = assignedMembers.length ? assignedMembers : assignedMemberHandles
    return memberCandidates.map((member, index) => normalizeMemberInfo(member, index, this.state.memberIdLookup))
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
  payments: PropTypes.shape({
    isProcessing: PropTypes.bool
  }),
  engagementDetails: PropTypes.shape(),
  isLoading: PropTypes.bool,
  loadEngagementDetails: PropTypes.func.isRequired,
  createEngagement: PropTypes.func.isRequired,
  updateEngagementDetails: PropTypes.func.isRequired,
  deleteEngagement: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired,
  createMemberPayment: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  engagementDetails: state.engagements.engagementDetails,
  isLoading: state.engagements.isLoading,
  auth: state.auth,
  projectDetail: state.projects.projectDetail,
  payments: state.payments
})

const mapDispatchToProps = {
  loadEngagementDetails,
  createEngagement,
  updateEngagementDetails,
  partiallyUpdateEngagementDetails,
  deleteEngagement,
  loadProject,
  createMemberPayment
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementEditorContainer)
)
