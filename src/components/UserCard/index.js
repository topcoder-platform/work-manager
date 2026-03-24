import _ from 'lodash'
import moment from 'moment'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './UserCard.module.scss'
import { PROJECT_ROLES } from '../../config/constants'
import PrimaryButton from '../Buttons/PrimaryButton'
import AlertModal from '../Modal/AlertModal'
import { updateProjectMemberRole } from '../../services/projects'
import { checkCanSelfAssignProjectRole } from '../../util/tc'

const theme = {
  container: styles.modalContainer
}

function normalizeDisplayValue (value) {
  if (_.isNil(value)) {
    return null
  }

  const normalizedValue = String(value).trim()

  return normalizedValue || null
}

function normalizeUserId (userId) {
  if (_.isNil(userId)) {
    return null
  }

  const normalizedUserId = String(userId).trim()

  return normalizedUserId || null
}

/**
 * Renders one project member or invite card with role controls.
 *
 * `user.handle` may be null/empty for some members; this component falls back
 * to `user.userId` and then `"(unknown user)"` when rendering labels/messages.
 * Members may lower their own role, but this control blocks self-promotion to
 * higher project privileges.
 */
class UserCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isUpdatingPermission: false,
      showWarningModal: false,
      permissionUpdateError: null,
      showSuccessModal: false
    }
    this.updatePermission = this.updatePermission.bind(this)
    this.resetPermState = this.resetPermState.bind(this)
  }

  resetPermState () {
    this.setState({
      isUpdatingPermission: false,
      showWarningModal: false,
      permissionUpdateError: null,
      showSuccessModal: false
    })
  }

  async updatePermission (newRole) {
    if (this.state.isUpdatingPermission) { return }

    const { user, updateProjectMember, currentUserId } = this.props
    const isCurrentUser = normalizeUserId(user.userId) === normalizeUserId(currentUserId)

    if (isCurrentUser && !checkCanSelfAssignProjectRole(user.role, newRole)) {
      this.setState({
        showWarningModal: true,
        permissionUpdateError: 'You cannot give yourself higher privileges in this project.'
      })
      return
    }

    this.setState({
      isUpdatingPermission: true
    })

    try {
      const newUserInfoRole = await updateProjectMemberRole(user.projectId, user.id, newRole)
      updateProjectMember(newUserInfoRole)
      this.setState({ showSuccessModal: true })
    } catch (e) {
      const error = _.get(
        e,
        'response.data.message',
        `Unable to update permission`
      )
      this.setState({ showWarningModal: true, permissionUpdateError: error })
    }
  }

  render () {
    const { isInvite, user, onRemoveClick, isEditable, currentUserId } = this.props
    const showRadioButtons = _.includes(_.values(PROJECT_ROLES), user.role)
    const isCurrentUser = normalizeUserId(user.userId) === normalizeUserId(currentUserId)
    const canAssignRole = role => (
      isEditable &&
      (!isCurrentUser || checkCanSelfAssignProjectRole(user.role, role))
    )
    const userDisplayName = normalizeDisplayValue(user.handle) ||
      normalizeDisplayValue(user.userId) ||
      '(unknown user)'
    const inviteDisplayName = normalizeDisplayValue(user.email) ||
      normalizeDisplayValue(user.handle) ||
      normalizeDisplayValue(user.userId) ||
      '(unknown user)'
    return (
      <div>
        {
          this.state.isUpdatingPermission && (
            <AlertModal
              message={`Updating permission for ${userDisplayName}...`}
              theme={theme}
            />
          )
        }
        {this.state.showWarningModal && (
          <AlertModal
            title={`Cannot update permission for ${userDisplayName}`}
            message={this.state.permissionUpdateError}
            theme={theme}
            closeText='OK'
            onClose={this.resetPermState}
          />
        )}
        {this.state.showSuccessModal && (
          <AlertModal
            title={`Permission updated successfully!`}
            message={''}
            theme={theme}
            closeText='OK'
            onClose={this.resetPermState}
          />
        )}
        <div className={styles.item}>
          <div className={cn(styles.col5)}>
            {isInvite ? inviteDisplayName : userDisplayName}
          </div>
          {!isInvite && (
            <>
              <div className={cn(styles.col5)}>
                {showRadioButtons && (<div className={styles.tcRadioButton}>
                  <input
                    name={`user-${user.id}`}
                    type='radio'
                    id={`read-${user.id}`}
                    checked={user.role === PROJECT_ROLES.READ}
                    disabled={!canAssignRole(PROJECT_ROLES.READ)}
                    onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.READ)}
                  />
                  <label className={cn({ [styles.isDisabled]: !canAssignRole(PROJECT_ROLES.READ) })} htmlFor={`read-${user.id}`}>
                    <div>
                      Read
                    </div>
                    <input type='hidden' />
                  </label>
                </div>)}
              </div>
              <div className={cn(styles.col5)}>
                {showRadioButtons && (<div className={styles.tcRadioButton}>
                  <input
                    name={`user-${user.id}`}
                    type='radio'
                    id={`write-${user.id}`}
                    checked={user.role === PROJECT_ROLES.WRITE}
                    disabled={!canAssignRole(PROJECT_ROLES.WRITE)}
                    onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.WRITE)}
                  />
                  <label className={cn({ [styles.isDisabled]: !canAssignRole(PROJECT_ROLES.WRITE) })} htmlFor={`write-${user.id}`}>
                    <div>
                      Write
                    </div>
                    <input type='hidden' />
                  </label>
                </div>)}
              </div>
              <div className={cn(styles.col5)}>
                {showRadioButtons && (<div className={styles.tcRadioButton}>
                  <input
                    name={`user-${user.id}`}
                    type='radio'
                    id={`full-access-${user.id}`}
                    checked={user.role === PROJECT_ROLES.MANAGER}
                    disabled={!canAssignRole(PROJECT_ROLES.MANAGER)}
                    onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.MANAGER)}
                  />
                  <label className={cn({ [styles.isDisabled]: !canAssignRole(PROJECT_ROLES.MANAGER) })} htmlFor={`full-access-${user.id}`}>
                    <div>
                      Full Access
                    </div>
                    <input type='hidden' />
                  </label>
                </div>)}
              </div>
              <div className={cn(styles.col5)}>
                {showRadioButtons && (<div className={styles.tcRadioButton}>
                  <input
                    name={`user-${user.id}`}
                    type='radio'
                    id={`copilot-${user.id}`}
                    checked={user.role === PROJECT_ROLES.COPILOT}
                    disabled={!canAssignRole(PROJECT_ROLES.COPILOT)}
                    onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.COPILOT)}
                  />
                  <label className={cn({ [styles.isDisabled]: !canAssignRole(PROJECT_ROLES.COPILOT) })} htmlFor={`copilot-${user.id}`}>
                    <div>
                      Copilot
                    </div>
                    <input type='hidden' />
                  </label>
                </div>)}
              </div>
            </>
          )}
          {isInvite && (
            <>
              <div className={cn(styles.col5)} />
              <div className={cn(styles.col5)}>
                Invited {moment(user.createdAt).format('MMM D, YY')}
              </div>
              <div className={cn(styles.col5)} />
              <div className={cn(styles.col5)} />
            </>
          )}
          {isEditable ? (<div className={cn(styles.col5)}>
            <PrimaryButton
              text={'Remove'}
              type={'danger'}
              onClick={() => { onRemoveClick(user) }} />
          </div>) : null}
        </div>
      </div>
    )
  }
}

UserCard.propTypes = {
  isInvite: PropTypes.bool,
  user: PropTypes.object,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  updateProjectMember: PropTypes.func.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
  isEditable: PropTypes.bool
}

export default UserCard
