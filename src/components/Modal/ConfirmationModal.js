import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import Modal from '.'
import styles from './ConfirmationModal.module.scss'
import OutlineButton from '../Buttons/OutlineButton'
import PrimaryButton from '../Buttons/PrimaryButton'

const ConfirmationModal = ({ title, message, errorMessage, theme, isProcessing, cancelText, confirmText, onCancel, onConfirm, disableConfirmButton }) => (
  <Modal theme={theme} onCancel={onCancel}>
    <div className={styles.contentContainer}>
      <div className={styles.title}>{title}</div>
      <span>{message}</span>
      <div className={styles.buttonGroup}>
        <div className={styles.button}>
          <OutlineButton
            className={cn({ disabled: isProcessing })}
            text={cancelText || 'Cancel'}
            type={'danger'}
            onClick={onCancel}
          />
        </div>
        <div className={styles.button}>
          <PrimaryButton
            text={isProcessing ? 'Processing...' : confirmText || 'Confirm'}
            disabled={disableConfirmButton || isProcessing}
            type={'info'}
            onClick={onConfirm}
          />
        </div>
      </div>
      <span className={styles.errorMessage}>{errorMessage}</span>
    </div>
  </Modal>
)

ConfirmationModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  errorMessage: PropTypes.string,
  theme: PropTypes.shape(),
  isProcessing: PropTypes.bool,
  disableConfirmButton: PropTypes.bool,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func
}

export default ConfirmationModal
