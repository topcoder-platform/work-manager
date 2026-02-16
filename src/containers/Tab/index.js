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
import { checkAdmin, checkCopilot, checkAdminOrTalentManager } from '../../util/tc'

class TabContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchProjectName: '',
      currentTab: 1
    }
    this.onTabChange = this.onTabChange.bind(this)
    this.onBackToHome = this.onBackToHome.bind(this)
    this.getProjectTabFromPath = this.getProjectTabFromPath.bind(this)
    this.getTabFromPath = this.getTabFromPath.bind(this)
  }

  getCanViewAssets (props = this.props) {
    const { token: currentToken } = this.props
    const { token } = props
    const resolvedToken = token || currentToken
    return !!resolvedToken && (checkAdmin(resolvedToken) || checkCopilot(resolvedToken))
  }

  getCanViewEngagements (props = this.props) {
    const { token: currentToken } = this.props
    const { token } = props
    const resolvedToken = token || currentToken
    return !!resolvedToken && checkAdminOrTalentManager(resolvedToken)
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
      history.location.pathname === '/'
    ) {
      this.loadProjects(this.props)
    }

    if (projectId && activeProjectId < 0) {
      this.props.setActiveProject(parseInt(projectId))
    }

    const canViewAssets = this.getCanViewAssets()
    const canViewEngagements = this.getCanViewEngagements()
    this.setState({
      currentTab: this.getTabFromPath(history.location.pathname, projectId, canViewAssets, canViewEngagements)
    })
  }

  componentWillReceiveProps (nextProps) {
    const { projectId, activeProjectId, isLoading, selfService, projects, isLoadProjectsSuccess } = nextProps

    if (projectId && activeProjectId < 0) {
      this.props.setActiveProject(parseInt(projectId))
    }

    const canViewAssets = this.getCanViewAssets(nextProps)
    const canViewEngagements = this.getCanViewEngagements(nextProps)
    this.setState({
      currentTab: this.getTabFromPath(nextProps.history.location.pathname, projectId, canViewAssets, canViewEngagements)
    })
    if (
      isLoading ||
      // do not fetch projects for users or groups page
      nextProps.history.location.pathname === '/users' ||
      nextProps.history.location.pathname === '/groups' ||
      nextProps.history.location.pathname === '/engagements'
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

  getProjectTabFromPath (pathname, projectId, canViewAssets = true, canViewEngagements = false) {
    if (!projectId) {
      return 0
    }
    if (pathname.includes(`/projects/${projectId}/engagements`)) {
      return canViewEngagements ? 2 : 0
    }
    if (pathname.includes(`/projects/${projectId}/assets`)) {
      return canViewAssets ? 3 : 0
    }
    if (pathname.includes(`/projects/${projectId}/challenges`)) {
      return 1
    }
    return 0
  }

  getTabFromPath (pathname, projectId, canViewAssets = true, canViewEngagements = false) {
    if (projectId) {
      return this.getProjectTabFromPath(pathname, projectId, canViewAssets, canViewEngagements)
    }
    if (pathname === '/') {
      return 1
    }
    if (pathname === '/projects') {
      return 2
    }
    if (pathname === '/engagements') {
      return canViewEngagements ? 3 : 0
    }
    if (pathname === '/users') {
      return 4
    }
    if (pathname === '/self-service') {
      return 5
    }
    if (pathname === '/taas') {
      return 6
    }
    if (pathname === '/groups') {
      return 7
    }
    return 0
  }
  loadProjects (props) {
    const { history } = props

    if (history.location.pathname === '/') {
      this.props.loadProjects()
    }
  }

  onBackToHome () {
    const { history, resetSidebarActiveParams, backPath } = this.props
    if (backPath) {
      history.push(backPath)
    } else {
      history.push('/')
    }
    resetSidebarActiveParams()
  }

  onTabChange (tab) {
    const { history, resetSidebarActiveParams, projectId } = this.props
    const canViewAssets = this.getCanViewAssets()
    const canViewEngagements = this.getCanViewEngagements()
    if (projectId) {
      if ((tab === 2 && !canViewEngagements) || (tab === 3 && !canViewAssets)) {
        return
      }
      if (tab === 1) {
        history.push(`/projects/${projectId}/challenges`)
        this.setState({ currentTab: 1 })
      } else if (tab === 2 && canViewEngagements) {
        history.push(`/projects/${projectId}/engagements`)
        this.setState({ currentTab: 2 })
      } else if (tab === 3) {
        history.push(`/projects/${projectId}/assets`)
        this.setState({ currentTab: 3 })
      }
    } else if (tab === 1) {
      history.push('/')
      this.setState({ currentTab: 1 })
    } else if (tab === 2) {
      history.push('/projects')
      this.props.unloadProjects()
      this.setState({ currentTab: 2 })
    } else if (tab === 3 && canViewEngagements) {
      history.push('/engagements')
      this.setState({ currentTab: 3 })
    } else if (tab === 4) {
      history.push('/users')
      this.setState({ currentTab: 4 })
    } else if (tab === 5) {
      history.push('/self-service')
      this.setState({ currentTab: 5 })
    } else if (tab === 6) {
      history.push('/taas')
      this.props.unloadProjects()
      this.setState({ currentTab: 6 })
    } else if (tab === 7) {
      history.push('/groups')
      this.setState({ currentTab: 7 })
    }

    resetSidebarActiveParams()
  }

  render () {
    const { currentTab } = this.state
    const canViewAssets = this.getCanViewAssets()
    const canViewEngagements = this.getCanViewEngagements()

    return (
      <Tab
        selectTab={this.onTabChange}
        currentTab={currentTab}
        projectId={this.props.projectId}
        canViewAssets={canViewAssets}
        canViewEngagements={canViewEngagements}
        onBack={this.onBackToHome}
      />
    )
  }
}

TabContainer.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  isLoadProjectsSuccess: PropTypes.bool,
  loadProjects: PropTypes.func,
  unloadProjects: PropTypes.func,
  activeProjectId: PropTypes.number,
  history: PropTypes.any.isRequired,
  setActiveProject: PropTypes.func,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backPath: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func,
  selfService: PropTypes.bool,
  token: PropTypes.string
}

const mapStateToProps = ({ sidebar, auth }) => ({
  ...sidebar,
  token: auth.token
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
