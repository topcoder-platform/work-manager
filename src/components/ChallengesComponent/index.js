/**
 * Component to render Challenges page
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { CONNECT_APP_URL } from '../../config/constants'
import { PrimaryButton } from '../Buttons'
import ChallengeList from './ChallengeList'
import styles from './ChallengesComponent.module.scss'
import Loader from '../Loader'
import xss from 'xss'

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
  return (
    <div>
      <Helmet title={activeProject ? activeProject.name : ''} />
      {!dashboard && <div className={styles.titleContainer}>
        <div className={styles.titleLinks}>
          <div
            className={styles.title}
            dangerouslySetInnerHTML={{
              __html: xss(activeProject ? activeProject.name : '')
            }}
          />
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
        {activeProject && activeProject.id ? (
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
        {isLoading ? (
          <Loader />
        ) : (
          <ChallengeList
            challenges={challenges}
            projects={projects}
            warnMessage={warnMessage}
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
          />
        )}
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
