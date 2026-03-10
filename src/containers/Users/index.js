import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import PT from 'prop-types'
import { withRouter } from 'react-router-dom'
import UsersComponent from '../../components/Users'
import { PROJECT_ROLES } from '../../config/constants'
import { fetchProjectById, fetchProjectMembers } from '../../services/projects'
import { getProjectMemberInvites } from '../../services/projectMemberInvites'
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
      isLoadingProject: false,
      project: props.location.state && props.location.state.projectId ? {
        id: props.location.state && props.location.state.projectId,
        name: props.location.state && props.location.state.projectName
      } : null
    }
    this.loadProject = this.loadProject.bind(this)
    this.updateProjectMember = this.updateProjectMember.bind(this)
    this.removeProjectMember = this.removeProjectMember.bind(this)
    this.addNewProjectInvite = this.addNewProjectInvite.bind(this)
    this.addNewProjectMember = this.addNewProjectMember.bind(this)
    this.loadNextProjects = this.loadNextProjects.bind(this)
  }

  componentDidMount () {
    const { token, isLoading, loadAllUserProjects, page, location } = this.props
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

      if (location.state && location.state.projectId) {
        this.loadProject(location.state.projectId)
      }
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

  /**
   * Loads project details plus project-scoped members/invites into local state.
   *
   * Members and invites are loaded from their dedicated project endpoints so
   * handle resolution follows project permissions instead of a separate member
   * directory lookup.
   *
   * @param {string|number} projectId Project id to load.
   * @returns {void}
   */
  loadProject (projectId) {
    this.setState({ isLoadingProject: true })
    Promise.all([
      fetchProjectById(projectId),
      fetchProjectMembers(projectId),
      getProjectMemberInvites(projectId)
    ]).then(([project, projectMembers, invitedMembers]) => {
      const normalizedProjectMembers = projectMembers || []
      const normalizedInvitedMembers = invitedMembers || []
      let resolvedProject = this.state.project

      if (!resolvedProject && project && project.id && project.name) {
        resolvedProject = {
          id: project.id,
          name: project.name
        }
      }

      this.setState({
        projectMembers: normalizedProjectMembers,
        invitedMembers: normalizedInvitedMembers,
        project: resolvedProject,
        isLoadingProject: false
      })
      const { loggedInUser } = this.props
      this.updateLoginUserRoleInProject(normalizedProjectMembers, loggedInUser)
    })
  }

  updateProjectMember (newMemberInfo) {
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

  removeProjectMember (projectMember) {
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
      project,
      projectMembers,
      invitedMembers,
      isAdmin,
      isLoadingProject
    } = this.state
    return (
      <UsersComponent
        initialProject={project}
        projects={projects}
        loadProject={this.loadProject}
        updateProjectMember={this.updateProjectMember}
        removeProjectMember={this.removeProjectMember}
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
  location: PT.object.isRequired,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Users))
