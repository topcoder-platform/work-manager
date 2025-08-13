/**
 * Component to render Challenges page
 */
import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import ProjectStatus from './ProjectStatus'
import { PROJECT_ROLES, PROJECT_STATUS, COPILOTS_URL, CHALLENGE_STATUS } from '../../config/constants'
import { PrimaryButton, OutlineButton } from '../Buttons'
import ChallengeList from './ChallengeList'
import styles from './ChallengesComponent.module.scss'
import { checkAdmin, checkReadOnlyRoles, checkAdminOrCopilot, checkManager } from '../../util/tc'

const ChallengesComponent = ({
  challenges,
  projects,
  isLoading,
  setActiveProject,
  warnMessage,
  filterChallengeName,
  filterChallengeType,
  filterDate,
  filterSortBy,
  filterSortOrder,
  activeProject,
  filterProjectOption,
  dashboard,
  status,
  loadChallengesByPage,
  activeProjectId,
  page,
  perPage,
  totalChallenges,
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
  selfService,
  auth,
  challengeTypes,
  fetchNextProjects
}) => {
  const [loginUserRoleInProject, setLoginUserRoleInProject] = useState('')
  const isReadOnly = checkReadOnlyRoles(auth.token) || loginUserRoleInProject === PROJECT_ROLES.READ
  const isAdminOrCopilot = checkAdminOrCopilot(auth.token, activeProject)

  const projectStatus = activeProject && activeProject.status
    ? activeProject.status.toUpperCase()
    : ''
  const isCompletedOrCancelled =
  projectStatus === CHALLENGE_STATUS.CANCELLED || projectStatus === CHALLENGE_STATUS.COMPLETED

  useEffect(() => {
    const loggedInUser = auth.user
    const projectMembers = activeProject.members
    const loginUserProjectInfo = _.find(projectMembers, { userId: loggedInUser.userId })
    if (loginUserProjectInfo && loginUserRoleInProject !== loginUserProjectInfo.role) {
      setLoginUserRoleInProject(loginUserProjectInfo.role)
    }
  }, [activeProject, auth])

  return (
    <div>
      <Helmet title={activeProject ? activeProject.name : ''} />
      {!dashboard && <div className={styles.titleContainer}>
        <div className={styles.titleLinks}>
          <div className={styles.title}>
            {activeProject ? activeProject.name : ''}
            {activeProject && activeProject.status && <ProjectStatus className={styles.status} status={activeProject.status} />}
          </div>
          {activeProject && activeProject.id && isAdminOrCopilot && (
            <span>
              (
              <Link
                to={`/projects/${activeProject.id}/edit`}
              >
                Edit Project
              </Link>
              )
            </span>
          )}
        </div>
        {activeProject && activeProject.id && !isReadOnly ? (
          <div className={styles.projectActionButtonWrapper}>
            {(checkAdmin(auth.token) || checkManager(auth.token)) && (
              <OutlineButton
                text={'Users'}
                type='info'
                submit
                link={{
                  pathname: '/users',
                  state: { projectId: activeProjectId, projectName: activeProject.name }
                }}
                className={styles.btnOutline}
              />
            )}
            {isAdminOrCopilot && (
              <OutlineButton
                text={'Assets Library'}
                type={'info'}
                submit
                link={`/projects/${activeProjectId}/assets`}
                className={styles.btnOutline}
              />
            )}
            {(checkAdmin(auth.token) || checkManager(auth.token)) && !isCompletedOrCancelled && (
              <OutlineButton
                text='Request Copilot'
                type={'info'}
                url={`${COPILOTS_URL}/requests/new?projectId=${activeProject.id}`}
                target={'_blank'}
              />
            )}
            {activeProject.status === PROJECT_STATUS.ACTIVE ? (
              <Link
                to={`/projects/${activeProject.id}/challenges/new`}
              >
                <PrimaryButton text={'Launch New'} type={'info'} />
              </Link>
            ) : (
              <PrimaryButton text={'Launch New'} type={'info'} disabled />
            )}
          </div>
        ) : (
          <span />
        )}
      </div>}
      <div className={styles.challenges}>
        <ChallengeList
          challenges={challenges}
          fetchNextProjects={fetchNextProjects}
          projects={projects}
          warnMessage={warnMessage}
          isLoading={isLoading}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          filterChallengeName={filterChallengeName}
          filterChallengeType={filterChallengeType}
          filterProjectOption={filterProjectOption}
          filterDate={filterDate}
          filterSortBy={filterSortBy}
          filterSortOrder={filterSortOrder}
          dashboard={dashboard}
          status={status}
          loadChallengesByPage={loadChallengesByPage}
          activeProjectId={activeProjectId}
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
          loginUserRoleInProject={loginUserRoleInProject}
        />
      </div>
    </div>
  )
}

ChallengesComponent.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object),
  projects: PropTypes.arrayOf(PropTypes.object),
  fetchNextProjects: PropTypes.func.isRequired,
  activeProject: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  isLoading: PropTypes.bool,
  warnMessage: PropTypes.string,
  filterChallengeName: PropTypes.string,
  filterChallengeType: PropTypes.shape(),
  filterProjectOption: PropTypes.shape(),
  filterDate: PropTypes.shape(),
  filterSortBy: PropTypes.string,
  filterSortOrder: PropTypes.string,
  status: PropTypes.string,
  activeProjectId: PropTypes.number,
  loadChallengesByPage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  totalChallenges: PropTypes.number.isRequired,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  deleteChallenge: PropTypes.func.isRequired,
  setActiveProject: PropTypes.func.isRequired,
  isBillingAccountExpired: PropTypes.bool,
  dashboard: PropTypes.bool,
  billingStartDate: PropTypes.string,
  billingEndDate: PropTypes.string,
  billingAccounts: PropTypes.arrayOf(PropTypes.shape()),
  updateProject: PropTypes.func.isRequired,
  isBillingAccountsLoading: PropTypes.bool,
  currentBillingAccount: PropTypes.number,
  isBillingAccountLoadingFailed: PropTypes.bool,
  isBillingAccountLoading: PropTypes.bool,
  selfService: PropTypes.bool,
  auth: PropTypes.object.isRequired,
  challengeTypes: PropTypes.arrayOf(PropTypes.shape())
}

ChallengesComponent.defaultProps = {
  challenges: [],
  isLoading: true,
  challengeTypes: []
}

export default ChallengesComponent
