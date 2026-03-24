import React, { useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { PrimaryButton, OutlineButton } from '../Buttons'
import Loader from '../Loader'
import Modal from '../Modal'
import PaymentForm from '../PaymentForm'
import DateInput from '../DateInput'
import styles from './EngagementPayment.module.scss'
import { serializeTentativeAssignmentDate } from '../../util/assignmentDates'
import {
  calculateAssignmentRatePerWeek,
  toPositiveInteger,
  toPositiveNumber
} from '../../util/assignmentRates'

// The shared DateInput uses date-fns tokens; uppercase moment-style tokens prevent the calendar from opening.
const INPUT_DATE_FORMAT = 'MM/dd/yyyy'
const INPUT_TIME_FORMAT = false

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const formatCurrency = (value) => {
  if (value == null || value === '') {
    return '-'
  }
  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return String(value)
  }
  return currencyFormatter.format(parsed)
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

const getPaymentAmount = (payment) => {
  if (!payment) {
    return null
  }
  if (payment.amount != null) {
    return payment.amount
  }
  if (payment.totalAmount != null) {
    return payment.totalAmount
  }
  if (payment.grossAmount != null) {
    return payment.grossAmount
  }
  if (Array.isArray(payment.details) && payment.details.length) {
    const detail = payment.details[0]
    return detail.totalAmount || detail.grossAmount || detail.amount || null
  }
  return null
}

const getPaymentTitle = (payment) => {
  if (!payment) {
    return 'Payment'
  }
  return payment.title || payment.description || payment.paymentTitle || 'Payment'
}

const getPaymentStatus = (payment) => {
  if (!payment) {
    return 'Unknown'
  }
  return payment.status || payment.paymentStatus || payment.state || 'Unknown'
}

const getPaymentDate = (payment) => {
  if (!payment) {
    return null
  }
  return payment.createdAt || payment.updatedAt || payment.date || payment.created || payment.updated || null
}

const getPaymentRemarks = (payment) => {
  if (!payment) {
    return ''
  }
  const attributes = payment.attributes && typeof payment.attributes === 'object'
    ? payment.attributes
    : null
  const value = attributes && Object.prototype.hasOwnProperty.call(attributes, 'remarks')
    ? attributes.remarks
    : payment.remarks
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

/**
 * Resolves the optional hours-worked value returned for a payment.
 *
 * @param {Object|null|undefined} payment Payment record returned by the finance API.
 * @returns {string} Formatted hours-worked value, or an empty string when the
 * field is unavailable.
 */
const getPaymentHoursWorked = (payment) => {
  if (!payment) {
    return ''
  }

  const attributes = payment.attributes && typeof payment.attributes === 'object'
    ? payment.attributes
    : null
  const detail = Array.isArray(payment.details) && payment.details.length
    ? payment.details[0]
    : null
  const value = payment.hoursWorked != null
    ? payment.hoursWorked
    : attributes && Object.prototype.hasOwnProperty.call(attributes, 'hoursWorked')
      ? attributes.hoursWorked
      : detail && detail.hoursWorked != null
        ? detail.hoursWorked
        : null

  if (value == null || value === '') {
    return ''
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return ''
  }

  return Number(parsed.toFixed(2)).toString()
}

const getAssignmentStatus = (member) => {
  if (!member || typeof member !== 'object') {
    return ''
  }
  return member.assignmentStatus ||
    member.assignment_status ||
    member.assignmentState ||
    member.status ||
    ''
}

const normalizeAssignmentStatus = (status) => {
  if (!status) {
    return ''
  }
  const normalized = status.toString().trim()
  if (!normalized) {
    return ''
  }
  const withSpaces = normalized
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return withSpaces
    .split(' ')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : ''))
    .join(' ')
}

const getAssignmentRate = (member) => {
  if (!member || typeof member !== 'object') {
    return ''
  }
  return member.agreementRate ||
    member.agreement_rate ||
    member.rate ||
    member.agreedRate ||
    ''
}

const getRatePerHour = (member) => {
  if (!member || typeof member !== 'object') {
    return ''
  }
  return member.ratePerHour ||
    member.rate_per_hour ||
    ''
}

const getStandardHoursPerWeek = (member) => {
  if (!member || typeof member !== 'object') {
    return ''
  }
  return member.standardHoursPerWeek != null
    ? member.standardHoursPerWeek
    : member.standard_hours_per_week != null
      ? member.standard_hours_per_week
      : ''
}

const getDurationMonths = (member) => {
  if (!member || typeof member !== 'object') {
    return ''
  }
  return member.durationMonths != null
    ? member.durationMonths
    : member.duration_months != null
      ? member.duration_months
      : ''
}

const getAssignmentDate = (member, key) => {
  if (!member || typeof member !== 'object') {
    return null
  }
  if (key === 'start') {
    return member.startDate || member.start_date || member.start || null
  }
  if (key === 'end') {
    return member.endDate || member.end_date || member.end || null
  }
  return null
}

const getAssignmentRemarks = (member) => {
  if (!member || typeof member !== 'object') {
    return ''
  }
  const value = member.otherRemarks != null
    ? member.otherRemarks
    : member.other_remarks != null
      ? member.other_remarks
      : member.remarks
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

/**
 * Converts an assignment row into editable modal field values.
 *
 * @param {Object|null|undefined} member Assignment row rendered on the page.
 * @returns {{startDate: *, durationMonths: string, ratePerHour: string, standardHoursPerWeek: string, otherRemarks: string}}
 * Seed values for the edit-assignment modal.
 */
const createEditAssignmentState = (member) => {
  const startDate = getAssignmentDate(member, 'start')
  const parsedStartDate = startDate ? new Date(startDate) : null

  return {
    startDate: parsedStartDate && !Number.isNaN(parsedStartDate.getTime())
      ? parsedStartDate
      : (startDate || null),
    durationMonths: getDurationMonths(member) !== '' && getDurationMonths(member) != null
      ? String(getDurationMonths(member))
      : '',
    ratePerHour: getRatePerHour(member) !== '' && getRatePerHour(member) != null
      ? String(getRatePerHour(member))
      : '',
    standardHoursPerWeek: getStandardHoursPerWeek(member) !== '' && getStandardHoursPerWeek(member) != null
      ? String(getStandardHoursPerWeek(member))
      : '',
    otherRemarks: getAssignmentRemarks(member)
  }
}

const formatDurationMonths = (value) => {
  if (value == null || value === '') {
    return '-'
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return String(value)
  }
  return `${parsed} month${parsed === 1 ? '' : 's'}`
}

const renderMetaValue = (value, isRequired = false) => {
  if (value == null || value === '' || value === '-') {
    return (
      <span className={isRequired ? styles.requiredMetaValue : styles.mutedMetaValue}>
        {isRequired ? 'Required' : '-'}
      </span>
    )
  }

  return value
}

/**
 * Displays assignment payment controls and history for engagement members.
 * Payment history is available for any assignment status as long as an
 * assignment ID is present.
 */
const EngagementPayment = ({
  engagement,
  projectName,
  assignedMembers,
  isLoading,
  isPaymentProcessing,
  paymentsByAssignment,
  terminatingAssignments,
  completingAssignments,
  updatingAssignments,
  projectId,
  engagementId,
  showPaymentModal,
  selectedMember,
  onOpenPaymentModal,
  onClosePaymentModal,
  onSubmitPayment,
  onTerminateAssignment,
  onCompleteAssignment,
  onSaveAssignment
}) => {
  const [paymentHistoryMember, setPaymentHistoryMember] = useState(null)
  const [remarksMember, setRemarksMember] = useState(null)
  const [completionMember, setCompletionMember] = useState(null)
  const [terminationMember, setTerminationMember] = useState(null)
  const [terminationReason, setTerminationReason] = useState('')
  const [editMember, setEditMember] = useState(null)
  const [editStartDate, setEditStartDate] = useState(null)
  const [editDurationMonths, setEditDurationMonths] = useState('')
  const [editRatePerHour, setEditRatePerHour] = useState('')
  const [editStandardHoursPerWeek, setEditStandardHoursPerWeek] = useState('')
  const [editOtherRemarks, setEditOtherRemarks] = useState('')
  const [editErrors, setEditErrors] = useState({})

  if (isLoading && !(engagement && engagement.id)) {
    return <Loader />
  }

  const members = Array.isArray(assignedMembers) ? assignedMembers : []
  const hasMembers = members.length > 0
  const engagementTitle = engagement && engagement.title ? engagement.title : 'Engagement'
  const resolvedEngagementId = engagementId != null ? engagementId : (engagement && engagement.id != null ? engagement.id : null)
  const showEngagementLinks = Boolean(projectId && resolvedEngagementId)
  const feedbackUrl = showEngagementLinks
    ? `/projects/${projectId}/engagements/${resolvedEngagementId}/feedback`
    : null
  const experienceUrl = showEngagementLinks
    ? `/projects/${projectId}/engagements/${resolvedEngagementId}/experience`
    : null

  const closeRemarksModal = () => {
    setRemarksMember(null)
  }

  const closeEditModal = () => {
    setEditMember(null)
    setEditStartDate(null)
    setEditDurationMonths('')
    setEditRatePerHour('')
    setEditStandardHoursPerWeek('')
    setEditOtherRemarks('')
    setEditErrors({})
  }

  const openRemarksModal = (member) => {
    const remarks = getAssignmentRemarks(member)
    if (!remarks) {
      return
    }
    setRemarksMember(member)
  }

  const closePaymentHistoryModal = () => {
    setPaymentHistoryMember(null)
  }

  const openPaymentHistoryModal = (member) => {
    const assignmentId = member && member.assignmentId != null ? member.assignmentId : null
    if (assignmentId == null || assignmentId === '') {
      return
    }
    setPaymentHistoryMember(member)
  }

  const openEditModal = (member) => {
    const nextState = createEditAssignmentState(member)
    setEditMember(member)
    setEditStartDate(nextState.startDate)
    setEditDurationMonths(nextState.durationMonths)
    setEditRatePerHour(nextState.ratePerHour)
    setEditStandardHoursPerWeek(nextState.standardHoursPerWeek)
    setEditOtherRemarks(nextState.otherRemarks)
    setEditErrors({})
  }

  const closeTerminationModal = () => {
    setTerminationMember(null)
    setTerminationReason('')
  }

  const closeCompletionModal = () => {
    setCompletionMember(null)
  }

  const openCompletionModal = (member) => {
    setCompletionMember(member)
  }

  const openTerminationModal = (member) => {
    setTerminationMember(member)
    setTerminationReason('')
  }

  const submitCompletion = async () => {
    if (!completionMember) {
      return
    }
    const wasSuccessful = await onCompleteAssignment(completionMember)
    if (wasSuccessful) {
      closeCompletionModal()
    }
  }

  const submitTermination = async () => {
    if (!terminationMember) {
      return
    }
    const trimmedReason = terminationReason.trim()
    if (!trimmedReason) {
      return
    }
    const wasSuccessful = await onTerminateAssignment(
      terminationMember,
      trimmedReason
    )
    if (wasSuccessful) {
      closeTerminationModal()
    }
  }

  /**
   * Validates and submits edited assignment details for the currently selected
   * assignment.
   *
   * @returns {Promise<void>} Resolves after the modal save attempt completes.
   */
  const submitEdit = async () => {
    if (!editMember) {
      return
    }

    const nextErrors = {}
    const parsedStartDate = editStartDate ? moment(editStartDate) : null
    const hasDurationValue = editDurationMonths !== ''
    const parsedDurationMonths = hasDurationValue
      ? toPositiveInteger(editDurationMonths)
      : null
    const parsedRatePerHour = toPositiveNumber(editRatePerHour)
    const parsedStandardHoursPerWeek = toPositiveInteger(editStandardHoursPerWeek)
    const normalizedOtherRemarks = editOtherRemarks != null
      ? String(editOtherRemarks).trim()
      : ''

    if (!parsedStartDate || !parsedStartDate.isValid()) {
      nextErrors.startDate = 'Billing start date is required.'
    }
    if (hasDurationValue && parsedDurationMonths === null) {
      nextErrors.durationMonths = 'Duration must be a positive whole number.'
    }
    if (parsedRatePerHour === null) {
      nextErrors.ratePerHour = 'Rate per hour must be a positive number.'
    }
    if (parsedStandardHoursPerWeek === null) {
      nextErrors.standardHoursPerWeek = 'Standard hours per week must be a positive whole number.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors)
      return
    }

    const wasSuccessful = await onSaveAssignment(editMember, {
      startDate: serializeTentativeAssignmentDate(parsedStartDate),
      ...(parsedDurationMonths !== null ? { durationMonths: parsedDurationMonths } : {}),
      ratePerHour: parsedRatePerHour.toString(),
      standardHoursPerWeek: parsedStandardHoursPerWeek,
      agreementRate: calculateAssignmentRatePerWeek(
        parsedRatePerHour,
        parsedStandardHoursPerWeek
      ),
      ...(normalizedOtherRemarks ? { otherRemarks: normalizedOtherRemarks } : {})
    })

    if (wasSuccessful) {
      closeEditModal()
    }
  }

  const renderPaymentHistory = (member) => {
    const assignmentId = member && member.assignmentId != null ? member.assignmentId : null
    if (assignmentId == null || assignmentId === '') {
      return (
        <div className={styles.noPayments}>Payment history unavailable for this assignment.</div>
      )
    }
    const assignmentKey = String(assignmentId)
    const entry = paymentsByAssignment && paymentsByAssignment[assignmentKey]
      ? paymentsByAssignment[assignmentKey]
      : {}
    const isLoadingHistory = Boolean(entry.isLoading)
    const errorMessage = entry.error
    const payments = Array.isArray(entry.payments) ? entry.payments : []

    if (isLoadingHistory) {
      return (
        <div className={styles.paymentLoading}>
          <Loader />
          <span>Loading payment history...</span>
        </div>
      )
    }

    if (errorMessage) {
      return <div className={styles.paymentError}>{errorMessage}</div>
    }

    if (!payments.length) {
      return <div className={styles.noPayments}>No payments yet.</div>
    }

    return (
      <div className={styles.paymentList}>
        {payments.map((payment, index) => {
          const paymentKey = payment.id || payment.paymentId || `${assignmentKey}-${index}`
          const amount = formatCurrency(getPaymentAmount(payment))
          const date = formatDate(getPaymentDate(payment))
          const status = getPaymentStatus(payment)
          const normalizedStatus = typeof status === 'string' ? status.trim().toLowerCase() : ''
          const showStatus = normalizedStatus && normalizedStatus !== 'unknown'
          const title = getPaymentTitle(payment)
          const remarks = getPaymentRemarks(payment)
          const hoursWorked = getPaymentHoursWorked(payment)
          return (
            <div key={paymentKey} className={styles.paymentItem}>
              <div className={styles.paymentAmount}>{amount}</div>
              <div className={styles.paymentDetails}>
                <div className={styles.paymentTitle}>{title}</div>
                {remarks && <div className={styles.paymentRemarks}>{remarks}</div>}
                {hoursWorked && (
                  <div className={styles.paymentHoursWorked}>
                    {`Hours Worked: ${hoursWorked}`}
                  </div>
                )}
                <div className={styles.paymentMeta}>
                  <span className={styles.paymentDate}>{date}</span>
                  {showStatus && <span className={styles.paymentStatus}>{status}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const terminationAssignmentId = terminationMember && terminationMember.assignmentId != null
    ? String(terminationMember.assignmentId)
    : null
  const terminationHandle = terminationMember
    ? (terminationMember.handle || terminationMember.memberHandle || '-')
    : '-'
  const isTerminationProcessing = terminationAssignmentId && terminatingAssignments
    ? Boolean(terminatingAssignments[terminationAssignmentId])
    : false
  const isTerminationReasonValid = Boolean(terminationReason.trim())
  const completionAssignmentId = completionMember && completionMember.assignmentId != null
    ? String(completionMember.assignmentId)
    : null
  const completionHandle = completionMember
    ? (completionMember.handle || completionMember.memberHandle || '-')
    : '-'
  const isCompletionProcessing = completionAssignmentId && completingAssignments
    ? Boolean(completingAssignments[completionAssignmentId])
    : false
  const remarksHandle = remarksMember
    ? (remarksMember.handle || remarksMember.memberHandle || '-')
    : '-'
  const remarksContent = getAssignmentRemarks(remarksMember)
  const editAssignmentId = editMember && editMember.assignmentId != null
    ? String(editMember.assignmentId)
    : null
  const editHandle = editMember
    ? (editMember.handle || editMember.memberHandle || '-')
    : '-'
  const isEditProcessing = editAssignmentId && updatingAssignments
    ? Boolean(updatingAssignments[editAssignmentId])
    : false
  const editAssignmentRate = calculateAssignmentRatePerWeek(
    editRatePerHour,
    editStandardHoursPerWeek
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{engagementTitle} Assignees</div>
        <div className={styles.headerActions}>
          {showEngagementLinks && (
            <>
              <OutlineButton
                text='Feedback'
                type='info'
                link={feedbackUrl}
                className={styles.actionButton}
              />
              <OutlineButton
                text='Experience'
                type='info'
                link={experienceUrl}
                className={styles.actionButton}
              />
            </>
          )}
        </div>
      </div>
      {hasMembers ? (
        <div className={styles.membersList}>
          {members.map((member) => {
            const assignmentId = member && member.assignmentId != null ? member.assignmentId : null
            const assignmentKey = assignmentId != null && assignmentId !== '' ? String(assignmentId) : null
            const hasAssignmentId = Boolean(assignmentKey)
            const canPay = Boolean(member && member.id && hasAssignmentId && !isPaymentProcessing)
            const assignmentStatusRaw = getAssignmentStatus(member)
            const normalizedAssignmentStatus = normalizeAssignmentStatus(assignmentStatusRaw)
            const assignmentStatusLabel = normalizedAssignmentStatus || 'Unknown'
            const assignmentStatusLower = normalizedAssignmentStatus.toLowerCase()
            const isAssignedStatus = assignmentStatusLower === 'assigned'
            const isRowTerminating = assignmentKey && terminatingAssignments
              ? Boolean(terminatingAssignments[assignmentKey])
              : false
            const isRowCompleting = assignmentKey && completingAssignments
              ? Boolean(completingAssignments[assignmentKey])
              : false
            const isRowUpdating = assignmentKey && updatingAssignments
              ? Boolean(updatingAssignments[assignmentKey])
              : false
            const assignmentRemarks = getAssignmentRemarks(member)
            const assignmentRate = getAssignmentRate(member)
            const billingStartDate = formatDate(getAssignmentDate(member, 'start'))
            const durationMonths = formatDurationMonths(getDurationMonths(member))
            const ratePerHour = getRatePerHour(member)
            const standardHoursPerWeek = getStandardHoursPerWeek(member)
            const rateDisplay = assignmentRate !== '' && assignmentRate != null
              ? formatCurrency(assignmentRate)
              : '-'
            const ratePerHourDisplay = ratePerHour !== '' && ratePerHour != null
              ? formatCurrency(ratePerHour)
              : '-'

            return (
              <div key={member.key} className={styles.memberRow}>
                <div className={styles.memberRowHeader}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberHeader}>
                      <div className={styles.memberHandle}>{member.handle || '-'}</div>
                      <div className={styles.assignmentStatusGroup}>
                        <span
                          className={styles.assignmentStatus}
                          title={assignmentStatusRaw || assignmentStatusLabel}
                        >
                          {assignmentStatusLabel}
                        </span>
                        {isAssignedStatus && (
                          <button
                            type='button'
                            className={styles.editAssignmentButton}
                            onClick={() => openEditModal(member)}
                            disabled={!hasAssignmentId || isRowUpdating || isRowTerminating || isRowCompleting}
                            aria-label={`Edit assignment details for ${member.handle || 'member'}`}
                            title='Edit assignment details'
                            aria-haspopup='dialog'
                          >
                            <FontAwesomeIcon icon={faPencilAlt} className={styles.editAssignmentIcon} />
                          </button>
                        )}
                      </div>
                    </div>
                    {!member.id && (
                      <div className={styles.memberNote}>Resolving member ID...</div>
                    )}
                    {!hasAssignmentId && (
                      <div className={styles.memberNote}>Payment unavailable: missing assignment ID.</div>
                    )}
                    <div className={styles.memberMeta}>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>Other Remarks</span>
                        <span className={styles.memberMetaValue}>
                          {assignmentRemarks
                            ? (
                              <button
                                type='button'
                                className={styles.remarksButton}
                                onClick={() => openRemarksModal(member)}
                                aria-label={`View other remarks for ${member.handle || 'member'}`}
                                title='View other remarks'
                              >
                                <FontAwesomeIcon icon={faCommentAlt} className={styles.remarksIcon} />
                              </button>
                            )
                            : renderMetaValue('')}
                        </span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>
                          Billing Start Date
                          <span className={styles.requiredIndicator}>*</span>
                        </span>
                        <span className={styles.memberMetaValue}>
                          {renderMetaValue(billingStartDate, true)}
                        </span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>Duration</span>
                        <span className={styles.memberMetaValue}>
                          {renderMetaValue(durationMonths)}
                        </span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>
                          Rate per Hour
                          <span className={styles.requiredIndicator}>*</span>
                        </span>
                        <span className={styles.memberMetaValue}>
                          {renderMetaValue(ratePerHourDisplay, true)}
                        </span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>
                          Standard Hours per Week
                          <span className={styles.requiredIndicator}>*</span>
                        </span>
                        <span className={styles.memberMetaValue}>
                          {renderMetaValue(
                            standardHoursPerWeek !== '' && standardHoursPerWeek != null
                              ? `${standardHoursPerWeek}`
                              : '',
                            true
                          )}
                        </span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>Rate per Week</span>
                        <span className={styles.memberMetaValue}>{renderMetaValue(rateDisplay)}</span>
                      </div>
                    </div>
                    {assignmentStatusLower === 'terminated' && member.terminationReason && (
                      <div className={styles.memberTerminationReason}>
                        <span className={styles.memberMetaLabel}>Termination Reason</span>
                        <span className={styles.memberMetaValue}>{member.terminationReason}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.memberActions}>
                    {/* Payment history is available for any assignment status with an assignment ID. */}
                    {hasAssignmentId && (
                      <button
                        type='button'
                        className={styles.toggleButton}
                        onClick={() => openPaymentHistoryModal(member)}
                        disabled={!assignmentKey}
                        aria-haspopup='dialog'
                      >
                        Show Payment History
                      </button>
                    )}
                    {isAssignedStatus && (
                      <>
                        <PrimaryButton
                          text='Pay'
                          type='info'
                          className={styles.actionButton}
                          onClick={() => onOpenPaymentModal(member)}
                          disabled={!canPay || isRowUpdating}
                        />
                        <PrimaryButton
                          text={isRowCompleting ? 'Completing...' : 'Complete'}
                          type='success'
                          className={styles.actionButton}
                          onClick={() => openCompletionModal(member)}
                          disabled={!hasAssignmentId || isRowUpdating || isRowTerminating || isRowCompleting}
                        />
                        <PrimaryButton
                          text={isRowTerminating ? 'Terminating...' : 'Terminate'}
                          type='danger'
                          className={styles.actionButton}
                          onClick={() => openTerminationModal(member)}
                          disabled={!hasAssignmentId || isRowUpdating || isRowTerminating || isRowCompleting}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>No assigned members found.</div>
      )}
      {completionMember && (
        <Modal onCancel={closeCompletionModal}>
          <div className={styles.terminationModal}>
            <div className={styles.terminationTitle}>Complete Assignment</div>
            <div className={styles.terminationMessage}>
              {`Are you sure you want to mark the assignment for ${completionHandle} as completed on this engagement?`}
            </div>
            <div className={styles.terminationActions}>
              <OutlineButton
                text='Cancel'
                type='info'
                className={styles.terminationButton}
                onClick={closeCompletionModal}
              />
              <PrimaryButton
                text={isCompletionProcessing ? 'Completing...' : 'Complete'}
                type='success'
                className={styles.terminationButton}
                onClick={submitCompletion}
                disabled={isCompletionProcessing}
              />
            </div>
          </div>
        </Modal>
      )}
      {terminationMember && (
        <Modal onCancel={closeTerminationModal}>
          <div className={styles.terminationModal}>
            <div className={styles.terminationTitle}>Terminate Assignment</div>
            <div className={styles.terminationMessage}>
              {`Are you sure you want to terminate the assignment for ${terminationHandle} on this engagement?`}
            </div>
            <div className={styles.terminationField}>
              <label htmlFor='terminationReason' className={styles.terminationLabel}>
                Termination Reason (required)
              </label>
              <textarea
                id='terminationReason'
                className={styles.terminationTextarea}
                placeholder='Add a reason for terminating this assignment'
                value={terminationReason}
                onChange={(event) => setTerminationReason(event.target.value)}
              />
            </div>
            <div className={styles.terminationActions}>
              <OutlineButton
                text='Cancel'
                type='info'
                className={styles.terminationButton}
                onClick={closeTerminationModal}
              />
              <PrimaryButton
                text={isTerminationProcessing ? 'Terminating...' : 'Terminate'}
                type='danger'
                className={styles.terminationButton}
                onClick={submitTermination}
                disabled={isTerminationProcessing || !isTerminationReasonValid}
              />
            </div>
          </div>
        </Modal>
      )}
      {remarksMember && (
        <Modal onCancel={closeRemarksModal}>
          <div className={styles.remarksModal}>
            <div className={styles.remarksTitle}>Other Remarks</div>
            <div className={styles.remarksSubtitle}>{remarksHandle}</div>
            <div className={styles.remarksContent}>{remarksContent}</div>
            <div className={styles.remarksActions}>
              <OutlineButton
                text='Close'
                type='info'
                className={styles.remarksCloseButton}
                onClick={closeRemarksModal}
              />
            </div>
          </div>
        </Modal>
      )}
      {editMember && (
        <Modal onCancel={closeEditModal}>
          <div className={styles.editModal}>
            <div className={styles.editTitle}>Edit Assignment</div>
            <div className={styles.editSubtitle}>{editHandle}</div>
            <div className={styles.editGrid}>
              <div className={styles.editField}>
                <label className={styles.editLabel}>
                  Billing start date
                  <span className={styles.editRequired}>*</span>
                </label>
                <DateInput
                  className={styles.editDateInput}
                  value={editStartDate}
                  dateFormat={INPUT_DATE_FORMAT}
                  timeFormat={INPUT_TIME_FORMAT}
                  preventViewportOverflow
                  onChange={(value) => {
                    setEditStartDate(value)
                    if (editErrors.startDate) {
                      setEditErrors(prev => ({ ...prev, startDate: '' }))
                    }
                  }}
                />
                {editErrors.startDate && (
                  <div className={styles.editError}>{editErrors.startDate}</div>
                )}
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Duration (in months)</label>
                <input
                  className={styles.editInput}
                  type='number'
                  min='1'
                  step='1'
                  value={editDurationMonths}
                  onChange={(event) => {
                    setEditDurationMonths(event.target.value)
                    if (editErrors.durationMonths) {
                      setEditErrors(prev => ({ ...prev, durationMonths: '' }))
                    }
                  }}
                />
                {editErrors.durationMonths && (
                  <div className={styles.editError}>{editErrors.durationMonths}</div>
                )}
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>
                  Rate per hour
                  <span className={styles.editRequired}>*</span>
                </label>
                <input
                  className={styles.editInput}
                  type='number'
                  min='0.01'
                  step='0.01'
                  value={editRatePerHour}
                  onChange={(event) => {
                    setEditRatePerHour(event.target.value)
                    if (editErrors.ratePerHour) {
                      setEditErrors(prev => ({ ...prev, ratePerHour: '' }))
                    }
                  }}
                />
                {editErrors.ratePerHour && (
                  <div className={styles.editError}>{editErrors.ratePerHour}</div>
                )}
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>
                  Standard hours per week
                  <span className={styles.editRequired}>*</span>
                </label>
                <input
                  className={styles.editInput}
                  type='number'
                  min='1'
                  step='1'
                  value={editStandardHoursPerWeek}
                  onChange={(event) => {
                    setEditStandardHoursPerWeek(event.target.value)
                    if (editErrors.standardHoursPerWeek) {
                      setEditErrors(prev => ({ ...prev, standardHoursPerWeek: '' }))
                    }
                  }}
                />
                {editErrors.standardHoursPerWeek && (
                  <div className={styles.editError}>{editErrors.standardHoursPerWeek}</div>
                )}
              </div>
              <div className={styles.editFieldFull}>
                <label className={styles.editLabel}>Assignment rate per week</label>
                <input
                  className={styles.editInput}
                  type='text'
                  value={editAssignmentRate}
                  readOnly
                />
              </div>
              <div className={styles.editFieldFull}>
                <label className={styles.editLabel}>Other remarks</label>
                <textarea
                  className={styles.editTextarea}
                  rows={3}
                  value={editOtherRemarks}
                  onChange={(event) => setEditOtherRemarks(event.target.value)}
                />
              </div>
            </div>
            <div className={styles.editActions}>
              <OutlineButton
                text='Cancel'
                type='info'
                onClick={closeEditModal}
                disabled={isEditProcessing}
              />
              <PrimaryButton
                text={isEditProcessing ? 'Saving...' : 'Save'}
                type='info'
                onClick={submitEdit}
                disabled={isEditProcessing}
              />
            </div>
          </div>
        </Modal>
      )}
      {paymentHistoryMember && (
        <Modal onCancel={closePaymentHistoryModal}>
          <div className={styles.historyModal}>
            <div className={styles.historyModalHeader}>
              <div>
                <div className={styles.historyModalTitle}>Payment History</div>
                <div className={styles.historyModalSubtitle}>
                  {paymentHistoryMember.handle || '-'}
                </div>
              </div>
            </div>
            <div className={styles.historyModalBody}>
              {renderPaymentHistory(paymentHistoryMember)}
            </div>
          </div>
        </Modal>
      )}
      {showPaymentModal && (
        <Modal onCancel={onClosePaymentModal}>
          <PaymentForm
            engagement={engagement}
            projectName={projectName}
            member={selectedMember}
            availableMembers={members}
            isProcessing={isPaymentProcessing}
            onSubmit={onSubmitPayment}
            onCancel={onClosePaymentModal}
          />
        </Modal>
      )}
    </div>
  )
}

EngagementPayment.defaultProps = {
  engagement: null,
  projectName: '',
  assignedMembers: [],
  isLoading: false,
  isPaymentProcessing: false,
  paymentsByAssignment: {},
  terminatingAssignments: {},
  completingAssignments: {},
  updatingAssignments: {},
  projectId: null,
  engagementId: null,
  showPaymentModal: false,
  selectedMember: null,
  onOpenPaymentModal: () => {},
  onClosePaymentModal: () => {},
  onSubmitPayment: () => {},
  onTerminateAssignment: () => {},
  onCompleteAssignment: () => {},
  onSaveAssignment: () => {}
}

EngagementPayment.propTypes = {
  engagement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string
  }),
  projectName: PropTypes.string,
  assignedMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    assignmentStatus: PropTypes.string,
    termsAccepted: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),
    agreementRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ratePerHour: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    standardHoursPerWeek: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    durationMonths: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    terminationReason: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)])
  })),
  isLoading: PropTypes.bool,
  isPaymentProcessing: PropTypes.bool,
  paymentsByAssignment: PropTypes.objectOf(PropTypes.shape({
    isLoading: PropTypes.bool,
    payments: PropTypes.arrayOf(PropTypes.object),
    error: PropTypes.string
  })),
  terminatingAssignments: PropTypes.objectOf(PropTypes.bool),
  completingAssignments: PropTypes.objectOf(PropTypes.bool),
  updatingAssignments: PropTypes.objectOf(PropTypes.bool),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  engagementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showPaymentModal: PropTypes.bool,
  selectedMember: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    status: PropTypes.string,
    assignmentStatus: PropTypes.string,
    termsAccepted: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),
    agreementRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ratePerHour: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    standardHoursPerWeek: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    durationMonths: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    terminationReason: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)])
  }),
  onOpenPaymentModal: PropTypes.func,
  onClosePaymentModal: PropTypes.func,
  onSubmitPayment: PropTypes.func,
  onTerminateAssignment: PropTypes.func,
  onCompleteAssignment: PropTypes.func,
  onSaveAssignment: PropTypes.func
}

export default EngagementPayment
