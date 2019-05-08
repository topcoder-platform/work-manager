/**
 * Component to render challenge details and submission details pages
 */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import PageHeader from '../PageHeader'
import styles from './ChallengeDetailsComponent.module.scss'
import ChallengeTags from './ChallengeTags'
import ChallengeInfo from './ChallengeInfo'
import { MARATHON_MATCH_SUBTRACKS } from '../../config/constants'
import List from './List'
import SubmissionDetails from './SubmissionDetails'
import { Redirect } from 'react-router-dom'

const isMarathonMatch = c => (MARATHON_MATCH_SUBTRACKS.includes(c.subTrack))

const ChallengeDetailsComponent = ({
  challenge,
  challengeTypes,
  submissionId,
  challengeSubmissions,
  isChallengeSubmissionsLoading,
  submissionDetails,
  isSubmissionLoading,
  isArtifactsLoading,
  submissionArtifacts,
  currentTab,
  switchTab,
  userToken }) => {
  const { challengeId, challengeTitle } = challenge
  const challengeTags = <ChallengeTags challenge={challenge} challengeTypes={challengeTypes} />
  const isOnSubmissionDetailsPage = !!submissionId
  if (challengeSubmissions.length === 0 && submissionId) {
    const submissionIds = _.map(challengeSubmissions, s => (s.submissions[0].id))
    if (!_.includes(submissionIds, submissionId)) return <Redirect to={`/challenges/${challengeId}`} />
  }
  return (
    <div>
      <Helmet title={challengeTitle || 'Challenge Details'} />
      <PageHeader title={challengeTitle} tags={challengeTags} />
      <div className={styles.challenges}>
        <ChallengeInfo challenge={challenge} />
        {!isOnSubmissionDetailsPage &&
          <List
            challenge={challenge}
            isMarathonMatch={isMarathonMatch(challenge)}
            isChallengeSubmissionsLoading={isChallengeSubmissionsLoading}
            challengeSubmissions={challengeSubmissions}
            challengeId={challengeId}
          />}
        {isOnSubmissionDetailsPage &&
          <SubmissionDetails
            submissionId={submissionId}
            isSubmissionLoading={isSubmissionLoading}
            submissionDetails={submissionDetails}
            challengeId={challengeId}
            downloadToken={userToken}
            isArtifactsLoading={isArtifactsLoading}
            submissionArtifacts={submissionArtifacts}
            currentTab={currentTab}
            switchTab={switchTab}
          />}
      </div>
    </div>
  )
}

ChallengeDetailsComponent.propTypes = {
  challenge: PropTypes.object,
  challengeTypes: PropTypes.arrayOf(PropTypes.object),
  submissionId: PropTypes.string,
  submissionDetails: PropTypes.object,
  isSubmissionLoading: PropTypes.bool,
  challengeSubmissions: PropTypes.arrayOf(PropTypes.object),
  isChallengeSubmissionsLoading: PropTypes.bool,
  userToken: PropTypes.string,
  isArtifactsLoading: PropTypes.bool,
  submissionArtifacts: PropTypes.object,
  currentTab: PropTypes.string,
  switchTab: PropTypes.func
}

ChallengeDetailsComponent.defaultProps = {
  challenge: null,
  challengeTypes: []
}

export default ChallengeDetailsComponent
