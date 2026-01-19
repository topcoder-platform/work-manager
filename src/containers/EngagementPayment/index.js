import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EngagementPayment from '../../components/EngagementPayment'
import { loadEngagementDetails } from '../../actions/engagements'
import { createMemberPayment } from '../../actions/payments'
import { loadProject } from '../../actions/projects'
import { toastFailure } from '../../util/toaster'
import { fetchProfile } from '../../services/user'
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

class EngagementPaymentContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      engagement: getEmptyEngagement(),
      showPaymentModal: false,
      selectedMember: null,
      memberIdLookup: {}
    }

    this.onOpenPaymentModal = this.onOpenPaymentModal.bind(this)
    this.onClosePaymentModal = this.onClosePaymentModal.bind(this)
    this.onSubmitPayment = this.onSubmitPayment.bind(this)
    this.resolveMemberIds = this.resolveMemberIds.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const engagementId = getEngagementIdFromProps(nextProps)
    const nextEngagementDetailsId = _.get(nextProps.engagementDetails, 'id', null)

    if (
      engagementId &&
      nextEngagementDetailsId &&
      `${nextEngagementDetailsId}` === `${engagementId}` &&
      `${prevState.engagement.id}` !== `${nextEngagementDetailsId}`
    ) {
      return { engagement: normalizeEngagement(nextProps.engagementDetails) }
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
      this.resolveMemberIds(normalizeEngagement(engagementDetails))
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
        memberId = normalizeMemberId(profile && (profile.userId || profile.id || profile.memberId))
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
    const { isLoading, payments } = this.props
    const assignedMembersForPayment = this.getAssignedMembersForPayment()
    const isPaymentProcessing = Boolean(payments && payments.isProcessing)
    const shouldShowPaymentModal = this.state.showPaymentModal && this.state.selectedMember

    return (
      <EngagementPayment
        engagement={this.state.engagement}
        assignedMembers={assignedMembersForPayment}
        isLoading={isLoading}
        isPaymentProcessing={isPaymentProcessing}
        projectId={projectId}
        showPaymentModal={shouldShowPaymentModal}
        selectedMember={this.state.selectedMember}
        onOpenPaymentModal={this.onOpenPaymentModal}
        onClosePaymentModal={this.onClosePaymentModal}
        onSubmitPayment={this.onSubmitPayment}
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
  projectDetail: PropTypes.shape({
    billingAccountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  loadEngagementDetails: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired,
  createMemberPayment: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  engagementDetails: state.engagements.engagementDetails,
  isLoading: state.engagements.isLoading,
  projectDetail: state.projects.projectDetail,
  payments: state.payments
})

const mapDispatchToProps = {
  loadEngagementDetails,
  loadProject,
  createMemberPayment
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementPaymentContainer)
)
