import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { PrimaryButton, OutlineButton } from '../Buttons'
import Loader from '../Loader'
import Modal from '../Modal'
import PaymentForm from '../PaymentForm'
import styles from './EngagementPayment.module.scss'

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

const EngagementPayment = ({
  engagement,
  projectName,
  assignedMembers,
  isLoading,
  isPaymentProcessing,
  paymentsByAssignment,
  terminatingAssignments,
  completingAssignments,
  projectId,
  engagementId,
  showPaymentModal,
  selectedMember,
  onOpenPaymentModal,
  onClosePaymentModal,
  onSubmitPayment,
  onTerminateAssignment,
  onCompleteAssignment
}) => {
  const [paymentHistoryMember, setPaymentHistoryMember] = useState(null)
  const [completionMember, setCompletionMember] = useState(null)
  const [terminationMember, setTerminationMember] = useState(null)
  const [terminationReason, setTerminationReason] = useState('')
  if (isLoading) {
    return <Loader />
  }

  const members = Array.isArray(assignedMembers) ? assignedMembers : []
  const hasMembers = members.length > 0
  const engagementTitle = engagement && engagement.title ? engagement.title : 'Engagement'
  const backUrl = projectId ? `/projects/${projectId}/engagements` : '/projects'
  const resolvedEngagementId = engagementId != null ? engagementId : (engagement && engagement.id != null ? engagement.id : null)
  const showEngagementLinks = Boolean(projectId && resolvedEngagementId)
  const feedbackUrl = showEngagementLinks
    ? `/projects/${projectId}/engagements/${resolvedEngagementId}/feedback`
    : null
  const experienceUrl = showEngagementLinks
    ? `/projects/${projectId}/engagements/${resolvedEngagementId}/experience`
    : null

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
          return (
            <div key={paymentKey} className={styles.paymentItem}>
              <div className={styles.paymentAmount}>{amount}</div>
              <div className={styles.paymentDetails}>
                <div className={styles.paymentTitle}>{title}</div>
                {remarks && <div className={styles.paymentRemarks}>{remarks}</div>}
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
          <OutlineButton text='Back' type='info' link={backUrl} className={styles.actionButton} />
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
            const isAssignedStatus = normalizedAssignmentStatus.toLowerCase() === 'assigned'
            const isRowTerminating = assignmentKey && terminatingAssignments
              ? Boolean(terminatingAssignments[assignmentKey])
              : false
            const isRowCompleting = assignmentKey && completingAssignments
              ? Boolean(completingAssignments[assignmentKey])
              : false
            const assignmentRemarks = getAssignmentRemarks(member)
            const assignmentRate = getAssignmentRate(member)
            const startDate = formatDate(getAssignmentDate(member, 'start'))
            const endDate = formatDate(getAssignmentDate(member, 'end'))
            const rateDisplay = assignmentRate !== '' && assignmentRate != null
              ? formatCurrency(assignmentRate)
              : '-'

            return (
              <div key={member.key} className={styles.memberRow}>
                <div className={styles.memberRowHeader}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberHeader}>
                      <div className={styles.memberHandle}>{member.handle || '-'}</div>
                      <span
                        className={styles.assignmentStatus}
                        title={assignmentStatusRaw || assignmentStatusLabel}
                      >
                        {assignmentStatusLabel}
                      </span>
                    </div>
                    {!member.id && (
                      <div className={styles.memberNote}>Resolving member ID...</div>
                    )}
                    {!hasAssignmentId && (
                      <div className={styles.memberNote}>Payment unavailable: missing assignment ID.</div>
                    )}
                    <div className={styles.memberMeta}>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>Remarks</span>
                        <span className={styles.memberMetaValue}>
                          {assignmentRemarks || '-'}
                        </span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>Agreed Rate</span>
                        <span className={styles.memberMetaValue}>{rateDisplay}</span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>Tentative Start</span>
                        <span className={styles.memberMetaValue}>{startDate}</span>
                      </div>
                      <div className={styles.memberMetaItem}>
                        <span className={styles.memberMetaLabel}>Tentative End</span>
                        <span className={styles.memberMetaValue}>{endDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.memberActions}>
                    {isAssignedStatus && (
                      <>
                        <button
                          type='button'
                          className={styles.toggleButton}
                          onClick={() => openPaymentHistoryModal(member)}
                          disabled={!assignmentKey}
                          aria-haspopup='dialog'
                        >
                          Show Payment History
                        </button>
                        <PrimaryButton
                          text='Pay'
                          type='info'
                          className={styles.actionButton}
                          onClick={() => onOpenPaymentModal(member)}
                          disabled={!canPay}
                        />
                        <PrimaryButton
                          text={isRowCompleting ? 'Completing...' : 'Complete'}
                          type='success'
                          className={styles.actionButton}
                          onClick={() => openCompletionModal(member)}
                          disabled={!hasAssignmentId || isRowTerminating || isRowCompleting}
                        />
                        <PrimaryButton
                          text={isRowTerminating ? 'Terminating...' : 'Terminate'}
                          type='danger'
                          className={styles.actionButton}
                          onClick={() => openTerminationModal(member)}
                          disabled={!hasAssignmentId || isRowTerminating || isRowCompleting}
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
  projectId: null,
  engagementId: null,
  showPaymentModal: false,
  selectedMember: null,
  onOpenPaymentModal: () => {},
  onClosePaymentModal: () => {},
  onSubmitPayment: () => {},
  onTerminateAssignment: () => {},
  onCompleteAssignment: () => {}
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
    terminationReason: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)])
  }),
  onOpenPaymentModal: PropTypes.func,
  onClosePaymentModal: PropTypes.func,
  onSubmitPayment: PropTypes.func,
  onTerminateAssignment: PropTypes.func,
  onCompleteAssignment: PropTypes.func
}

export default EngagementPayment
