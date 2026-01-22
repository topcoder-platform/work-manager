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

const EngagementPayment = ({
  engagement,
  assignedMembers,
  isLoading,
  isPaymentProcessing,
  paymentsByAssignment,
  projectId,
  showPaymentModal,
  selectedMember,
  onOpenPaymentModal,
  onClosePaymentModal,
  onSubmitPayment
}) => {
  const [expandedAssignments, setExpandedAssignments] = useState({})
  if (isLoading) {
    return <Loader />
  }

  const members = Array.isArray(assignedMembers) ? assignedMembers : []
  const hasMembers = members.length > 0
  const engagementTitle = engagement && engagement.title ? engagement.title : 'Engagement'
  const backUrl = projectId ? `/projects/${projectId}/engagements` : '/projects'

  const togglePaymentHistory = (assignmentId) => {
    if (assignmentId == null || assignmentId === '') {
      return
    }
    const key = String(assignmentId)
    setExpandedAssignments((prevState) => ({
      ...prevState,
      [key]: !prevState[key]
    }))
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
          const title = getPaymentTitle(payment)
          return (
            <div key={paymentKey} className={styles.paymentItem}>
              <div className={styles.paymentAmount}>{amount}</div>
              <div className={styles.paymentDetails}>
                <div className={styles.paymentTitle}>{title}</div>
                <div className={styles.paymentMeta}>
                  <span className={styles.paymentDate}>{date}</span>
                  <span className={styles.paymentStatus}>{status}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Payment for: {engagementTitle}</div>
        <OutlineButton text='Back' type='info' link={backUrl} className={styles.actionButton} />
      </div>
      {hasMembers ? (
        <div className={styles.membersList}>
          {members.map((member) => {
            const assignmentId = member && member.assignmentId != null ? member.assignmentId : null
            const assignmentKey = assignmentId != null && assignmentId !== '' ? String(assignmentId) : null
            const isExpanded = assignmentKey ? Boolean(expandedAssignments[assignmentKey]) : false
            const historyId = assignmentKey ? `payment-history-${assignmentKey}` : undefined
            const hasAssignmentId = Boolean(assignmentKey)
            const canPay = Boolean(member && member.id && hasAssignmentId && !isPaymentProcessing)

            return (
              <div
                key={member.key}
                className={`${styles.memberRow} ${isExpanded ? styles.memberRowExpanded : ''}`}
              >
                <div className={styles.memberRowHeader}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberHandle}>{member.handle || '-'}</div>
                    {!member.id && (
                      <div className={styles.memberNote}>Resolving member ID...</div>
                    )}
                    {!hasAssignmentId && (
                      <div className={styles.memberNote}>Payment unavailable: missing assignment ID.</div>
                    )}
                  </div>
                  <div className={styles.memberActions}>
                    <button
                      type='button'
                      className={styles.toggleButton}
                      onClick={() => togglePaymentHistory(assignmentId)}
                      disabled={!assignmentKey}
                      aria-expanded={isExpanded}
                      aria-controls={historyId}
                    >
                      {isExpanded ? 'Hide history' : 'Show history'}
                    </button>
                    <PrimaryButton
                      text='Pay'
                      type='info'
                      className={styles.actionButton}
                      onClick={() => onOpenPaymentModal(member)}
                      disabled={!canPay}
                    />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.paymentHistorySection} id={historyId}>
                    <div className={styles.paymentHistoryHeader}>Payment history</div>
                    {renderPaymentHistory(member)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>No assigned members found.</div>
      )}
      {showPaymentModal && (
        <Modal onCancel={onClosePaymentModal}>
          <PaymentForm
            engagement={engagement}
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
  assignedMembers: [],
  isLoading: false,
  isPaymentProcessing: false,
  paymentsByAssignment: {},
  projectId: null,
  showPaymentModal: false,
  selectedMember: null,
  onOpenPaymentModal: () => {},
  onClosePaymentModal: () => {},
  onSubmitPayment: () => {}
}

EngagementPayment.propTypes = {
  engagement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string
  }),
  assignedMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  isLoading: PropTypes.bool,
  isPaymentProcessing: PropTypes.bool,
  paymentsByAssignment: PropTypes.objectOf(PropTypes.shape({
    isLoading: PropTypes.bool,
    payments: PropTypes.arrayOf(PropTypes.object),
    error: PropTypes.string
  })),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showPaymentModal: PropTypes.bool,
  selectedMember: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string
  }),
  onOpenPaymentModal: PropTypes.func,
  onClosePaymentModal: PropTypes.func,
  onSubmitPayment: PropTypes.func
}

export default EngagementPayment
