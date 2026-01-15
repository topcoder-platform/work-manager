import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import EngagementsList from '../../components/EngagementsList'
import { loadEngagements, deleteEngagement } from '../../actions/engagements'
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
    const { loadProject, loadEngagements } = this.props
    if (!projectId) {
      return
    }
    loadProject(projectId)
    loadEngagements(projectId, 'all')
  }

  canManage () {
    const { auth, projectDetail } = this.props
    return checkAdminOrPmOrTaskManager(auth.token, projectDetail)
  }

  render () {
    const projectId = this.getProjectId()
    return (
      <EngagementsList
        engagements={this.props.engagements}
        projectId={projectId}
        projectDetail={this.props.projectDetail}
        isLoading={this.props.isLoading}
        canManage={this.canManage()}
        onDeleteEngagement={this.props.deleteEngagement}
      />
    )
  }
}

EngagementsListContainer.propTypes = {
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
      userId: PropTypes.number
    })
  }).isRequired,
  loadEngagements: PropTypes.func.isRequired,
  deleteEngagement: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  engagements: state.engagements.engagements,
  isLoading: state.engagements.isLoading,
  projectDetail: state.projects.projectDetail,
  auth: state.auth
})

const mapDispatchToProps = {
  loadEngagements,
  deleteEngagement,
  loadProject
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementsListContainer)
)
