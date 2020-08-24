import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import Modal from '.'
import styles from './ConfirmationModal.module.scss'
import OutlineButton from '../Buttons/OutlineButton'
import PrimaryButton from '../Buttons/PrimaryButton'

const AlertModal = ({ title, message, theme, onClose, closeLink, okLink, closeText, okText }) => (
  <Modal theme={theme} onCancel={onClose}>
    <div className={cn(styles.contentContainer, styles.confirm)}>
      <div className={styles.title}>{title}</div>
      <span>{message}</span>
      <div className={styles.buttonGroup}>
        {closeText && (
          <div className={styles.buttonSizeA}>
            <PrimaryButton
              text={closeText}
              type={'info'}
              link={closeLink}
              onClick={closeLink ? () => {} : onClose}
            />
          </div>
        )}
        {okText && (
          <div className={styles.buttonSizeA}>
            <OutlineButton
              text={okText}
              type={'success'}
              link={okLink}
            />
          </div>
        )}
      </div>
    </div>
  </Modal>
)

AlertModal.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  theme: PropTypes.shape(),
  onClose: PropTypes.func,
  closeText: PropTypes.string,
  closeLink: PropTypes.string,
  okText: PropTypes.string,
  okLink: PropTypes.string
}

export default AlertModal
