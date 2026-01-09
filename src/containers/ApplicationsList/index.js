import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ApplicationsList from '../../components/ApplicationsList'
import {
  loadApplications,
  loadApplicationDetails,
  updateApplicationStatus
} from '../../actions/applications'
import { loadEngagementDetails } from '../../actions/engagements'
import { loadProject } from '../../actions/projects'
import { checkAdmin, checkManager } from '../../util/tc'
import { PROJECT_ROLES } from '../../config/constants'

class ApplicationsListContainer extends Component {
  constructor (props) {
    super(props)
    this.handleUpdateStatus = this.handleUpdateStatus.bind(this)
  }

  componentDidMount () {
    this.loadData(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const currentParams = this.getParams(this.props)
    const nextParams = this.getParams(nextProps)
    if (
      currentParams.projectId !== nextParams.projectId ||
      currentParams.engagementId !== nextParams.engagementId
    ) {
      this.loadData(nextProps)
    }
  }

  getParams (props = this.props) {
    const projectId = props.projectId || _.get(props, 'match.params.projectId')
    const engagementId = props.engagementId || _.get(props, 'match.params.engagementId')
    return {
      projectId: projectId ? parseInt(projectId, 10) : null,
      engagementId: engagementId || null
    }
  }

  loadData (props) {
    const { projectId, engagementId } = this.getParams(props)
    if (projectId) {
      props.loadProject(projectId)
    }
    if (engagementId) {
      props.loadEngagementDetails(projectId, engagementId)
      props.loadApplications(engagementId)
    }
  }

  canManage () {
    const { auth, projectDetail } = this.props
    const isAdmin = checkAdmin(auth.token)
    const isManager = checkManager(auth.token)
    const members = _.get(projectDetail, 'members', [])
    const userId = _.get(auth, 'user.userId')
    const isProjectManager = members.some(member => member.userId === userId && member.role === PROJECT_ROLES.MANAGER)
    return isAdmin || isManager || isProjectManager
  }

  async handleUpdateStatus (applicationId, newStatus) {
    const { engagementId } = this.getParams()
    try {
      await this.props.updateApplicationStatus(engagementId, applicationId, newStatus)
      await this.props.loadApplications(engagementId)
    } catch (error) {
    }
  }

  render () {
    const { projectId } = this.getParams()
    return (
      <ApplicationsList
        applications={this.props.applications}
        engagement={this.props.engagementDetails}
        projectId={projectId}
        isLoading={this.props.isLoading}
        canManage={this.canManage()}
        onUpdateStatus={this.handleUpdateStatus}
      />
    )
  }
}

ApplicationsListContainer.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  engagementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
      engagementId: PropTypes.string
    })
  }),
  applications: PropTypes.arrayOf(PropTypes.shape()),
  engagementDetails: PropTypes.shape(),
  projectDetail: PropTypes.shape({
    members: PropTypes.arrayOf(PropTypes.shape())
  }),
  isLoading: PropTypes.bool,
  auth: PropTypes.shape({
    token: PropTypes.string,
    user: PropTypes.shape({
      userId: PropTypes.number
    })
  }).isRequired,
  loadApplications: PropTypes.func.isRequired,
  loadApplicationDetails: PropTypes.func.isRequired,
  updateApplicationStatus: PropTypes.func.isRequired,
  loadEngagementDetails: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  applications: state.applications.applications,
  applicationDetails: state.applications.applicationDetails,
  isLoading: state.applications.isLoading,
  engagementDetails: state.engagements.engagementDetails,
  projectDetail: state.projects.projectDetail,
  auth: state.auth
})

const mapDispatchToProps = {
  loadApplications,
  loadApplicationDetails,
  updateApplicationStatus,
  loadEngagementDetails,
  loadProject
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ApplicationsListContainer)
)
