import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import PT from 'prop-types'
import UsersComponent from '../../components/Users'
import { PROJECT_ROLES } from '../../config/constants'
import { fetchInviteMembers, fetchProjectById } from '../../services/projects'
import { checkAdmin, checkManager } from '../../util/tc'

import {
  loadAllUserProjects,
  loadNextProjects,
  searchUserProjects
} from '../../actions/users'

class Users extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loginUserRoleInProject: '',
      projectMembers: null,
      invitedMembers: null,
      isAdmin: false,
      isLoadingProject: false
    }
    this.loadProject = this.loadProject.bind(this)
    this.updateProjectNember = this.updateProjectNember.bind(this)
    this.removeProjectNember = this.removeProjectNember.bind(this)
    this.addNewProjectInvite = this.addNewProjectInvite.bind(this)
    this.addNewProjectMember = this.addNewProjectMember.bind(this)
    this.loadNextProjects = this.loadNextProjects.bind(this)
  }

  componentDidMount () {
    const { token, isLoading, loadAllUserProjects, page } = this.props
    if (!isLoading) {
      const isAdmin = checkAdmin(token)
      const isManager = checkManager(token)
      const params = {
        page
      }
      loadAllUserProjects(params, isAdmin, isManager)
      this.setState({
        isAdmin
      })
    }
  }

  loadNextProjects () {
    const { loadNextProjects: nextProjectsHandler, token } = this.props
    const isAdmin = checkAdmin(token)
    const isManager = checkManager(token)

    nextProjectsHandler(isAdmin, isManager)
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
    this.setState({ isLoadingProject: true })
    fetchProjectById(projectId).then(async (project) => {
      const projectMembers = _.get(project, 'members')
      const invitedMembers = _.get(project, 'invites') || []
      const invitedUserIds = _.filter(_.map(invitedMembers, 'userId'))
      const invitedUsers = await fetchInviteMembers(invitedUserIds)

      this.setState({
        projectMembers,
        invitedMembers: invitedMembers.map(m => ({
          ...m,
          email: m.email || invitedUsers[m.userId].handle
        })),
        isLoadingProject: false
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
      isAdmin,
      isLoadingProject
    } = this.state
    return (
      <UsersComponent
        projects={projects}
        loadProject={this.loadProject}
        updateProjectNember={this.updateProjectNember}
        removeProjectNember={this.removeProjectNember}
        addNewProjectMember={this.addNewProjectMember}
        addNewProjectInvite={this.addNewProjectInvite}
        loadNextProjects={this.loadNextProjects}
        projectMembers={projectMembers}
        invitedMembers={invitedMembers}
        isLoadingProject={isLoadingProject}
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
    page: users.page,
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
  searchUserProjects: PT.func.isRequired,
  loadNextProjects: PT.func.isRequired,
  page: PT.number
}

const mapDispatchToProps = {
  loadAllUserProjects,
  searchUserProjects,
  loadNextProjects
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
