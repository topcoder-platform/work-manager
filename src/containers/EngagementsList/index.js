import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EngagementsList from '../../components/EngagementsList'
import { loadEngagements } from '../../actions/engagements'
import { loadProject } from '../../actions/projects'
import { checkAdminOrPmOrTaskManager } from '../../util/tc'

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

  loadData () {
    const projectId = this.getProjectId()
    const { loadProject, loadEngagements, allEngagements } = this.props
    if (projectId) {
      loadProject(projectId)
    }
    if (!projectId && !allEngagements) {
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
  loadProject: PropTypes.func.isRequired
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
  loadProject
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementsListContainer)
)
