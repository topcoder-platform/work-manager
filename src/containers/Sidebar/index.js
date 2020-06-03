import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import { loadProjects, setActiveProject, resetSidebarActiveParams } from '../../actions/sidebar'

class SidebarContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchProjectName: ''
    }
    this.updateProjectName = this.updateProjectName.bind(this)
  }

  componentDidMount () {
    // this.props.loadProjects()

    const { projectId, activeProjectId } = this.props

    if (projectId && activeProjectId < 0) {
      this.props.setActiveProject(parseInt(projectId))
    }
  }

  updateProjectName (val) {
    this.setState({ searchProjectName: val })
    this.props.loadProjects(val)
  }

  render () {
    const { isLoading, setActiveProject, projectId, resetSidebarActiveParams, projects } = this.props
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
      />
    )
  }
}

SidebarContainer.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  loadProjects: PropTypes.func,
  activeProjectId: PropTypes.number,
  setActiveProject: PropTypes.func,
  projectId: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func
}

const mapStateToProps = ({ sidebar }) => ({
  ...sidebar
})

const mapDispatchToProps = {
  loadProjects,
  setActiveProject,
  resetSidebarActiveParams
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContainer)
