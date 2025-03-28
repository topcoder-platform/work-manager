/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { get } from 'lodash'
import Modal from '../Modal'
import PrimaryButton from '../Buttons/PrimaryButton'
import { inviteUserToProject } from '../../services/projects'
import { PROJECT_ROLES } from '../../config/constants'

import styles from './Users.module.scss'

const theme = {
  container: styles.modalContainer
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const InviteUserModalContent = ({ projectId, onClose }) => {
  const [emailToInvite, setEmailToInvite] = useState('')
  const [showEmailError, setShowEmailError] = useState(false)
  const [inviteUserError, setInviteUserError] = useState(null)
  const [isInviting, setIsInviting] = useState(false)

  const handleEmailBlur = () => {
    if (!validateEmail(emailToInvite)) {
      setShowEmailError(true)
    }
  }

  const onInviteUserConfirmClick = async () => {
    if (isInviting) return

    if (!emailToInvite || !validateEmail(emailToInvite)) {
      setShowEmailError(true)
      return
    }

    setIsInviting(true)
    setInviteUserError(null)

    try {
      // api restriction: ONLY "customer" role can be invited via email
      await inviteUserToProject(projectId, emailToInvite, PROJECT_ROLES.CUSTOMER)
      onClose()
    } catch (e) {
      const error = get(e, 'response.data.message', 'Unable to invite user')
      setInviteUserError(error)
      setIsInviting(false)
    }
  }

  return (
    <Modal theme={theme} onCancel={onClose}>
      <div className={cn(styles.contentContainer, styles.confirm)}>
        <div className={styles.title}>Invite User</div>
        <div className={styles.addUserContentContainer}>
          <div className={styles.row}>
            <div className={cn(styles.field, styles.col1, styles.addUserTitle)}>
              Email<span className={styles.required}>*</span> :
            </div>
            <div className={cn(styles.field, styles.col2, styles.inviteEmailInput)}>
              <input
                type='email'
                name='email'
                placeholder='Enter Email'
                onChange={(e) => {
                  setEmailToInvite(e.target.value)
                  setShowEmailError(false)
                }}
                onBlur={handleEmailBlur}
              />
            </div>
          </div>
          {showEmailError && (
            <div className={styles.row}>
              <div className={styles.errorMesssage}>Please enter a valid email address.</div>
            </div>
          )}
          {inviteUserError && (
            <div className={styles.errorMesssage}>{inviteUserError}</div>
          )}
        </div>
        <div className={styles.buttonGroup}>
          <div className={styles.buttonSizeA}>
            <PrimaryButton
              text={'Close'}
              type={'info'}
              onClick={onClose}
            />
          </div>
          <div className={styles.buttonSizeA}>
            <PrimaryButton
              text={isInviting ? 'Inviting user...' : 'Invite User'}
              type={'info'}
              onClick={onInviteUserConfirmClick}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

InviteUserModalContent.propTypes = {
  projectId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired
}

export default InviteUserModalContent
