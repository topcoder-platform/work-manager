import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cn from 'classnames'
import styles from './Users.module.scss'
import Select from '../Select'
import UserCard from '../UserCard'
import PrimaryButton from '../Buttons/PrimaryButton'
import { PROJECT_ROLES, AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../config/constants'
import { checkAdmin } from '../../util/tc'
import { removeUserFromProject } from '../../services/projects'
import { deleteProjectMemberInvite } from '../../services/projectMemberInvites'
import ConfirmationModal from '../Modal/ConfirmationModal'
import UserAddModalContent from './user-add.modal'
import InviteUserModalContent from './invite-user.modal' // Import the new component

const theme = {
  container: styles.modalContainer
}

class Users extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectOption: null,
      showAddUserModal: false,
      showInviteUserModal: false, // Add state for invite user modal
      isRemoving: false,
      removeError: null,
      showRemoveConfirmationModal: false,
      userToRemove: null,
      searchKey: ''
    }
    this.setProjectOption = this.setProjectOption.bind(this)
    this.onAddUserClick = this.onAddUserClick.bind(this)
    this.onInviteUserClick = this.onInviteUserClick.bind(this) // Bind the new method
    this.resetAddUserState = this.resetAddUserState.bind(this)
    this.resetInviteUserState = this.resetInviteUserState.bind(this) // Bind reset method
    this.onRemoveClick = this.onRemoveClick.bind(this)
    this.resetRemoveUserState = this.resetRemoveUserState.bind(this)
    this.onRemoveConfirmClick = this.onRemoveConfirmClick.bind(this)
    this.onInputChange = this.onInputChange.bind(this)

    this.debouncedOnInputChange = _.debounce(this.onInputChange, AUTOCOMPLETE_DEBOUNCE_TIME_MS)
  }

  setProjectOption (projectOption) {
    this.setState({ projectOption })
    const { loadProject } = this.props
    loadProject(projectOption.value, false)
  }

  onAddUserClick () {
    this.setState({
      showAddUserModal: true
    })
  }

  onInviteUserClick () {
    this.setState({
      showInviteUserModal: true
    })
  }

  resetAddUserState () {
    this.setState({ showAddUserModal: false })
  }

  resetInviteUserState () {
    this.setState({ showInviteUserModal: false })
  }

  getHandle () {
    return this.props.auth && this.props.auth.user
      ? this.props.auth.user.handle
      : null
  }

  getMemberRole (members, handle) {
    if (!handle) { return null }

    const found = _.find(members, (m) => {
      return m.handle === handle
    })

    return _.get(found, 'role')
  }

  onRemoveClick (user) {
    if (this.state.isRemoving) {
      return
    }

    this.setState({
      showRemoveConfirmationModal: true,
      userToRemove: user
    })
  }

  resetRemoveUserState () {
    this.setState({
      isRemoving: false,
      showRemoveConfirmationModal: false,
      userToRemove: null,
      removeError: null
    })
  }

  async onRemoveConfirmClick () {
    if (this.state.isRemoving) { return }

    const { removeProjectNember, invitedMembers } = this.props
    const userToRemove = this.state.userToRemove
    const isInvite = !!_.find(invitedMembers, { email: userToRemove.email })
    try {
      this.setState({ isRemoving: true })
      await (
        isInvite ? deleteProjectMemberInvite(userToRemove.projectId, userToRemove.id) : removeUserFromProject(userToRemove.projectId, userToRemove.id)
      )
      removeProjectNember(userToRemove)

      this.resetRemoveUserState()
    } catch (e) {
      const error = _.get(
        e,
        'response.data.message',
        `Unable to remove user`
      )
      this.setState({ isRemoving: false, removeError: error })
    }
  }

  checkIsCopilotOrManager (projectMembers, handle) {
    if (projectMembers && projectMembers.length > 0) {
      const role = this.getMemberRole(projectMembers, handle)
      return role === PROJECT_ROLES.COPILOT || role === PROJECT_ROLES.MANAGER
    } else {
      return false
    }
  }

  /**
   * Handler for the input which calls API for getting project suggestions
   */
  onInputChange (inputValue, a, b, c) {
    const { searchUserProjects } = this.props
    const preparedValue = inputValue.trim()
    searchUserProjects(preparedValue)
    this.setState({
      searchKey: preparedValue
    })
  }

  render () {
    const {
      projects,
      projectMembers,
      invitedMembers,
      updateProjectNember,
      isEditable,
      isSearchingUserProjects,
      resultSearchUserProjects
    } = this.props
    const {
      searchKey
    } = this.state
    const projectOptions = ((searchKey ? resultSearchUserProjects : projects) || []).map(p => {
      return {
        label: p.name,
        value: p.id
      }
    })
    const loggedInHandle = this.getHandle()
    const membersExist = (projectMembers && projectMembers.length > 0) || (invitedMembers && invitedMembers.length > 0)
    const isCopilotOrManager = this.checkIsCopilotOrManager(projectMembers, loggedInHandle)
    const isAdmin = checkAdmin(this.props.auth.token)
    const showAddUser = isEditable && this.state.projectOption && (isCopilotOrManager || isAdmin)

    return (
      <div className={styles.contentContainer}>
        <div className={cn(styles.row)}>
          <div className={cn(styles['col-6'])}>
            <div className={cn(styles.field, styles.input1)}>
              <label htmlFor='project'>Project :</label>
            </div>
            <div className={cn(styles.field, styles.input2)}>
              <Select
                name='project'
                options={projectOptions}
                placeholder='Select a project'
                value={this.state.projectOption}
                onChange={(e) => { this.setProjectOption(e) }}
                onInputChange={this.debouncedOnInputChange}
                isLoading={isSearchingUserProjects}
                filterOption={() => true}
                noOptionsMessage={() => isSearchingUserProjects ? 'Searching...' : 'No options'}
              />
            </div>
          </div>
        </div>

        {
          showAddUser && (
            <div className={styles.addButtonContainer}>
              <PrimaryButton
                text={'Add User'}
                type={'info'}
                onClick={() => this.onAddUserClick()} />
              <PrimaryButton
                text={'Invite User'}
                type={'info'}
                onClick={() => this.onInviteUserClick()} />
            </div>
          )
        }
        {
          this.state.showAddUserModal && (
            <UserAddModalContent
              projectId={this.state.projectOption.value}
              addNewProjectMember={this.props.addNewProjectMember}
              onClose={this.resetAddUserState}
            />
          )
        }
        {
          this.state.showInviteUserModal && (
            <InviteUserModalContent
              projectId={this.state.projectOption.value}
              projectMembers={projectMembers}
              invitedMembers={invitedMembers}
              onMemberInvited={this.props.addNewProjectInvite}
              onClose={this.resetInviteUserState}
            />
          )
        }
        {
          this.state.showRemoveConfirmationModal && (
            <ConfirmationModal
              title='Confirm Removal'
              message={`Are you sure you want to remove ${this.state.userToRemove.handle || this.state.userToRemove.email} from this project?`}
              theme={theme}
              isProcessing={this.state.isRemoving}
              errorMessage={this.state.removeError}
              onCancel={this.resetRemoveUserState}
              onConfirm={this.onRemoveConfirmClick}
            />
          )
        }
        {
          membersExist && (
            <>
              <div className={styles.header}>
                <div className={cn(styles.col5)}>
                User
                </div>
                <div className={cn(styles.col5)}>
                Read
                </div>
                <div className={cn(styles.col5)}>
                Write
                </div>
                <div className={cn(styles.col5)}>
                Full Access
                </div>
                <div className={cn(styles.col5)}>
                Copilot
                </div>
              </div>
              <ul className={styles.userList}>
                {
                  _.map(projectMembers, (member) => {
                    return (
                      <li className={styles.userItem} key={`user-card-${member.id}`}>
                        <UserCard
                          user={member}
                          onRemoveClick={this.onRemoveClick}
                          updateProjectNember={updateProjectNember}
                          isEditable={isEditable} />
                      </li>
                    )
                  })
                }
              </ul>
              <ul className={styles.userList}>
                {
                  _.map(invitedMembers, (member) => {
                    return (
                      <li className={styles.userItem} key={`user-card-${member.id}`}>
                        <UserCard
                          isInvite
                          user={member}
                          onRemoveClick={this.onRemoveClick}
                          updateProjectNember={updateProjectNember}
                          isEditable={isEditable} />
                      </li>
                    )
                  })
                }
              </ul>
            </>
          )
        }

      </div>
    )
  }
}

Users.propTypes = {
  loadProject: PropTypes.func.isRequired,
  updateProjectNember: PropTypes.func.isRequired,
  removeProjectNember: PropTypes.func.isRequired,
  addNewProjectInvite: PropTypes.func.isRequired,
  addNewProjectMember: PropTypes.func.isRequired,
  auth: PropTypes.object,
  isEditable: PropTypes.bool,
  isSearchingUserProjects: PropTypes.bool,
  projects: PropTypes.arrayOf(PropTypes.object),
  projectMembers: PropTypes.arrayOf(PropTypes.object),
  invitedMembers: PropTypes.arrayOf(PropTypes.object),
  searchUserProjects: PropTypes.func.isRequired,
  resultSearchUserProjects: PropTypes.arrayOf(PropTypes.object)
}

export default Users
