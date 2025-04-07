import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import PT from 'prop-types'
import UsersComponent from '../../components/Users'
import { PROJECT_ROLES } from '../../config/constants'
import { fetchProjectById } from '../../services/projects'
import { checkAdmin } from '../../util/tc'

import {
  loadAllUserProjects,
  searchUserProjects
} from '../../actions/users'

class Users extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loginUserRoleInProject: '',
      projectMembers: null,
      invitedMembers: null,
      isAdmin: false
    }
    this.loadProject = this.loadProject.bind(this)
    this.updateProjectNember = this.updateProjectNember.bind(this)
    this.removeProjectNember = this.removeProjectNember.bind(this)
    this.addNewProjectInvite = this.addNewProjectInvite.bind(this)
    this.addNewProjectMember = this.addNewProjectMember.bind(this)
  }

  componentDidMount () {
    const { token, isLoading, loadAllUserProjects } = this.props
    if (!isLoading) {
      const isAdmin = checkAdmin(token)
      loadAllUserProjects(isAdmin)
      this.setState({
        isAdmin
      })
    }
  }

  isEditable () {
    const { loginUserRoleInProject } = this.state
    if (loginUserRoleInProject === PROJECT_ROLES.READ) {
      return false
    }
    return true
  }

  componentWillReceiveProps (nextProps) {
    const { loggedInUser } = nextProps
    const { projectMembers } = this.state
    this.updateLoginUserRoleInProject(projectMembers, loggedInUser)
  }

  updateLoginUserRoleInProject (projectMembers, loggedInUser) {
    if (projectMembers && loggedInUser) {
      const loginUserProjectInfo = _.find(projectMembers, { userId: loggedInUser.userId })
      if (loginUserProjectInfo && this.state.loginUserRoleInProject !== loginUserProjectInfo.role) {
        this.setState({
          loginUserRoleInProject: loginUserProjectInfo.role
        })
      }
    }
  }

  loadProject (projectId) {
    fetchProjectById(projectId).then((project) => {
      const projectMembers = _.get(project, 'members')
      const invitedMembers = _.get(project, 'invites')
      this.setState({
        projectMembers,
        invitedMembers
      })
      const { loggedInUser } = this.props
      this.updateLoginUserRoleInProject(projectMembers, loggedInUser)
    })
  }

  updateProjectNember (newMemberInfo) {
    const { projectMembers } = this.state
    const newProjectMembers = projectMembers.map(pm => pm.id === newMemberInfo.id ? ({
      ...pm,
      ...newMemberInfo
    }) : pm)
    const { loggedInUser } = this.props
    this.setState({
      projectMembers: newProjectMembers
    })
    this.updateLoginUserRoleInProject(newProjectMembers, loggedInUser)
  }

  removeProjectNember (projectMember) {
    const { projectMembers, invitedMembers } = this.state
    const newProjectMembers = _.filter(projectMembers, pm => pm.id !== projectMember.id)
    const newInvitedMembers = _.filter(invitedMembers, pm => pm.id !== projectMember.id)
    const { loggedInUser } = this.props
    this.setState({
      projectMembers: newProjectMembers,
      invitedMembers: newInvitedMembers
    })
    this.updateLoginUserRoleInProject(newProjectMembers, loggedInUser)
  }

  addNewProjectMember (projectMember) {
    const { projectMembers } = this.state
    const newProjectMembers = [
      ...projectMembers,
      projectMember
    ]
    const { loggedInUser } = this.props
    this.setState({
      projectMembers: newProjectMembers
    })
    this.updateLoginUserRoleInProject(newProjectMembers, loggedInUser)
  }

  addNewProjectInvite (invitedMember) {
    this.setState(() => ({
      invitedMembers: [
        ...(this.state.invitedMembers || []),
        invitedMember
      ]
    }))
  }

  render () {
    const {
      projects,
      auth,
      searchUserProjects,
      resultSearchUserProjects,
      isSearchingUserProjects
    } = this.props
    const {
      projectMembers,
      invitedMembers,
      isAdmin
    } = this.state
    return (
      <UsersComponent
        projects={projects}
        loadProject={this.loadProject}
        updateProjectNember={this.updateProjectNember}
        removeProjectNember={this.removeProjectNember}
        addNewProjectMember={this.addNewProjectMember}
        addNewProjectInvite={this.addNewProjectInvite}
        projectMembers={projectMembers}
        invitedMembers={invitedMembers}
        auth={auth}
        isAdmin={isAdmin}
        isEditable={this.isEditable()}
        resultSearchUserProjects={resultSearchUserProjects}
        isSearchingUserProjects={isSearchingUserProjects}
        searchUserProjects={(key) => {
          searchUserProjects(isAdmin, key)
        }}
      />
    )
  }
}

const mapStateToProps = ({ users, auth }) => {
  return {
    projects: users.allUserProjects,
    isLoading: users.isLoadingAllUserProjects,
    resultSearchUserProjects: users.searchUserProjects,
    isSearchingUserProjects: users.isSearchingUserProjects,
    auth,
    loggedInUser: auth.user,
    token: auth.token
  }
}

Users.propTypes = {
  projects: PT.arrayOf(PT.object),
  resultSearchUserProjects: PT.arrayOf(PT.object),
  auth: PT.object,
  loggedInUser: PT.object,
  token: PT.string,
  isLoading: PT.bool,
  isSearchingUserProjects: PT.bool,
  loadAllUserProjects: PT.func.isRequired,
  searchUserProjects: PT.func.isRequired
}

const mapDispatchToProps = {
  loadAllUserProjects,
  searchUserProjects
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
