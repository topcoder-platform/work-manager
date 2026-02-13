import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EngagementPayment from '../../components/EngagementPayment'
import { loadEngagementDetails } from '../../actions/engagements'
import { createMemberPayment, fetchAssignmentPayments } from '../../actions/payments'
import { loadProject } from '../../actions/projects'
import { toastFailure, toastSuccess } from '../../util/toaster'
import { fetchProfile } from '../../services/user'
import { updateEngagementAssignmentStatus } from '../../services/engagements'
import { normalizeEngagement as normalizeEngagementShape } from '../../util/engagements'

const getEmptyEngagement = () => ({
  id: null,
  title: '',
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

const getMemberId = (member) => {
  if (!member || typeof member === 'string') {
    return null
  }
  return normalizeMemberId(member.id || member.memberId || member.member_id || member.userId || null)
}

const getAgreementRate = (member) => {
  if (!member || typeof member !== 'object') {
    return null
  }
  return member.agreementRate ||
    member.agreement_rate ||
    member.rate ||
    member.agreedRate ||
    null
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

const getProjectIdFromProps = (props) => {
  const projectId = props.projectId || _.get(props, 'match.params.projectId', null)
  return projectId ? parseInt(projectId, 10) : null
}

const getEngagementIdFromProps = (props) => (
  props.engagementId || _.get(props, 'match.params.engagementId', null)
)

const normalizeEngagement = (details) => {
  const normalized = normalizeEngagementShape(details)
  const assignments = Array.isArray(normalized.assignments) ? normalized.assignments : []
  const assignedMembersFromAssignments = assignments.map((assignment) => assignment.memberId).filter(Boolean)
  const assignedMemberHandlesFromAssignments = assignments.map((assignment) => assignment.memberHandle).filter(Boolean)
  const assignedMembers = assignedMembersFromAssignments.length
    ? assignedMembersFromAssignments
    : (normalized.assignedMembers || [])
  const legacyAssignedMemberHandles = normalized.assignedMemberHandle
    ? [normalized.assignedMemberHandle]
    : []
  const normalizedAssignedMemberHandles = Array.isArray(normalized.assignedMemberHandles)
    ? normalized.assignedMemberHandles
    : []
  const assignedMemberHandles = assignedMemberHandlesFromAssignments.length
    ? assignedMemberHandlesFromAssignments
    : (normalizedAssignedMemberHandles.length ? normalizedAssignedMemberHandles : legacyAssignedMemberHandles)
  return {
    ...getEmptyEngagement(),
    ...normalized,
    assignments,
    assignedMembers,
    assignedMemberHandles
  }
}

const buildAssignmentPatch = (assignmentUpdate = {}, fallback = {}) => {
  const patch = {
    status: assignmentUpdate.status || fallback.status,
    terminationReason: Object.prototype.hasOwnProperty.call(assignmentUpdate, 'terminationReason')
      ? assignmentUpdate.terminationReason
      : Object.prototype.hasOwnProperty.call(assignmentUpdate, 'termination_reason')
        ? assignmentUpdate.termination_reason
        : fallback.terminationReason,
    otherRemarks: Object.prototype.hasOwnProperty.call(assignmentUpdate, 'otherRemarks')
      ? assignmentUpdate.otherRemarks
      : Object.prototype.hasOwnProperty.call(assignmentUpdate, 'other_remarks')
        ? assignmentUpdate.other_remarks
        : fallback.otherRemarks,
    startDate: assignmentUpdate.startDate || assignmentUpdate.start_date || fallback.startDate,
    endDate: assignmentUpdate.endDate || assignmentUpdate.end_date || fallback.endDate,
    updatedAt: assignmentUpdate.updatedAt || fallback.updatedAt
  }
  return Object.keys(patch).reduce((acc, key) => {
    if (!_.isUndefined(patch[key])) {
      acc[key] = patch[key]
    }
    return acc
  }, {})
}

const applyAssignmentUpdate = (engagement, assignmentId, assignmentUpdate = {}, fallback = {}) => {
  if (!engagement || typeof engagement !== 'object') {
    return engagement
  }
  if (_.isNil(assignmentId) || assignmentId === '') {
    return engagement
  }
  const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []
  if (!assignments.length) {
    return engagement
  }

  const assignmentIdText = `${assignmentId}`
  const assignmentPatch = buildAssignmentPatch(assignmentUpdate, fallback)
  let wasUpdated = false

  const updatedAssignments = assignments.map((assignment) => {
    if (`${_.get(assignment, 'id', '')}` !== assignmentIdText) {
      return assignment
    }
    wasUpdated = true
    return {
      ...assignment,
      ...assignmentPatch
    }
  })

  if (!wasUpdated) {
    return engagement
  }

  return normalizeEngagement({
    ...engagement,
    assignments: updatedAssignments
  })
}

class EngagementPaymentContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      engagement: getEmptyEngagement(),
      showPaymentModal: false,
      selectedMember: null,
      memberIdLookup: {},
      terminatingAssignments: {},
      completingAssignments: {},
      lastSyncedEngagementDetails: null
    }

    this.onOpenPaymentModal = this.onOpenPaymentModal.bind(this)
    this.onClosePaymentModal = this.onClosePaymentModal.bind(this)
    this.onSubmitPayment = this.onSubmitPayment.bind(this)
    this.resolveMemberIds = this.resolveMemberIds.bind(this)
    this.fetchPaymentsForAssignments = this.fetchPaymentsForAssignments.bind(this)
    this.getPaymentEntries = this.getPaymentEntries.bind(this)
    this.onTerminateAssignment = this.onTerminateAssignment.bind(this)
    this.onCompleteAssignment = this.onCompleteAssignment.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const engagementId = getEngagementIdFromProps(nextProps)
    const nextEngagementDetails = nextProps.engagementDetails
    const nextEngagementDetailsId = _.get(nextEngagementDetails, 'id', null)

    if (
      engagementId &&
      nextEngagementDetailsId &&
      `${nextEngagementDetailsId}` === `${engagementId}` &&
      prevState.lastSyncedEngagementDetails !== nextEngagementDetails
    ) {
      const normalizedEngagement = normalizeEngagement(nextEngagementDetails)
      if (_.isEqual(prevState.engagement, normalizedEngagement)) {
        return { lastSyncedEngagementDetails: nextEngagementDetails }
      }
      return {
        engagement: normalizedEngagement,
        lastSyncedEngagementDetails: nextEngagementDetails
      }
    }

    return null
  }

  componentDidMount () {
    const projectId = this.getProjectId()
    const engagementId = this.getEngagementId()
    if (projectId) {
      this.props.loadProject(projectId)
    }
    if (projectId && engagementId) {
      this.props.loadEngagementDetails(projectId, engagementId)
    }
    if (this.state.engagement.id) {
      this.resolveMemberIds(this.state.engagement)
    }
    this.fetchPaymentsForAssignments(this.getPaymentEntries(this.state.engagement))
  }

  componentDidUpdate (prevProps) {
    const projectId = this.getProjectId()
    const prevProjectId = getProjectIdFromProps(prevProps)
    const engagementId = this.getEngagementId()
    const prevEngagementId = getEngagementIdFromProps(prevProps)
    const { engagementDetails } = this.props
    const nextEngagementDetailsId = _.get(engagementDetails, 'id', null)

    if (projectId && projectId !== prevProjectId) {
      this.props.loadProject(projectId)
    }

    if (engagementId && engagementId !== prevEngagementId) {
      this.props.loadEngagementDetails(projectId, engagementId)
    }

    if (
      engagementId &&
      engagementDetails &&
      nextEngagementDetailsId &&
      `${nextEngagementDetailsId}` === `${engagementId}` &&
      engagementDetails !== prevProps.engagementDetails
    ) {
      const normalizedEngagement = normalizeEngagement(engagementDetails)
      this.resolveMemberIds(normalizedEngagement)
      this.fetchPaymentsForAssignments(this.getPaymentEntries(normalizedEngagement))
    }
  }

  getProjectId () {
    const { projectId, match } = this.props
    return getProjectIdFromProps({ projectId, match })
  }

  getEngagementId () {
    const { engagementId, match } = this.props
    return getEngagementIdFromProps({ engagementId, match })
  }

  onOpenPaymentModal (member) {
    const assignmentId = _.get(member, 'assignmentId', null)
    if (_.isNil(assignmentId) || assignmentId === '') {
      toastFailure('Error', 'Assignment ID is required to create a payment')
      return
    }
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

  async onSubmitPayment (member, paymentTitle, amount, remarks) {
    const { selectedMember } = this.state
    const {
      payments,
      projectDetail,
      currentBillingAccount,
      createMemberPayment,
      fetchAssignmentPayments
    } = this.props
    if (payments && payments.isProcessing) {
      return
    }
    const memberToPay = member || selectedMember
    if (!memberToPay) {
      toastFailure('Error', 'Member is required to create a payment')
      return
    }
    const memberHandle = getMemberHandle(memberToPay)
    const agreementRate = getAgreementRate(memberToPay)
    let memberId = getMemberId(memberToPay)
    const assignmentIdFromMember = _.get(memberToPay, 'assignmentId', null)
    if (!memberId && memberHandle) {
      try {
        const profile = await fetchProfile(memberHandle)
        memberId = normalizeMemberId(profile && (profile.userId || profile.id || profile.memberId))
      } catch (error) {
        // Keep memberId unset to fall through to validation error.
      }
    }
    if (!memberId) {
      toastFailure('Error', 'Member ID is required to create a payment')
      return
    }
    const assignmentId = assignmentIdFromMember
    if (_.isNil(assignmentId) || assignmentId === '') {
      toastFailure('Error', 'Assignment ID is required to create a payment')
      return
    }
    const projectBillingAccountId = _.get(projectDetail, 'billingAccountId', null)
    const billingAccountId = (_.isNil(projectBillingAccountId) || projectBillingAccountId === '')
      ? currentBillingAccount
      : projectBillingAccountId
    if (!billingAccountId) {
      toastFailure('Error', 'Billing account is required to create a payment')
      return
    }
    if (!window.confirm('Are you sure you want to submit this payment?')) {
      return
    }
    try {
      await createMemberPayment(
        assignmentId,
        memberId,
        memberHandle,
        paymentTitle,
        remarks,
        agreementRate,
        amount,
        billingAccountId
      )
      if (fetchAssignmentPayments) {
        fetchAssignmentPayments(assignmentId)
      }
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
        const id = normalizeMemberId(profile && (profile.userId || profile.id || profile.memberId))
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

  async onTerminateAssignment (member, terminationReason = '') {
    const assignmentId = _.get(member, 'assignmentId', null)
    if (_.isNil(assignmentId) || assignmentId === '') {
      toastFailure('Error', 'Assignment ID is required to terminate an assignment')
      return false
    }

    const memberHandle = getMemberHandle(member) || 'this member'
    this.setState((prevState) => ({
      terminatingAssignments: {
        ...prevState.terminatingAssignments,
        [assignmentId]: true
      }
    }))

    try {
      const response = await updateEngagementAssignmentStatus(
        this.getEngagementId(),
        assignmentId,
        'TERMINATED',
        terminationReason
      )
      const assignmentUpdate = _.get(response, 'data', response)
      this.setState((prevState) => ({
        engagement: applyAssignmentUpdate(
          prevState.engagement,
          assignmentId,
          assignmentUpdate,
          { status: 'TERMINATED', terminationReason }
        )
      }))
      toastSuccess('Success', `Assignment for ${memberHandle} terminated.`)
      return true
    } catch (error) {
      toastFailure('Error', (error && error.message) || 'Failed to terminate assignment')
      return false
    } finally {
      this.setState((prevState) => {
        const next = { ...prevState.terminatingAssignments }
        delete next[assignmentId]
        return { terminatingAssignments: next }
      })
    }
  }

  async onCompleteAssignment (member) {
    const assignmentId = _.get(member, 'assignmentId', null)
    if (_.isNil(assignmentId) || assignmentId === '') {
      toastFailure('Error', 'Assignment ID is required to complete an assignment')
      return false
    }

    const memberHandle = getMemberHandle(member) || 'this member'
    this.setState((prevState) => ({
      completingAssignments: {
        ...prevState.completingAssignments,
        [assignmentId]: true
      }
    }))

    try {
      const response = await updateEngagementAssignmentStatus(
        this.getEngagementId(),
        assignmentId,
        'COMPLETED'
      )
      const assignmentUpdate = _.get(response, 'data', response)
      this.setState((prevState) => ({
        engagement: applyAssignmentUpdate(
          prevState.engagement,
          assignmentId,
          assignmentUpdate,
          { status: 'COMPLETED' }
        )
      }))
      toastSuccess('Success', `Assignment for ${memberHandle} marked as completed.`)
      return true
    } catch (error) {
      toastFailure('Error', (error && error.message) || 'Failed to complete assignment')
      return false
    } finally {
      this.setState((prevState) => {
        const next = { ...prevState.completingAssignments }
        delete next[assignmentId]
        return { completingAssignments: next }
      })
    }
  }

  getPaymentEntries (engagement) {
    if (!engagement) {
      return []
    }
    const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []
    if (assignments.length) {
      return assignments
    }
    const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
    return assignedMembers.filter((member) => member && typeof member === 'object' && !Array.isArray(member))
  }

  fetchPaymentsForAssignments (entries) {
    const { fetchAssignmentPayments, paymentsByAssignment } = this.props
    if (!Array.isArray(entries) || !entries.length) {
      return
    }
    entries.forEach((entry) => {
      if (!entry) {
        return
      }
      const assignmentId = Object.prototype.hasOwnProperty.call(entry, 'assignmentId')
        ? _.get(entry, 'assignmentId', null)
        : (Object.prototype.hasOwnProperty.call(entry, 'memberId') ||
          Object.prototype.hasOwnProperty.call(entry, 'memberHandle') ||
          Object.prototype.hasOwnProperty.call(entry, 'engagementId'))
          ? _.get(entry, 'id', null)
          : null
      if (_.isNil(assignmentId) || assignmentId === '') {
        return
      }
      const currentEntry = paymentsByAssignment && paymentsByAssignment[assignmentId]
      if (currentEntry && currentEntry.isLoading) {
        return
      }
      fetchAssignmentPayments(assignmentId)
    })
  }

  getAssignedMembersForPayment () {
    const { engagement } = this.state
    const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []

    if (assignments.length > 0) {
      return assignments.map((assignment, index) => {
        const normalizedMember = normalizeMemberInfo(assignment, index, this.state.memberIdLookup)
        return {
          ...normalizedMember,
          key: assignment.id || normalizedMember.key || `assignment-${index}`,
          assignmentId: assignment.id
        }
      })
    }

    const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
    const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles) ? engagement.assignedMemberHandles : []
    const memberCandidates = assignedMembers.length ? assignedMembers : assignedMemberHandles
    return memberCandidates.map((member, index) => normalizeMemberInfo(member, index, this.state.memberIdLookup))
  }

  render () {
    const projectId = this.getProjectId()
    const engagementId = this.getEngagementId()
    const { isLoading, payments, paymentsByAssignment, projectDetail } = this.props
    const assignedMembersForPayment = this.getAssignedMembersForPayment()
    const isPaymentProcessing = Boolean(payments && payments.isProcessing)
    const shouldShowPaymentModal = this.state.showPaymentModal && this.state.selectedMember
    const projectName = _.get(projectDetail, 'name', '')

    return (
      <EngagementPayment
        engagement={this.state.engagement}
        projectName={projectName}
        assignedMembers={assignedMembersForPayment}
        isLoading={isLoading}
        isPaymentProcessing={isPaymentProcessing}
        paymentsByAssignment={paymentsByAssignment}
        terminatingAssignments={this.state.terminatingAssignments}
        completingAssignments={this.state.completingAssignments}
        projectId={projectId}
        engagementId={engagementId}
        showPaymentModal={shouldShowPaymentModal}
        selectedMember={this.state.selectedMember}
        onOpenPaymentModal={this.onOpenPaymentModal}
        onClosePaymentModal={this.onClosePaymentModal}
        onSubmitPayment={this.onSubmitPayment}
        onTerminateAssignment={this.onTerminateAssignment}
        onCompleteAssignment={this.onCompleteAssignment}
      />
    )
  }
}

EngagementPaymentContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
      engagementId: PropTypes.string
    })
  }),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  engagementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  engagementDetails: PropTypes.shape(),
  isLoading: PropTypes.bool,
  payments: PropTypes.shape({
    isProcessing: PropTypes.bool
  }),
  paymentsByAssignment: PropTypes.objectOf(PropTypes.shape({
    isLoading: PropTypes.bool,
    payments: PropTypes.arrayOf(PropTypes.object),
    error: PropTypes.string
  })),
  projectDetail: PropTypes.shape({
    name: PropTypes.string,
    billingAccountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  currentBillingAccount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loadEngagementDetails: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired,
  createMemberPayment: PropTypes.func.isRequired,
  fetchAssignmentPayments: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  engagementDetails: state.engagements.engagementDetails,
  isLoading: state.engagements.isLoading,
  projectDetail: state.projects.projectDetail,
  currentBillingAccount: state.projects.currentBillingAccount,
  payments: state.payments,
  paymentsByAssignment: state.payments.paymentsByAssignment
})

const mapDispatchToProps = {
  loadEngagementDetails,
  loadProject,
  createMemberPayment,
  fetchAssignmentPayments
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementPaymentContainer)
)
