import React, { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import cn from 'classnames'
import { PrimaryButton } from '../../components/Buttons'
import styles from './ProjectEditor.module.scss'
import ProjectForm from '../../components/ProjectForm'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  loadProjectTypes,
  loadProject,
  createProject,
  updateProject
} from '../../actions/projects'
import { setActiveProject } from '../../actions/sidebar'
import { checkAdminOrCopilot, checkAdmin, checkIsUserInvited } from '../../util/tc'
import { PROJECT_ROLES } from '../../config/constants'
import Loader from '../../components/Loader'

class ProjectEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      project: {}
    }
  }
  // load the project types
  componentDidMount () {
    const { match, isEdit, loadProjectTypes } = this.props
    loadProjectTypes()
    if (isEdit) {
      this.fetchProjectDetails(match)
    }
  }

  componentDidUpdate () {
    const { auth } = this.props

    if (checkIsUserInvited(auth.token, this.props.projectDetail)) {
      this.props.history.push(`/projects/${this.props.projectDetail.id}/invitation`)
    }

    if (!checkAdminOrCopilot(auth.token, this.props.projectDetail)) {
      this.props.history.push('/projects')
    }
  }

  getProjectId (match) {
    let projectId = _.get(match.params, 'projectId', null)
    projectId = projectId ? parseInt(projectId) : null
    return projectId
  }

  async fetchProjectDetails (match) {
    let projectId = this.getProjectId(match)
    if (projectId) {
      await this.props.loadProject(projectId)
    }
  }

  getMemberRole (members, userId) {
    if (!userId) { return null }

    const found = _.find(members, (m) => {
      return m.userId === userId
    })

    return _.get(found, 'role')
  }

  checkIsCopilotOrManager (projectMembers, userId) {
    if (projectMembers && projectMembers.length > 0) {
      const role = this.getMemberRole(projectMembers, userId)
      return role === PROJECT_ROLES.COPILOT || role === PROJECT_ROLES.MANAGER
    } else {
      return false
    }
  }

  render () {
    const {
      match,
      projectTypes,
      createProject,
      updateProject,
      setActiveProject,
      isProjectTypesLoading,
      history,
      isEdit,
      isProjectLoading,
      projectDetail
    } = this.props

    if (isProjectTypesLoading || (isEdit && isProjectLoading)) return <Loader />

    const isAdmin = checkAdmin(this.props.auth.token)
    const isCopilotOrManager = this.checkIsCopilotOrManager(_.get(projectDetail, 'members', []), _.get(this.props.auth, 'user.userId', null))
    const canManage = isAdmin || isCopilotOrManager

    const projectId = this.getProjectId(match)
    return (
      <div className={styles.wrapper}>
        <Helmet title={'Create Project'} />
        <div className={styles.topContainer}>
          <div className={styles.leftContainer}>
            <div className={styles.title}>
              {isEdit ? 'Edit Project' : 'Create Project'}
            </div>
          </div>
          <div className={cn(styles.actionButtons, styles.actionButtonsRight)}>
            <PrimaryButton
              text={'Back'}
              type={'info'}
              submit
              link={isEdit ? `/projects/${projectId}/challenges` : `/projects`}
            />
          </div>
        </div>
        <div className={styles.textRequired}>* Required</div>
        <div className={styles.container}>
          <div className={styles.formContainer}>
            <ProjectForm
              projectTypes={projectTypes}
              createProject={createProject}
              updateProject={updateProject}
              setActiveProject={setActiveProject}
              history={history}
              isEdit={isEdit}
              canManage={canManage}
              projectDetail={projectDetail}
            />
          </div>
        </div>
      </div>
    )
  }
}

ProjectEditor.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      projectId: PropTypes.string
    })
  }).isRequired,
  projectTypes: PropTypes.arrayOf(PropTypes.object),
  loadProjectTypes: PropTypes.func,
  createProject: PropTypes.func,
  updateProject: PropTypes.func,
  isProjectTypesLoading: PropTypes.bool,
  auth: PropTypes.object,
  history: PropTypes.object,
  setActiveProject: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  loadProject: PropTypes.func,
  isProjectLoading: PropTypes.bool,
  projectDetail: PropTypes.object
}

const mapStateToProps = (state) => ({
  projectTypes: state.projects.projectTypes,
  auth: state.auth,
  isProjectTypesLoading: state.projects.isProjectTypesLoading,
  projectDetail: state.projects.projectDetail,
  isProjectLoading: state.projects.isLoading
})

const mapDispatchToProps = {
  loadProjectTypes,
  loadProject,
  createProject,
  updateProject,
  setActiveProject
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProjectEditor)
)
