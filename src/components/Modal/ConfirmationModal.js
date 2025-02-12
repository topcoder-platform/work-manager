import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import _ from 'lodash'
import Modal from '.'
import styles from './ConfirmationModal.module.scss'
import OutlineButton from '../Buttons/OutlineButton'
import PrimaryButton from '../Buttons/PrimaryButton'

const ConfirmationModal = ({
  title,
  message,
  errorMessage,
  theme,
  isProcessing,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  disableConfirmButton,
  confirmType,
  cancelType
}) => (
  <Modal theme={theme} onCancel={isProcessing ? _.noop : onCancel}>
    <div className={styles.contentContainer}>
      <div className={styles.title} title={title}>{title}</div>
      <span>{message}</span>
      <div className={styles.buttonGroup}>
        <div className={styles.button}>
          <OutlineButton
            className={cn({ disabled: isProcessing })}
            text={cancelText || 'Cancel'}
            type={cancelType}
            onClick={onCancel}
            disabled={isProcessing}
          />
        </div>
        <div className={styles.button}>
          <PrimaryButton
            text={isProcessing ? 'Processing...' : confirmText || 'Confirm'}
            disabled={disableConfirmButton || isProcessing}
            type={confirmType}
            onClick={onConfirm}
          />
        </div>
      </div>
      <span className={styles.errorMessage}>{errorMessage}</span>
    </div>
  </Modal>
)

ConfirmationModal.defaultProps = {
  confirmType: 'info',
  cancelType: 'danger'
}

ConfirmationModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  errorMessage: PropTypes.string,
  theme: PropTypes.shape(),
  isProcessing: PropTypes.bool,
  disableConfirmButton: PropTypes.bool,
  cancelText: PropTypes.string,
  cancelType: PropTypes.string,
  confirmText: PropTypes.string,
  confirmType: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func
}

export default ConfirmationModal
