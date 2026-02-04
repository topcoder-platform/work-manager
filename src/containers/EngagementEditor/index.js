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
import { checkAdmin, checkManager, checkTaskManager } from '../../util/tc'
import { PROJECT_ROLES } from '../../config/constants'
import { fetchProfile } from '../../services/user'
import {
  normalizeEngagement as normalizeEngagementShape,
  fromEngagementAnticipatedStartApi,
  fromEngagementRoleApi,
  fromEngagementWorkloadApi,
  getCountableAssignments,
  toEngagementAnticipatedStartApi,
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
  anticipatedStart: null,
  status: 'Open',
  isPrivate: false,
  requiredMemberCount: '',
  assignments: [],
  assignedMembers: [],
  assignedMemberHandles: [],
  assignmentDetails: []
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

const normalizeMemberId = (value) => {
  if (value == null) {
    return null
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }
    if (!/^\d+$/.test(trimmed)) {
      return null
    }
    const parsed = parseInt(trimmed, 10)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
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
      memberIdLookup: {}
    }

    this.onUpdateInput = this.onUpdateInput.bind(this)
    this.onUpdateDescription = this.onUpdateDescription.bind(this)
    this.onUpdateSkills = this.onUpdateSkills.bind(this)
    this.onSavePublish = this.onSavePublish.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onToggleDelete = this.onToggleDelete.bind(this)
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
      const engagementDetails = { ...normalizedEngagement }
      delete engagementDetails.attachments
      this.setState({
        engagement: engagementDetails,
        submitTriggered: false,
        validationErrors: {}
      }, () => {
        this.resolveMemberIds(normalizedEngagement)
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
    const assignments = Array.isArray(normalized.assignments) ? normalized.assignments : []
    const countableAssignments = getCountableAssignments(assignments)
    const assignedMembersFromAssignments = countableAssignments
      .map((assignment) => assignment.memberId)
      .filter(Boolean)
    const assignedMemberHandlesFromAssignments = countableAssignments
      .map((assignment) => assignment.memberHandle)
      .filter(Boolean)
    const hasAssignments = assignments.length > 0
    const assignedMembers = hasAssignments
      ? assignedMembersFromAssignments
      : (normalized.assignedMembers || [])
    const legacyAssignedMemberHandles = normalized.assignedMemberHandle
      ? [normalized.assignedMemberHandle]
      : []
    const normalizedAssignedMemberHandles = Array.isArray(normalized.assignedMemberHandles)
      ? normalized.assignedMemberHandles
      : []
    const assignedMemberHandles = hasAssignments
      ? assignedMemberHandlesFromAssignments
      : (normalizedAssignedMemberHandles.length ? normalizedAssignedMemberHandles : legacyAssignedMemberHandles)
    const assignmentDetails = assignedMemberHandles.map((handle) => {
      if (!handle) {
        return null
      }
      const assignmentMatch = countableAssignments.find((assignment) => {
        const assignmentHandle = getMemberHandle(assignment)
        return assignmentHandle && assignmentHandle.toLowerCase() === handle.toLowerCase()
      })
      if (!assignmentMatch) {
        return {
          memberHandle: handle,
          startDate: null,
          endDate: null,
          agreementRate: '',
          otherRemarks: ''
        }
      }
      return {
        memberHandle: handle,
        startDate: assignmentMatch.startDate || null,
        endDate: assignmentMatch.endDate || null,
        agreementRate: assignmentMatch.agreementRate || '',
        otherRemarks: assignmentMatch.otherRemarks || ''
      }
    })
    return {
      ...getEmptyEngagement(),
      ...normalized,
      durationWeeks,
      role: fromEngagementRoleApi(normalized.role),
      workload: fromEngagementWorkloadApi(normalized.workload),
      compensationRange: normalized.compensationRange || '',
      anticipatedStart: fromEngagementAnticipatedStartApi(normalized.anticipatedStart),
      isPrivate: normalized.isPrivate || false,
      requiredMemberCount: normalized.requiredMemberCount || '',
      assignments,
      assignedMembers,
      assignedMemberHandles,
      assignmentDetails,
      timezones: normalized.timezones || [],
      countries: normalized.countries || [],
      skills: normalized.skills || []
    }
  }

  onUpdateInput (event) {
    const { name, value } = event.target
    this.setState((prevState) => {
      const nextValue = name === 'assignedMemberHandles'
        ? (Array.isArray(value) ? value : [])
        : value
      return {
        engagement: {
          ...prevState.engagement,
          [name]: nextValue
        }
      }
    })
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

    if (!engagement.anticipatedStart) {
      errors.anticipatedStart = 'Anticipated start is required'
    }

    if (!engagement.skills || !engagement.skills.length) {
      errors.skills = 'Select at least one skill'
    }

    if (!engagement.status) {
      errors.status = 'Status is required'
    }

    if (engagement.isPrivate) {
      const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles)
        ? engagement.assignedMemberHandles
        : []
      const trimmedMemberHandles = assignedMemberHandles.map((handle) => (handle || '').trim())
      const requiredMemberCountValue = Number(engagement.requiredMemberCount)
      const hasRequiredMemberCount = Number.isInteger(requiredMemberCountValue) && requiredMemberCountValue > 0
      const assignmentFieldCount = Math.max(1, requiredMemberCountValue || 1)
      const getAssignedMemberRequiredMessage = (index) => {
        const assignmentLabel = assignmentFieldCount > 1
          ? `Assign to Member ${index + 1}`
          : 'Assign to Member'
        return `${assignmentLabel} is required`
      }

      if (hasRequiredMemberCount) {
        const requiredHandles = trimmedMemberHandles.slice(0, requiredMemberCountValue)
        const missingIndices = []
        for (let index = 0; index < requiredMemberCountValue; index += 1) {
          if (!requiredHandles[index]) {
            errors[`assignedMemberHandle${index}`] = getAssignedMemberRequiredMessage(index)
            missingIndices.push(index)
          }
        }
        if (missingIndices.length) {
          errors.assignedMemberHandles = `All ${requiredMemberCountValue} member assignments are required for private engagements`
        }
      } else if (!trimmedMemberHandles.some(Boolean)) {
        const requiredMessage = getAssignedMemberRequiredMessage(0)
        errors.assignedMemberHandle0 = requiredMessage
        errors.assignedMemberHandles = requiredMessage
      }
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

    if (!Array.isArray(engagement.timezones) || engagement.timezones.length === 0) {
      errors.timezones = 'Select at least one Time Zone'
    }

    if (!Array.isArray(engagement.countries) || engagement.countries.length === 0) {
      errors.countries = 'Select at least one Country'
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
      anticipatedStart: toEngagementAnticipatedStartApi(engagement.anticipatedStart),
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

    const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles)
      ? engagement.assignedMemberHandles
      : []
    const trimmedAssignedMemberHandles = assignedMemberHandles
      .map((handle) => (handle || '').trim())
      .filter(Boolean)
    const requiredMemberCountValue = Number(engagement.requiredMemberCount)
    const hasRequiredMemberCount = Number.isInteger(requiredMemberCountValue) && requiredMemberCountValue > 0
    const assignmentLimit = hasRequiredMemberCount ? requiredMemberCountValue : trimmedAssignedMemberHandles.length
    const payloadAssignedMemberHandles = trimmedAssignedMemberHandles.slice(0, assignmentLimit)
    const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []
    const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
    const assignmentDetails = Array.isArray(engagement.assignmentDetails) ? engagement.assignmentDetails : []
    const memberIdLookup = this.state.memberIdLookup || {}
    const payloadAssignedMemberIds = payloadAssignedMemberHandles.map((handle, index) => {
      const assignmentMatch = assignments.find((assignment) => getMemberHandle(assignment) === handle)
      const assignmentId = assignmentMatch ? normalizeMemberId(getMemberId(assignmentMatch)) : null
      if (assignmentId != null) {
        return assignmentId
      }

      const assignedMemberMatch = assignedMembers.find((member) => getMemberHandle(member) === handle)
      let assignedMemberId = assignedMemberMatch ? normalizeMemberId(getMemberId(assignedMemberMatch)) : null

      if (assignedMemberId != null) {
        return assignedMemberId
      }

      if (Object.prototype.hasOwnProperty.call(memberIdLookup, handle)) {
        return normalizeMemberId(memberIdLookup[handle])
      }

      return null
    })
    const hasCompleteAssignedMemberIds = payloadAssignedMemberHandles.length > 0 &&
      payloadAssignedMemberIds.every((id) => id != null)
    const normalizeAssignmentDate = (value) => {
      if (!value) {
        return null
      }
      const parsed = moment(value)
      return parsed.isValid() ? parsed.toISOString() : null
    }
    const payloadAssignmentDetails = payloadAssignedMemberHandles.map((handle, index) => {
      const detail = assignmentDetails[index] || {}
      const normalizedRate = detail.agreementRate != null ? String(detail.agreementRate).trim() : ''
      const normalizedOtherRemarks = detail.otherRemarks != null ? String(detail.otherRemarks).trim() : ''
      const startDate = normalizeAssignmentDate(detail.startDate)
      const endDate = normalizeAssignmentDate(detail.endDate)
      const detailPayload = {
        memberHandle: handle
      }
      if (payloadAssignedMemberIds[index] != null) {
        detailPayload.memberId = String(payloadAssignedMemberIds[index])
      }
      if (startDate) {
        detailPayload.startDate = startDate
      }
      if (endDate) {
        detailPayload.endDate = endDate
      }
      if (normalizedRate) {
        detailPayload.agreementRate = normalizedRate
      }
      if (normalizedOtherRemarks) {
        detailPayload.otherRemarks = normalizedOtherRemarks
      }
      return detailPayload
    })
    const hasAssignmentDetails = payloadAssignmentDetails.some((detail) => (
      detail.startDate || detail.endDate || detail.agreementRate || detail.otherRemarks
    ))

    if (engagement.isPrivate && payloadAssignedMemberHandles.length) {
      payload.assignedMemberHandles = payloadAssignedMemberHandles
      if (hasCompleteAssignedMemberIds) {
        payload.assignedMemberIds = payloadAssignedMemberIds
      }
      if (hasAssignmentDetails) {
        payload.assignmentDetails = payloadAssignmentDetails
      }
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
        ? [...assignedMembers, ...assignedMemberHandles]
        : assignedMemberHandles
    if (!memberCandidates.length) {
      return
    }
    const handlesToLookup = memberCandidates.reduce((acc, member) => {
      const handle = getMemberHandle(member)
      const id = normalizeMemberId(getMemberId(member))
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
        const id = normalizeMemberId(profile && (profile.userId || profile.id || profile.memberId))
        return { handle, id }
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
    const { match, isLoading } = this.props
    const engagementId = _.get(match.params, 'engagementId', null)
    const isNew = !engagementId
    const assignedMembersForPayment = this.getAssignedMembersForPayment()

    return (
      <EngagementEditor
        projectId={this.getProjectId(match)}
        engagement={this.state.engagement}
        isNew={isNew}
        isLoading={isLoading}
        isSaving={this.state.isSaving}
        canEdit={this.canEdit()}
        submitTriggered={this.state.submitTriggered}
        validationErrors={this.state.validationErrors}
        showDeleteModal={this.state.showDeleteModal}
        resolvedAssignedMembers={assignedMembersForPayment}
        onToggleDelete={this.onToggleDelete}
        onUpdateInput={this.onUpdateInput}
        onUpdateDescription={this.onUpdateDescription}
        onUpdateSkills={this.onUpdateSkills}
        onSavePublish={this.onSavePublish}
        onCancel={this.onCancel}
        onDelete={this.onDelete}
      />
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
