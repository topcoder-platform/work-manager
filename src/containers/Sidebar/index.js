import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import { loadProjects, setActiveProject, resetSidebarActiveParams, unloadProjects } from '../../actions/sidebar'

class SidebarContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchProjectName: ''
    }
    this.updateProjectName = this.updateProjectName.bind(this)
  }

  componentDidMount () {
    const { projectId, activeProjectId, isLoading, selfServe } = this.props
    if (!projectId && activeProjectId === -1 && !isLoading && !selfServe) {
      this.props.loadProjects()
    }

    if (projectId && activeProjectId < 0) {
      this.props.setActiveProject(parseInt(projectId))
    }
  }

  componentWillReceiveProps (nextProps) {
    const { projectId, isLoading, selfServe, projects } = nextProps

    // if we're viewing a specific project,
    // or we're viewing the self serve page,
    // or if the project is already loading,
    // don't load the projects
    if (!!projectId || selfServe || isLoading) {
      // if we're not in the middle of loading,
      // and we have projects to unload,
      // unload them
      if (!isLoading && !!projects && !!projects.length) {
        this.props.unloadProjects()
      }

      return
    }

    // if we already have projects in the list,
    // don't load the projects again
    if (!!projects && !!projects.length) {
      return
    }

    // now it's okay to load the projects
    this.props.loadProjects()
  }

  updateProjectName (val) {
    this.setState({ searchProjectName: val })
    this.props.loadProjects(val)
  }

  render () {
    const { isLoading, setActiveProject, projectId, resetSidebarActiveParams, projects, selfServe, unloadProjects } = this.props
    const { searchProjectName } = this.state

    return (
      <Sidebar
        projects={_.sortBy(projects, ['name'])}
        isLoading={isLoading}
        setActiveProject={setActiveProject}
        projectId={projectId}
        resetSidebarActiveParams={resetSidebarActiveParams}
        updateProjectsList={this.updateProjectName}
        searchProjectName={searchProjectName}
        selfServe={selfServe}
        unloadProjects={unloadProjects}
      />
    )
  }
}

SidebarContainer.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  loadProjects: PropTypes.func,
  unloadProjects: PropTypes.func,
  activeProjectId: PropTypes.number,
  setActiveProject: PropTypes.func,
  projectId: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func,
  selfServe: PropTypes.bool
}

const mapStateToProps = ({ sidebar }) => ({
  ...sidebar
})

const mapDispatchToProps = {
  loadProjects,
  unloadProjects,
  setActiveProject,
  resetSidebarActiveParams
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContainer)
