import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import PT from 'prop-types'
import UsersComponent from '../../components/Users'
import { loadProjects } from '../../actions/sidebar'
import {
  loadProject,
  reloadProjectMembers
} from '../../actions/projects'

class Users extends Component {
  componentDidMount () {
    this.props.loadProjects()
  }

  render () {
    const { projects, loadProject, projectMembers, auth, reloadProjectMembers } = this.props
    return <UsersComponent projects={projects} loadProject={loadProject} projectMembers={projectMembers} auth={auth} reloadProjectMembers={reloadProjectMembers} />
  }
}

const mapStateToProps = ({ sidebar, challenges, auth }) => {
  return {
    projects: sidebar.projects,
    projectMembers: _.get(challenges, 'metadata.members'),
    auth
  }
}

const mapDispatchToProps = {
  loadProject,
  loadProjects,
  reloadProjectMembers
}

Users.propTypes = {
  loadProject: PT.func.isRequired,
  loadProjects: PT.func.isRequired,
  reloadProjectMembers: PT.func.isRequired,
  projects: PT.arrayOf(PT.object),
  projectMembers: PT.arrayOf(PT.object),
  auth: PT.object
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
