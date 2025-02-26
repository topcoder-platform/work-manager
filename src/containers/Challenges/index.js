/**
 * Container to render Challenges page
 */
import _ from 'lodash'
import React, { Component, Fragment } from 'react'
// import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import ChallengesComponent from '../../components/ChallengesComponent'
import ProjectCard from '../../components/ProjectCard'
// import Loader from '../../components/Loader'
import {
  loadChallengesByPage,
  partiallyUpdateChallengeDetails,
  deleteChallenge,
  loadChallengeTypes
} from '../../actions/challenges'
import { loadProject, updateProject } from '../../actions/projects'
import {
  loadMoreProjects,
  loadProjects,
  setActiveProject,
  resetSidebarActiveParams
} from '../../actions/sidebar'
import styles from './Challenges.module.scss'
import { checkAdmin, checkAdminOrCopilot } from '../../util/tc'
import { PrimaryButton } from '../../components/Buttons'
import InfiniteLoadTrigger from '../../components/InfiniteLoadTrigger'

class Challenges extends Component {
  constructor (props) {
    super(props)
    this.state = {
      onlyMyProjects: true
    }
  }

  componentDidMount () {
    const {
      dashboard,
      activeProjectId,
      resetSidebarActiveParams,
      menu,
      projectId,
      selfService,
      loadChallengeTypes
    } = this.props
    loadChallengeTypes()
    if (dashboard) {
      this.reloadChallenges(this.props, true, true)
    }
    if (menu === 'NULL' && activeProjectId !== -1) {
      resetSidebarActiveParams()
    } else if (projectId || selfService) {
      if (projectId && projectId !== -1) {
        window.localStorage.setItem('projectLoading', 'true')
        this.props.loadProject(projectId)
      }
      this.reloadChallenges(this.props, true)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (
      (nextProps.dashboard && this.props.dashboard !== nextProps.dashboard) ||
      this.props.activeProjectId !== nextProps.activeProjectId
    ) {
      this.reloadChallenges(nextProps, false)
    }
  }

  reloadChallenges (props, forceLoad) {
    const {
      activeProjectId,
      projectDetail: reduxProjectInfo,
      projectId,
      dashboard,
      challengeProjectId,
      loadProject,
      selfService
    } = props
    if (activeProjectId !== challengeProjectId || selfService || forceLoad) {
      const isAdmin = checkAdmin(this.props.auth.token)
      this.props.loadChallengesByPage(
        1,
        projectId ? parseInt(projectId) : -1,
        'all',
        dashboard,
        '',
        selfService,
        isAdmin ? null : this.props.auth.user.handle,
        this.props.auth.user.userId
      )
      const projectLoading =
        window.localStorage.getItem('projectLoading') !== null
      if (
        !selfService &&
        (!reduxProjectInfo || `${reduxProjectInfo.id}` !== projectId) &&
        !projectLoading
      ) {
        if (projectId) {
          loadProject(projectId)
        }
      } else {
        window.localStorage.removeItem('projectLoading')
      }
    }
  }

  render () {
    const {
      challenges,
      isLoading,
      warnMessage,
      filterChallengeName,
      filterChallengeType,
      filterDate,
      filterSortBy,
      filterSortOrder,
      filterProjectOption,
      projects,
      activeProjectId,
      status,
      projectDetail: reduxProjectInfo,
      loadChallengesByPage,
      page,
      perPage,
      totalChallenges,
      setActiveProject,
      partiallyUpdateChallengeDetails,
      deleteChallenge,
      isBillingAccountExpired,
      billingStartDate,
      billingEndDate,
      billingAccounts,
      currentBillingAccount,
      updateProject,
      isBillingAccountsLoading,
      isBillingAccountLoadingFailed,
      isBillingAccountLoading,
      dashboard,
      selfService,
      auth,
      metadata
    } = this.props
    const { challengeTypes = [] } = metadata
    const projectInfo = _.find(projects, { id: activeProjectId }) || {}
    const projectComponents =
      !dashboard &&
      projects.map((p) => (
        <li key={p.id}>
          <ProjectCard
            projectStatus={p.status}
            projectName={p.name}
            projectId={p.id}
            selected={activeProjectId === `${p.id}`}
            setActiveProject={setActiveProject}
          />
        </li>
      ))
    return (
      <Fragment>
        {!dashboard &&
        (!!projectComponents.length ||
          (activeProjectId === -1 && !selfService)) ? (
            <div className={!dashboard && styles.projectSearch}>
              {activeProjectId === -1 && !selfService && (
                <div className={styles.buttonNewProjectWrapper}>
                  <div>No project selected. Select one below</div>
                  {checkAdminOrCopilot(auth.token) && (
                    <Link className={styles.buttonNewProject} to={`/projects/new`}>
                      <PrimaryButton text={'Create Project'} type={'info'} />
                    </Link>
                  )}
                </div>
              )}
              <ul>{projectComponents}</ul>
              {projects && !!projects.length && (
                <InfiniteLoadTrigger onLoadMore={this.props.loadMoreProjects} />
              )}
            </div>
          ) : null}
        {(dashboard || activeProjectId !== -1 || selfService) && (
          <ChallengesComponent
            activeProject={{
              ...projectInfo,
              ...(reduxProjectInfo && reduxProjectInfo.id === activeProjectId
                ? reduxProjectInfo
                : {})
            }}
            warnMessage={warnMessage}
            setActiveProject={setActiveProject}
            dashboard={dashboard}
            challenges={challenges}
            isLoading={isLoading}
            filterChallengeName={filterChallengeName}
            projects={projects}
            filterChallengeType={filterChallengeType}
            filterDate={filterDate}
            filterProjectOption={filterProjectOption}
            filterSortBy={filterSortBy}
            filterSortOrder={filterSortOrder}
            status={status}
            activeProjectId={activeProjectId}
            loadChallengesByPage={loadChallengesByPage}
            page={page}
            perPage={perPage}
            totalChallenges={totalChallenges}
            partiallyUpdateChallengeDetails={partiallyUpdateChallengeDetails}
            deleteChallenge={deleteChallenge}
            isBillingAccountExpired={isBillingAccountExpired}
            billingStartDate={billingStartDate}
            billingEndDate={billingEndDate}
            billingAccounts={billingAccounts}
            currentBillingAccount={currentBillingAccount}
            updateProject={updateProject}
            isBillingAccountsLoading={isBillingAccountsLoading}
            isBillingAccountLoadingFailed={isBillingAccountLoadingFailed}
            isBillingAccountLoading={isBillingAccountLoading}
            selfService={selfService}
            auth={auth}
            challengeTypes={challengeTypes}
          />
        )}
      </Fragment>
    )
  }
}

Challenges.defaultProps = {
  isLoading: false
}

Challenges.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  menu: PropTypes.string,
  challenges: PropTypes.arrayOf(PropTypes.object),
  projectDetail: PropTypes.object,
  isLoading: PropTypes.bool,
  loadChallengesByPage: PropTypes.func,
  loadProject: PropTypes.func.isRequired,
  projectId: PropTypes.string,
  activeProjectId: PropTypes.number,
  warnMessage: PropTypes.string,
  filterChallengeType: PropTypes.shape(),
  filterChallengeName: PropTypes.string,
  filterProjectOption: PropTypes.shape(),
  filterDate: PropTypes.shape(),
  filterSortBy: PropTypes.string,
  filterSortOrder: PropTypes.string,
  status: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  totalChallenges: PropTypes.number.isRequired,
  setActiveProject: PropTypes.func.isRequired,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  deleteChallenge: PropTypes.func.isRequired,
  isBillingAccountExpired: PropTypes.bool,
  billingStartDate: PropTypes.string,
  billingEndDate: PropTypes.string,
  billingAccounts: PropTypes.arrayOf(PropTypes.shape()),
  currentBillingAccount: PropTypes.number,
  updateProject: PropTypes.func.isRequired,
  isBillingAccountsLoading: PropTypes.bool,
  isBillingAccountLoadingFailed: PropTypes.bool,
  isBillingAccountLoading: PropTypes.bool,
  selfService: PropTypes.bool,
  dashboard: PropTypes.bool,
  auth: PropTypes.object.isRequired,
  loadChallengeTypes: PropTypes.func,
  loadMoreProjects: PropTypes.func,
  metadata: PropTypes.shape({
    challengeTypes: PropTypes.array
  })
}

const mapStateToProps = ({ challenges, sidebar, projects, auth }) => ({
  ..._.omit(challenges, ['projectId']),
  challengeProjectId: challenges.projectId,
  activeProjectId: sidebar.activeProjectId,
  projects: sidebar.projects,
  projectDetail: projects.projectDetail,
  isBillingAccountExpired: projects.isBillingAccountExpired,
  billingStartDate: projects.billingStartDate,
  billingEndDate: projects.billingEndDate,
  billingAccounts: projects.billingAccounts,
  currentBillingAccount: projects.currentBillingAccount,
  updateProject: projects.updateProject,
  isBillingAccountsLoading: projects.isBillingAccountsLoading,
  isBillingAccountLoadingFailed: projects.isBillingAccountLoadingFailed,
  isBillingAccountLoading: projects.isBillingAccountLoading,
  auth: auth,
  metadata: challenges.metadata
})

const mapDispatchToProps = {
  loadChallengesByPage,
  resetSidebarActiveParams,
  loadMoreProjects,
  loadProject,
  loadProjects,
  updateProject,
  loadChallengeTypes,
  setActiveProject,
  partiallyUpdateChallengeDetails,
  deleteChallenge
}

export default connect(mapStateToProps, mapDispatchToProps)(Challenges)
