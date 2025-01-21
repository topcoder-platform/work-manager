/**
 * Component to render Challenges page
 */
import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { CONNECT_APP_URL, PROJECT_ROLES } from '../../config/constants'
import { PrimaryButton } from '../Buttons'
import ChallengeList from './ChallengeList'
import styles from './ChallengesComponent.module.scss'
import { checkReadOnlyRoles } from '../../util/tc'

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
  isBillingAccountLoadingFailed,
  isBillingAccountLoading,
  selfService,
  auth,
  challengeTypes
}) => {
  const [loginUserRoleInProject, setLoginUserRoleInProject] = useState('')
  const isReadOnly = checkReadOnlyRoles(auth.token) || loginUserRoleInProject === PROJECT_ROLES.READ

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
          </div>
          {activeProject && activeProject.id && (
            <span>
              (
              <a
                href={`${CONNECT_APP_URL}/projects/${activeProject.id}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                View Project
              </a>
              )
            </span>
          )}
        </div>
        {activeProject && activeProject.id && !isReadOnly ? (
          <Link
            className={styles.buttonLaunchNew}
            to={`/projects/${activeProject.id}/challenges/new`}
          >
            <PrimaryButton text={'Launch New'} type={'info'} />
          </Link>
        ) : (
          <span />
        )}
      </div>}
      <div className={styles.challenges}>
        <ChallengeList
          challenges={challenges}
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
