import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import { SIDEBAR_MENU } from '../../config/constants'
import { loadProjects, setActiveMenu, setActiveProject, resetSidebarActiveParams } from '../../actions/sidebar'

class SidebarContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedProjectId: -1
    }

    this.setSelectedProject = this.setSelectedProject.bind(this)
  }

  componentDidMount () {
    this.props.loadProjects()

    const { projectId, menu } = this.props

    if (projectId) {
      this.props.setActiveProject(parseInt(projectId))
    }

    if (menu) {
      const sidebarMenuItems = _.values(SIDEBAR_MENU)

      if (_.indexOf(sidebarMenuItems, menu) > -1) {
        this.props.setActiveMenu(menu)
      }
    }
  }

  setSelectedProject (projectId) {
    this.setState({
      selectedProjectId: this.state.selectedProjectId === projectId ? -1 : projectId
    })
  }

  render () {
    const { projects, isLoading, activeProjectId, activeMenu, setActiveMenu, setActiveProject, projectId, resetSidebarActiveParams } = this.props
    return (
      <Sidebar
        projects={_.sortBy(projects, ['name'])}
        isLoading={isLoading}
        activeProject={activeProjectId}
        activeMenu={activeMenu}
        selectedProject={this.state.selectedProjectId}
        setActiveMenu={setActiveMenu}
        setActiveProject={setActiveProject}
        setSelectedProject={this.setSelectedProject}
        projectId={projectId}
        resetSidebarActiveParams={resetSidebarActiveParams}
      />
    )
  }
}

SidebarContainer.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  loadProjects: PropTypes.func,
  activeProjectId: PropTypes.number,
  activeMenu: PropTypes.string,
  setActiveMenu: PropTypes.func,
  setActiveProject: PropTypes.func,
  projectId: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func,
  menu: PropTypes.string
}

const mapStateToProps = ({ sidebar }) => ({
  ...sidebar
})

const mapDispatchToProps = {
  loadProjects,
  setActiveMenu,
  setActiveProject,
  resetSidebarActiveParams
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContainer)
