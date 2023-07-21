import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import PT from 'prop-types'
import UsersComponent from '../../components/Users'
import { PROJECT_ROLES } from '../../config/constants'
import { fetchProjectById } from '../../services/projects'

class Users extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loginUserRoleInProject: '',
      projectMembers: null
    }
    this.loadProject = this.loadProject.bind(this)
  }

  componentDidMount () {
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
      this.setState({
        projectMembers
      })
      const { loggedInUser } = this.props
      this.updateLoginUserRoleInProject(projectMembers, loggedInUser)
    })
  }

  render () {
    const {
      projects,
      auth
    } = this.props
    const {
      projectMembers
    } = this.state
    return (
      <UsersComponent
        projects={projects}
        loadProject={this.loadProject}
        projectMembers={projectMembers}
        auth={auth}
        isEditable={this.isEditable()}
      />
    )
  }
}

const mapStateToProps = ({ sidebar, auth }) => {
  return {
    projects: sidebar.projects,
    auth,
    loggedInUser: auth.user
  }
}

Users.propTypes = {
  projects: PT.arrayOf(PT.object),
  auth: PT.object,
  loggedInUser: PT.object
}

export default connect(mapStateToProps)(Users)
