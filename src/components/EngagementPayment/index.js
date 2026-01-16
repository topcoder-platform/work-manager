import React from 'react'
import PropTypes from 'prop-types'
import { PrimaryButton, OutlineButton } from '../Buttons'
import Loader from '../Loader'
import Modal from '../Modal'
import PaymentForm from '../PaymentForm'
import styles from './EngagementPayment.module.scss'

const EngagementPayment = ({
  engagement,
  assignedMembers,
  isLoading,
  isPaymentProcessing,
  projectId,
  showPaymentModal,
  selectedMember,
  onOpenPaymentModal,
  onClosePaymentModal,
  onSubmitPayment
}) => {
  if (isLoading) {
    return <Loader />
  }

  const members = Array.isArray(assignedMembers) ? assignedMembers : []
  const hasMembers = members.length > 0
  const engagementTitle = engagement && engagement.title ? engagement.title : 'Engagement'
  const backUrl = projectId ? `/projects/${projectId}/engagements` : '/projects'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Payment for: {engagementTitle}</div>
        <OutlineButton text='Back' type='info' link={backUrl} />
      </div>
      {hasMembers ? (
        <div className={styles.membersList}>
          {members.map((member) => (
            <div key={member.key} className={styles.memberRow}>
              <div className={styles.memberInfo}>
                <div className={styles.memberHandle}>{member.handle || '-'}</div>
                {!member.id && (
                  <div className={styles.memberNote}>Resolving member ID...</div>
                )}
              </div>
              <PrimaryButton
                text='Pay'
                type='info'
                onClick={() => onOpenPaymentModal(member)}
                disabled={!member.id || isPaymentProcessing}
              />
            </div>
          ))}
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
    handle: PropTypes.string,
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  isLoading: PropTypes.bool,
  isPaymentProcessing: PropTypes.bool,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showPaymentModal: PropTypes.bool,
  selectedMember: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string
  }),
  onOpenPaymentModal: PropTypes.func,
  onClosePaymentModal: PropTypes.func,
  onSubmitPayment: PropTypes.func
}

export default EngagementPayment
