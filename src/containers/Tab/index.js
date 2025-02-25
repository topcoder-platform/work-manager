import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Tab from '../../components/Tab'
import {
  loadProjects,
  loadTaasProjects,
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
    this.onTabChange = this.onTabChange.bind(this)
  }

  componentDidMount () {
    const {
      projectId,
      activeProjectId,
      isLoading,
      selfService,
      history
    } = this.props
    if (
      !projectId &&
      activeProjectId === -1 &&
      !isLoading &&
      !selfService &&
      // do not fetch projects for users page
      history.location.pathname !== '/users'
    ) {
      this.loadProjects(this.props)
    }

    if (projectId && activeProjectId < 0) {
      this.props.setActiveProject(parseInt(projectId))
    }
  }

  componentWillReceiveProps (nextProps) {
    const { projectId, isLoading, selfService, projects, isLoadProjectsSuccess } = nextProps

    if (nextProps.history.location.pathname === '/') {
      this.setState({ currentTab: 1 })
    } else if (nextProps.history.location.pathname === '/projects') {
      this.setState({ currentTab: 2 })
    } else if (nextProps.history.location.pathname === '/users') {
      this.setState({ currentTab: 3 })
    } else if (nextProps.history.location.pathname === '/self-service') {
      this.setState({ currentTab: 4 })
    } else if (nextProps.history.location.pathname === '/taas') {
      this.setState({ currentTab: 5 })
    } else {
      this.setState({ currentTab: 0 })
    }
    if (
      isLoading ||
      // do not fetch projects for users page
      nextProps.history.location.pathname === '/users'
    ) {
      return
    }
    // if we're viewing a specific project,
    // or we're viewing the self serve page,
    // or if the project is already loading,
    // don't load the projects
    if (!!projectId || selfService) {
      // if we're not in the middle of loading,
      // and we have projects to unload,
      // unload them
      if (!!projects && !!projects.length) {
        this.props.unloadProjects()
      }

      return
    }

    // if we already have projects in the list,
    // don't load the projects again
    if ((!!projects && !!projects.length) || isLoadProjectsSuccess) {
      return
    }

    // now it's okay to load the projects
    this.loadProjects(nextProps)
  }

  loadProjects (props) {
    const { history } = props

    if (history.location.pathname === '/taas') {
      this.props.loadTaasProjects()
    } else {
      this.props.loadProjects()
    }
  }

  onTabChange (tab) {
    const { history, resetSidebarActiveParams } = this.props
    if (tab === 1) {
      history.push('/')
      this.setState({ currentTab: 1 })
    } else if (tab === 2) {
      history.push('/projects')
      this.props.unloadProjects()
      this.setState({ currentTab: 2 })
    } else if (tab === 3) {
      history.push('/users')
      this.setState({ currentTab: 3 })
    } else if (tab === 4) {
      history.push('/self-service')
      this.setState({ currentTab: 4 })
    } else if (tab === 5) {
      history.push('/taas')
      this.props.unloadProjects()
      this.setState({ currentTab: 5 })
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
  isLoadProjectsSuccess: PropTypes.bool,
  loadProjects: PropTypes.func,
  loadTaasProjects: PropTypes.func,
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
  loadTaasProjects,
  unloadProjects,
  setActiveProject,
  resetSidebarActiveParams
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TabContainer)
)
