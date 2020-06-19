import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import Modal from '.'
import styles from './ConfirmationModal.module.scss'
import OutlineButton from '../Buttons/OutlineButton'
import PrimaryButton from '../Buttons/PrimaryButton'

const ConfirmationModal = ({ title, message, theme, isProcessing, onCancel, onConfirm }) => (
  <Modal theme={theme} onCancel={onCancel}>
    <div className={styles.contentContainer}>
      <div className={styles.title}>{title}</div>
      <span>{message}</span>
      <div className={styles.buttonGroup}>
        <div className={styles.button}>
          <OutlineButton
            className={cn({ disabled: isProcessing })}
            text={'Cancel'}
            type={'danger'}
            onClick={onCancel}
          />
        </div>
        <div className={styles.button}>
          <PrimaryButton
            text={isProcessing ? 'Processing...' : 'Confirm'}
            type={'info'}
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  </Modal>
)

ConfirmationModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  theme: PropTypes.shape(),
  isProcessing: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func
}

export default ConfirmationModal
