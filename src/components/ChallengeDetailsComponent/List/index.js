/**
 * Component to render submissions of a challenge
 * It uses different components for rendering Marathon Matches and other ones
 */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import MMSubmissionList from './MMSubmissionList'
import SubmissionList from './SubmissionList'
import Loader from '../../Loader'
import styles from './List.module.scss'

const List = ({ challenge, isChallengeSubmissionsLoading, challengeSubmissions, isMarathonMatch, challengeId }) => {
  if (isChallengeSubmissionsLoading) {
    return <Loader />
  }

  const submissionsWithMemberHandleColors = challengeSubmissions.map(s => {
    const registrant = _.find(challenge.registrants, { handle: s.memberHandle })
    const memberHandleColor = _.get(registrant, 'colorStyle', '').replace(/color:\s*/, '')

    return {
      ...s,
      memberHandleColor
    }
  })

  return (
    <div>
      <h2 className={styles.heading}>Submissions</h2>
      {isMarathonMatch &&
        <MMSubmissionList submissions={submissionsWithMemberHandleColors} challengeId={challengeId} />}
      {!isMarathonMatch &&
        <SubmissionList submissions={submissionsWithMemberHandleColors} challengeId={challengeId} />}
    </div>
  )
}

List.propTypes = {
  challenge: PropTypes.object,
  isChallengeSubmissionsLoading: PropTypes.bool,
  challengeSubmissions: PropTypes.arrayOf(PropTypes.object),
  isMarathonMatch: PropTypes.bool,
  challengeId: PropTypes.number
}

export default List
