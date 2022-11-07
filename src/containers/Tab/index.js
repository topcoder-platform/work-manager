import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Tab from '../../components/Tab'
import {
  loadProjects,
  setActiveProject,
  resetSidebarActiveParams,
  unloadProjects
} from '../../actions/sidebar'

class TabContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchProjectName: '',
      currentTab: 1
    }
    this.updateProjectName = this.updateProjectName.bind(this)
    this.onTabChange = this.onTabChange.bind(this)
  }

  componentDidMount () {
    const { projectId, activeProjectId, isLoading, selfService } = this.props
    if (!projectId && activeProjectId === -1 && !isLoading && !selfService) {
      this.props.loadProjects()
    }

    if (projectId && activeProjectId < 0) {
      this.props.setActiveProject(parseInt(projectId))
    }
  }

  componentWillReceiveProps (nextProps) {
    const { projectId, isLoading, selfService, projects } = nextProps

    if (nextProps.history.location.pathname === '/') {
      this.setState({ currentTab: 1 })
    } else if (nextProps.history.location.pathname === '/projects') {
      this.setState({ currentTab: 2 })
    } else if (nextProps.history.location.pathname === '/users') {
      this.setState({ currentTab: 3 })
    } else {
      this.setState({ currentTab: 0 })
    }
    // if we're viewing a specific project,
    // or we're viewing the self serve page,
    // or if the project is already loading,
    // don't load the projects
    if (!!projectId || selfService || isLoading) {
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

  onTabChange (tab) {
    const { history, resetSidebarActiveParams } = this.props
    if (tab === 1) {
      history.push('/')
      this.setState({ currentTab: 1 })
    } else if (tab === 2) {
      history.push('/projects')
      this.setState({ currentTab: 2 })
    } else if (tab === 3) {
      history.push('/users')
      this.setState({ currentTab: 3 })
    }

    resetSidebarActiveParams()
  }

  render () {
    const { currentTab } = this.state

    return <Tab selectTab={this.onTabChange} currentTab={currentTab} />
  }
}

TabContainer.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  loadProjects: PropTypes.func,
  unloadProjects: PropTypes.func,
  activeProjectId: PropTypes.number,
  history: PropTypes.any.isRequired,
  setActiveProject: PropTypes.func,
  projectId: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func,
  selfService: PropTypes.bool
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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TabContainer)
)
