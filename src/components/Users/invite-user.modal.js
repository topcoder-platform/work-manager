import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { find, get } from 'lodash'
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

const InviteUserModalContent = ({ projectId, onClose, onMemberInvited, projectMembers, invitedMembers }) => {
  const [emailToInvite, setEmailToInvite] = useState('')
  const [showEmailError, setShowEmailError] = useState(false)
  const [inviteUserError, setInviteUserError] = useState(null)
  const [isInviting, setIsInviting] = useState(false)

  const checkEmail = () => {
    if (!validateEmail(emailToInvite)) {
      setShowEmailError(true)
      return false
    }

    if (find(invitedMembers, { email: emailToInvite })) {
      setInviteUserError('Email is already invited!')
      return false
    }

    if (find(projectMembers, { email: emailToInvite })) {
      setInviteUserError('Member already part of the project!')
      return false
    }

    return true
  }

  const onInviteUserConfirmClick = async () => {
    if (isInviting) return

    if (!checkEmail()) {
      return
    }

    setIsInviting(true)
    setInviteUserError(null)

    try {
      // api restriction: ONLY "customer" role can be invited via email
      const { success: invitations = [], failed } = await inviteUserToProject(projectId, emailToInvite, PROJECT_ROLES.CUSTOMER)

      if (failed) {
        const error = get(failed, '0.message', 'Unable to invite user')
        setInviteUserError(error)
        setIsInviting(false)
      } else {
        onMemberInvited(invitations[0] || {})
        onClose()
      }
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
                  setInviteUserError(null)
                }}
                onBlur={checkEmail}
              />
            </div>
          </div>
          {showEmailError && (
            <div className={styles.row}>
              <div className={styles.errorMesssage}>Please enter a valid email address.</div>
            </div>
          )}
          {inviteUserError && (
            <div className={styles.row}>
              <div className={styles.errorMesssage}>{inviteUserError}</div>
            </div>
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
  onClose: PropTypes.func.isRequired,
  onMemberInvited: PropTypes.func.isRequired,
  projectMembers: PropTypes.arrayOf(PropTypes.object),
  invitedMembers: PropTypes.arrayOf(PropTypes.object)
}

export default InviteUserModalContent
