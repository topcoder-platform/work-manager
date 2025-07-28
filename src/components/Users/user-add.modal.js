import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { get } from 'lodash'
import Modal from '../Modal'
import SelectUserAutocomplete from '../SelectUserAutocomplete'
import { PROJECT_ROLES } from '../../config/constants'
import PrimaryButton from '../Buttons/PrimaryButton'
import { addUserToProject, inviteUserToProject, updateProjectMemberRole } from '../../services/projects'

import styles from './Users.module.scss'

const theme = {
  container: styles.modalContainer
}

const UserAddModalContent = ({
  projectMembers,
  projectOption,
  projectId,
  addNewProjectMember,
  onMemberInvited,
  onClose,
  updateProjectMember
}) => {
  const [userToAdd, setUserToAdd] = useState(null)
  const [userPermissionToAdd, setUserPermissionToAdd] = useState(PROJECT_ROLES.READ)
  const [showSelectUserError, setShowSelectUserError] = useState(false)
  const [addUserError, setAddUserError] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isUserAddingFailed, setUserAddingFailed] = useState(false)
  const [existingRole, setExistingRole] = useState('')

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
        const { success: invitations = [], failed, ...rest } = await inviteUserToProject(projectId, {
          handles: [userToAdd.handle],
          role: userPermissionToAdd
        })
        if (failed) {
          const error = get(failed, '0.message', 'User cannot be invited')
          const errorCode = get(failed, '0.error')
          const role = get(failed, '0.role')
          setAddUserError(error)
          setIsAdding(false)
          setUserAddingFailed(errorCode === 'ALREADY_MEMBER')
          setExistingRole(role)
        } else if (rest.message) {
          setAddUserError(rest.message)
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

  const onConfirmCopilotRoleChange = async () => {
    const member = projectMembers.find(item => item.userId === userToAdd.userId)
    const action = member.role === 'manager' ? 'complete-copilot-requests' : ''
    const response = await updateProjectMemberRole(projectId, member.id, 'copilot', action)
    updateProjectMember(response)
    onClose(true)
  }

  const onCancelCopilotRoleChange = () => {
    setUserAddingFailed(false)
    setAddUserError('')
  }

  return (
    <Modal theme={theme} onCancel={onClose}>
      {
        isUserAddingFailed && (existingRole === 'observer' || existingRole === 'customer' || existingRole === 'copilot' || existingRole === 'manager') && (
          <div className={cn(styles.contentContainer, styles.confirm)}>
            <div className={styles.textContent}>{`The copilot ${userToAdd.handle} is part of ${projectOption.label} project with ${existingRole} role.`}</div>
            <div className={styles.buttonWrapper}>
              <PrimaryButton onClick={onConfirmCopilotRoleChange} text={'Confirm'} type={'info'} />
              <PrimaryButton onClick={onCancelCopilotRoleChange} text={'Cancel'} type={'disabled'} />
            </div>
          </div>
        )
      }
      {
        !isUserAddingFailed && (
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
        )
      }
    </Modal>
  )
}
UserAddModalContent.propTypes = {
  projectId: PropTypes.number.isRequired,
  addNewProjectMember: PropTypes.func.isRequired,
  onMemberInvited: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  projectOption: PropTypes.any.isRequired,
  projectMembers: PropTypes.array.isRequired,
  updateProjectMember: PropTypes.func.isRequired
}

export default UserAddModalContent
