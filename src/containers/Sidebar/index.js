import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import { loadProjects, setActiveMenu, setActiveProject } from '../../actions/sidebar'
import { loadChallenges } from '../../actions/challenges'

class SidebarContainer extends Component {
  componentDidMount () {
    this.props.loadProjects()
  }

  render () {
    const { projects, isLoading, activeProjectId, activeMenu, setActiveMenu, setActiveProject } = this.props
    return (
      <Sidebar
        projects={_.sortBy(projects, ['name'])}
        isLoading={isLoading}
        activeProject={activeProjectId}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        setActiveProject={setActiveProject}
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
  setActiveProject: PropTypes.func
}

const mapStateToProps = ({ sidebar }) => ({
  ...sidebar
})

const mapDispatchToProps = {
  loadProjects,
  setActiveMenu,
  setActiveProject,
  loadChallenges
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContainer)
