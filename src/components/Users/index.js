import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cn from 'classnames'
import styles from './Users.module.scss'
import Select from '../Select'
import UserCard from '../UserCard'
import PrimaryButton from '../Buttons/PrimaryButton'
import Modal from '../Modal'
import SelectUserAutocomplete from '../SelectUserAutocomplete'
import { PROJECT_ROLES, AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../config/constants'
import { checkAdmin, checkManager } from '../../util/tc'
import { addUserToProject, removeUserFromProject } from '../../services/projects'
import ConfirmationModal from '../Modal/ConfirmationModal'

const theme = {
  container: styles.modalContainer
}

class Users extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectOption: null,
      showAddUserModal: false,
      userToAdd: null,
      userPermissionToAdd: PROJECT_ROLES.READ,
      showSelectUserError: false,
      isAdding: false,
      addUserError: false,
      isRemoving: false,
      removeError: null,
      showRemoveConfirmationModal: false,
      userToRemove: null,
      searchKey: ''
    }
    this.setProjectOption = this.setProjectOption.bind(this)
    this.onAddUserClick = this.onAddUserClick.bind(this)
    this.resetAddUserState = this.resetAddUserState.bind(this)
    this.onUpdateUserToAdd = this.onUpdateUserToAdd.bind(this)
    this.onAddUserConfirmClick = this.onAddUserConfirmClick.bind(this)
    this.updatePermission = this.updatePermission.bind(this)
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

  updatePermission (newRole) {
    this.setState({
      userPermissionToAdd: newRole
    })
  }

  onAddUserClick () {
    this.setState({
      showAddUserModal: true
    })
  }

  resetAddUserState () {
    this.setState({
      userToAdd: null,
      showSelectUserError: false,
      isAdding: false,
      showAddUserModal: false,
      userPermissionToAdd: PROJECT_ROLES.READ,
      addUserError: null
    })
  }

  onUpdateUserToAdd (option) {
    let userToAdd = null
    if (option && option.value) {
      userToAdd = {
        handle: option.label,
        userId: parseInt(option.value, 10)
      }
    }

    this.setState({
      userToAdd,
      showSelectUserError: !userToAdd
    })
  }

  async onAddUserConfirmClick () {
    const { addNewProjectMember } = this.props
    if (this.state.isAdding) { return }

    this.setState({
      showSelectUserError: false,
      addUserError: null
    })

    if (!this.state.userToAdd) {
      this.setState({
        showSelectUserError: true
      })
      return
    }

    this.setState({
      isAdding: true
    })

    try {
      const newUserInfo = await addUserToProject(this.state.projectOption.value, this.state.userToAdd.userId, this.state.userPermissionToAdd)
      newUserInfo.handle = this.state.userToAdd.handle
      // wait for a second so that project's members are updated
      addNewProjectMember(newUserInfo)
      this.resetAddUserState()
    } catch (e) {
      const error = _.get(
        e,
        'response.data.message',
        `Unable to add user`
      )
      this.setState({ isAdding: false, addUserError: error })
    }
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

    const { removeProjectNember } = this.props
    const userToRemove = this.state.userToRemove
    try {
      this.setState({ isRemoving: true })
      await removeUserFromProject(userToRemove.projectId, userToRemove.id)
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
      updateProjectNember,
      isEditable,
      isSearchingUserProjects,
      resultSearchUserProjects,
      loadNextProjects
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
    const membersExist = projectMembers && projectMembers.length > 0
    const isCopilotOrManager = this.checkIsCopilotOrManager(projectMembers, loggedInHandle)
    const isAdmin = checkAdmin(this.props.auth.token)
    const isManager = checkManager(this.props.auth.token)
    const showAddUser = isEditable && this.state.projectOption && (isCopilotOrManager || isAdmin || isManager)

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
                onMenuScrollBottom={loadNextProjects}
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
            </div>
          )
        }
        {
          this.state.showAddUserModal && (
            <Modal theme={theme} onCancel={() => this.resetAddUserState()}>
              <div className={cn(styles.contentContainer, styles.confirm)}>
                <div className={styles.title}>Add User</div>
                <div className={styles.addUserContentContainer}>
                  <div className={styles.row}>
                    <div className={cn(styles.field, styles.col1, styles.addUserTitle)}>
                      Member<span className={styles.required}>*</span> :
                    </div>
                    <div className={cn(styles.field, styles.col2)}>
                      <SelectUserAutocomplete
                        value={this.state.userToAdd ? { label: this.state.userToAdd.handle, value: this.state.userToAdd.userId.toString() } : null}
                        onChange={this.onUpdateUserToAdd}
                      />
                    </div>
                  </div>
                  {
                    this.state.showSelectUserError && (
                      <div className={styles.row}>
                        <div className={styles.errorMesssage}>Please select a member.</div>
                      </div>
                    )
                  }
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
                          checked={this.state.userPermissionToAdd === PROJECT_ROLES.READ}
                          onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.READ)}
                        />
                        <label htmlFor={`read-add-user`}>
                          <div>
                            Read
                          </div>
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
                          checked={this.state.userPermissionToAdd === PROJECT_ROLES.WRITE}
                          onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.WRITE)}
                        />
                        <label htmlFor={`write-add-user`}>
                          <div>
                            Write
                          </div>
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
                          checked={this.state.userPermissionToAdd === PROJECT_ROLES.MANAGER}
                          onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.MANAGER)}
                        />
                        <label htmlFor={`full-access-add-user`}>
                          <div>
                            Full Access
                          </div>
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
                          checked={this.state.userPermissionToAdd === PROJECT_ROLES.COPILOT}
                          onChange={(e) => e.target.checked && this.updatePermission(PROJECT_ROLES.COPILOT)}
                        />
                        <label htmlFor={`copilot-add-user`}>
                          <div>
                            Copilot
                          </div>
                          <input type='hidden' />
                        </label>
                      </div>
                    </div>
                  </div>
                  {
                    this.state.addUserError && (
                      <div className={styles.errorMesssage}>
                        {this.state.addUserError}
                      </div>
                    )
                  }
                </div>

                <div className={styles.buttonGroup}>
                  <div className={styles.buttonSizeA}>
                    <PrimaryButton
                      text={'Close'}
                      type={'info'}
                      onClick={() => this.resetAddUserState()}
                    />
                  </div>
                  <div className={styles.buttonSizeA}>
                    <PrimaryButton
                      text={this.state.isAdding ? 'Adding user...' : 'Add User'}
                      type={'info'}
                      onClick={() => this.onAddUserConfirmClick()}
                    />
                  </div>
                </div>
              </div>
            </Modal>
          )
        }
        {
          this.state.showRemoveConfirmationModal && (
            <ConfirmationModal
              title='Confirm Removal'
              message={`Are you sure you want to remove ${this.state.userToRemove.handle} from this project?`}
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
  addNewProjectMember: PropTypes.func.isRequired,
  auth: PropTypes.object,
  isEditable: PropTypes.bool,
  isSearchingUserProjects: PropTypes.bool,
  projects: PropTypes.arrayOf(PropTypes.object),
  projectMembers: PropTypes.arrayOf(PropTypes.object),
  searchUserProjects: PropTypes.func.isRequired,
  resultSearchUserProjects: PropTypes.arrayOf(PropTypes.object),
  loadNextProjects: PropTypes.func.isRequired
}

export default Users
