import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { get } from 'lodash'
import Modal from '../Modal'
import SelectUserAutocomplete from '../SelectUserAutocomplete'
import { PROJECT_ROLES } from '../../config/constants'
import PrimaryButton from '../Buttons/PrimaryButton'
import { addUserToProject, inviteUserToProject } from '../../services/projects'

import styles from './Users.module.scss'

const theme = {
  container: styles.modalContainer
}

const UserAddModalContent = ({ projectId, addNewProjectMember, onMemberInvited, onClose }) => {
  const [userToAdd, setUserToAdd] = useState(null)
  const [userPermissionToAdd, setUserPermissionToAdd] = useState(PROJECT_ROLES.READ)
  const [showSelectUserError, setShowSelectUserError] = useState(false)
  const [addUserError, setAddUserError] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const onUpdateUserToAdd = (option) => {
    if (option && option.value) {
      setUserToAdd({
        handle: option.label,
        userId: parseInt(option.value, 10)
      })
      setShowSelectUserError(false)
    } else {
      setUserToAdd(null)
    }
  }

  const onAddUserConfirmClick = async () => {
    if (isAdding) return

    if (!userToAdd) {
      setShowSelectUserError(true)
      return
    }

    setIsAdding(true)
    setAddUserError(null)

    try {
      if (userPermissionToAdd === PROJECT_ROLES.COPILOT) {
        const { success: invitations = [], failed } = await inviteUserToProject(projectId, {
          handles: [userToAdd.handle],
          role: userPermissionToAdd
        })
        if (failed) {
          const error = get(failed, '0.message', 'Unable to invite user')
          setAddUserError(error)
          setIsAdding(false)
        } else {
          onMemberInvited(invitations[0] || {})
          onClose()
        }
      } else {
        const newUserInfo = await addUserToProject(projectId, userToAdd.userId, userPermissionToAdd)
        newUserInfo.handle = userToAdd.handle
        addNewProjectMember(newUserInfo)
        onClose()
      }
    } catch (e) {
      const error = get(e, 'response.data.message', 'Unable to add user')
      setAddUserError(error)
      setIsAdding(false)
    }
  }

  return (
    <Modal theme={theme} onCancel={onClose}>
      <div className={cn(styles.contentContainer, styles.confirm)}>
        <div className={styles.title}>Add User</div>
        <div className={styles.addUserContentContainer}>
          <div className={styles.row}>
            <div className={cn(styles.field, styles.col1, styles.addUserTitle)}>
              Member<span className={styles.required}>*</span> :
            </div>
            <div className={cn(styles.field, styles.col2)}>
              <SelectUserAutocomplete
                value={userToAdd ? { label: userToAdd.handle, value: userToAdd.userId.toString() } : null}
                onChange={onUpdateUserToAdd}
              />
            </div>
          </div>
          {showSelectUserError && (
            <div className={styles.row}>
              <div className={styles.errorMesssage}>Please select a member.</div>
            </div>
          )}
          <div className={styles.row}>
            <div className={cn(styles.field, styles.col1, styles.addUserTitle)}>
              <label htmlFor='memberToAdd'>Role :</label>
            </div>
            <div className={cn(styles.col5)}>
              <div className={styles.tcRadioButton}>
                <input
                  name={`add-user-radio`}
                  type='radio'
                  id={`read-add-user`}
                  checked={userPermissionToAdd === PROJECT_ROLES.READ}
                  onChange={() => setUserPermissionToAdd(PROJECT_ROLES.READ)}
                />
                <label htmlFor={`read-add-user`}>
                  <div>Read</div>
                  <input type='hidden' />
                </label>
              </div>
            </div>
            <div className={cn(styles.col5)}>
              <div className={styles.tcRadioButton}>
                <input
                  name={`add-user-radio`}
                  type='radio'
                  id={`write-add-user`}
                  checked={userPermissionToAdd === PROJECT_ROLES.WRITE}
                  onChange={() => setUserPermissionToAdd(PROJECT_ROLES.WRITE)}
                />
                <label htmlFor={`write-add-user`}>
                  <div>Write</div>
                  <input type='hidden' />
                </label>
              </div>
            </div>
            <div className={cn(styles.col5)}>
              <div className={styles.tcRadioButton}>
                <input
                  name={`add-user-radio`}
                  type='radio'
                  id={`full-access-add-user`}
                  checked={userPermissionToAdd === PROJECT_ROLES.MANAGER}
                  onChange={() => setUserPermissionToAdd(PROJECT_ROLES.MANAGER)}
                />
                <label htmlFor={`full-access-add-user`}>
                  <div>Full Access</div>
                  <input type='hidden' />
                </label>
              </div>
            </div>
            <div className={cn(styles.col5)}>
              <div className={styles.tcRadioButton}>
                <input
                  name={`add-user-radio`}
                  type='radio'
                  id={`copilot-add-user`}
                  checked={userPermissionToAdd === PROJECT_ROLES.COPILOT}
                  onChange={() => setUserPermissionToAdd(PROJECT_ROLES.COPILOT)}
                />
                <label htmlFor={`copilot-add-user`}>
                  <div>Copilot</div>
                  <input type='hidden' />
                </label>
              </div>
            </div>
          </div>
          {addUserError && (
            <div className={styles.errorMesssage}>{addUserError}</div>
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
              text={isAdding ? 'Adding user...' : 'Add User'}
              type={'info'}
              onClick={onAddUserConfirmClick}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
UserAddModalContent.propTypes = {
  projectId: PropTypes.number.isRequired,
  addNewProjectMember: PropTypes.func.isRequired,
  onMemberInvited: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default UserAddModalContent
