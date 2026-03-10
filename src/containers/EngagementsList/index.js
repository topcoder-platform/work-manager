import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EngagementsList from '../../components/EngagementsList'
import { loadEngagements, deleteEngagement } from '../../actions/engagements'
import { loadProject } from '../../actions/projects'
import { fetchMemberProjects } from '../../services/projects'
import { checkAdmin, checkAdminOrPmOrTaskManager, checkTalentManager } from '../../util/tc'

/**
 * Loads and wires engagement list data for the current project context.
 * Computes permission flags (`canManage`, `isAdmin`) and injects dispatch props,
 * including `deleteEngagement` for admin-only delete flows in the list UI.
 */
class EngagementsListContainer extends Component {
  componentDidMount () {
    this.loadData()
  }

  componentDidUpdate (prevProps) {
    const currentProjectId = this.getProjectId()
    const prevProjectId = this.getProjectIdFromProps(prevProps)
    if (currentProjectId !== prevProjectId) {
      this.loadData()
    }
  }

  getProjectId () {
    const { projectId, match } = this.props
    const resolvedProjectId = projectId || _.get(match, 'params.projectId')
    return resolvedProjectId ? parseInt(resolvedProjectId, 10) : null
  }

  getProjectIdFromProps (props) {
    const projectId = props.projectId || _.get(props, 'match.params.projectId')
    return projectId ? parseInt(projectId, 10) : null
  }

  async loadData () {
    const projectId = this.getProjectId()
    const { loadProject, loadEngagements, allEngagements } = this.props
    if (projectId) {
      loadProject(projectId)
    }
    if (!projectId && !allEngagements) {
      return
    }

    if (!projectId && allEngagements && this.isTalentManagerOnly()) {
      const tmProjectIds = await this.loadTmProjectIds()
      loadEngagements(null, 'all', '', true, tmProjectIds)
      return
    }

    loadEngagements(projectId, 'all', '', this.canIncludePrivate())
  }

  canManage () {
    const { auth, projectDetail } = this.props
    return checkAdminOrPmOrTaskManager(auth.token, projectDetail)
  }

  canIncludePrivate () {
    const { auth } = this.props
    if (!auth || !auth.token) {
      return false
    }
    return checkAdminOrPmOrTaskManager(auth.token, null)
  }

  isAdmin () {
    const { auth } = this.props
    if (!auth || !auth.token) {
      return false
    }
    return checkAdmin(auth.token)
  }

  /**
   * Checks whether the current user is a Talent Manager without Admin role.
   *
   * @returns {Boolean} true when user is TM-only.
   */
  isTalentManagerOnly () {
    const { auth } = this.props
    if (!auth || !auth.token) {
      return false
    }
    return checkTalentManager(auth.token) && !checkAdmin(auth.token)
  }

  /**
   * Loads all member projects for the current TM user and returns unique IDs.
   *
   * @returns {Promise<Array<string>>} Unique project ids as strings.
   */
  async loadTmProjectIds () {
    try {
      const perPage = 100
      let page = 1
      let hasMore = true
      let projects = []

      while (hasMore) {
        const response = await fetchMemberProjects({ memberOnly: true, page, perPage })
        const pageProjects = _.get(response, 'projects', [])
        const totalPages = _.get(response, 'pagination.xTotalPages', null)
        projects = projects.concat(pageProjects)
        if (totalPages) {
          hasMore = page < totalPages
        } else {
          hasMore = pageProjects.length === perPage
        }
        page += 1
      }

      return _.uniq(
        projects
          .map(project => _.get(project, 'id', null))
          .filter(Boolean)
          .map(projectId => `${projectId}`)
      )
    } catch (error) {
      return []
    }
  }

  render () {
    const projectId = this.getProjectId()
    return (
      <EngagementsList
        engagements={this.props.engagements}
        projectId={projectId}
        projectDetail={this.props.projectDetail}
        allEngagements={this.props.allEngagements}
        isLoading={this.props.isLoading}
        canManage={this.canManage()}
        isAdmin={this.isAdmin()}
        deleteEngagement={this.props.deleteEngagement}
        currentUser={this.props.auth.user}
      />
    )
  }
}

EngagementsListContainer.propTypes = {
  allEngagements: PropTypes.bool,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string
    })
  }),
  engagements: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  projectDetail: PropTypes.shape({
    members: PropTypes.arrayOf(PropTypes.shape())
  }),
  auth: PropTypes.shape({
    token: PropTypes.string,
    user: PropTypes.shape({
      userId: PropTypes.number,
      handle: PropTypes.string
    })
  }).isRequired,
  loadEngagements: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired,
  deleteEngagement: PropTypes.func.isRequired
}

EngagementsListContainer.defaultProps = {
  allEngagements: false
}

const mapStateToProps = (state) => ({
  engagements: state.engagements.engagements,
  isLoading: state.engagements.isLoading,
  projectDetail: state.projects.projectDetail,
  auth: state.auth
})

const mapDispatchToProps = {
  loadEngagements,
  loadProject,
  deleteEngagement
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementsListContainer)
)
