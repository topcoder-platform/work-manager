import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import PT from 'prop-types'
import UsersComponent from '../../components/Users'
import { loadProject, reloadProjectMembers } from '../../actions/projects'
import { PROJECT_ROLES } from '../../config/constants'

class Users extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loginUserRoleInProject: ''
    }
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
    const { projectDetail, loggedInUser } = nextProps
    if (projectDetail && loggedInUser) {
      const projectMembers = projectDetail.members
      const loginUserProjectInfo = _.find(projectMembers, { userId: loggedInUser.userId })
      if (loginUserProjectInfo && this.state.loginUserRoleInProject !== loginUserProjectInfo.role) {
        this.setState({
          loginUserRoleInProject: loginUserProjectInfo.role
        })
      }
    }
  }

  render () {
    const {
      projects,
      loadProject,
      projectMembers,
      auth,
      reloadProjectMembers,
      projectDetail
    } = this.props
    return (
      <UsersComponent
        projectDetail={projectDetail}
        projects={projects}
        loadProject={loadProject}
        projectMembers={projectMembers}
        auth={auth}
        reloadProjectMembers={reloadProjectMembers}
        isEditable={this.isEditable()}
      />
    )
  }
}

const mapStateToProps = ({ sidebar, challenges, auth, projects }) => {
  return {
    projects: sidebar.projects,
    projectMembers: _.get(challenges, 'metadata.members'),
    projectDetail: projects.projectDetail,
    auth,
    loggedInUser: auth.user
  }
}

const mapDispatchToProps = {
  loadProject,
  reloadProjectMembers
}

Users.propTypes = {
  loadProject: PT.func.isRequired,
  reloadProjectMembers: PT.func.isRequired,
  projects: PT.arrayOf(PT.object),
  projectMembers: PT.arrayOf(PT.object),
  auth: PT.object,
  projectDetail: PT.object,
  loggedInUser: PT.object
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
