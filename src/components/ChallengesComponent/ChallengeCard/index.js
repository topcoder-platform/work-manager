/**
 * Component to render a row for ChallengeList component
 */
// import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import moment from 'moment'
import 'moment-duration-format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faUser } from '@fortawesome/free-solid-svg-icons'
import ChallengeStatus from '../ChallengeStatus'
import TrackIcon from '../../TrackIcon'
import styles from './ChallengeCard.module.scss'
import { getFormattedDuration, getLastDate } from '../../../util/date'
import { CHALLENGE_STATUS, getForumURL } from '../../../config/constants'

const STALLED_MSG = 'Stalled'
const DRAFT_MSG = 'In Draft'
const STALLED_TIME_LEFT_MSG = 'Challenge is currently on hold'
const FF_TIME_LEFT_MSG = 'Winner is working on fixes'

const getEndDate = (c) => {
  let phases = c.allPhases
  if (c.subTrack === 'FIRST_2_FINISH' && c.status === 'COMPLETED') {
    phases = c.allPhases.filter(p => p.phaseType === 'Iterative Review' && p.phaseStatus === 'Closed')
  }
  const endPhaseDate = getLastDate(phases.map(d => new Date(d.scheduledEndTime)))
  return moment(endPhaseDate).format('MMM DD')
}

/**
 * Format the remaining time of a challenge phase
 * @param phase Challenge phase
 * @param status Challenge status
 * @returns {*}
 */
const getTimeLeft = (phase, status) => {
  if (!phase) return STALLED_TIME_LEFT_MSG
  if (phase.phaseType === 'Final Fix') {
    return FF_TIME_LEFT_MSG
  }

  let time = moment(phase.scheduledEndTime).diff()
  const late = time < 0
  if (late) time = -time

  if (status !== CHALLENGE_STATUS.COMPLETED) {
    const duration = getFormattedDuration(time)
    return late ? `Late by ${duration}` : `${duration} to go`
  }

  return moment(phase.scheduledEndTime).format('DD/MM/YYYY')
}

/**
 * Find current phase and remaining time of it
 * @param c Challenge
 * @returns {{phaseMessage: string, endTime: {late, text}}}
 */
const getPhaseInfo = (c) => {
  const { allPhases, currentPhases, subTrack, status } = c
  const checkPhases = (currentPhases && currentPhases.length > 0 ? currentPhases : allPhases)
  let statusPhase = checkPhases
    .filter(p => p.phaseType !== 'Registration')
    .sort((a, b) => moment(a.scheduledEndTime).diff(b.scheduledEndTime))[0]

  if (!statusPhase && subTrack === 'FIRST_2_FINISH' && checkPhases.length) {
    statusPhase = Object.clone(checkPhases[0])
    statusPhase.phaseType = 'Submission'
  }
  let phaseMessage = STALLED_MSG
  if (statusPhase) phaseMessage = statusPhase.phaseType
  else if (status === 'DRAFT') phaseMessage = DRAFT_MSG

  const endTime = getTimeLeft(statusPhase)
  return { phaseMessage, endTime }
}

/**
 * Render components when mouse hover
 * @param challenge
 * @returns {*}
 */
const hoverComponents = (challenge) => {
  switch (challenge.status) {
    case CHALLENGE_STATUS.DRAFT:
      return (<ChallengeStatus status={CHALLENGE_STATUS.ACTIVE} isBig={challenge.status !== ''} />)
    case CHALLENGE_STATUS.COMPLETED:
      return (
        <div className={cn(styles.linkGroup, styles.onlyOne)}>
          <a className={styles.link} href={getForumURL(challenge.forumId)}>View Forum</a>
        </div>
      )
    case CHALLENGE_STATUS.ACTIVE:
    default:
      return (
        <div className={styles.linkGroup}>
          <Link className={styles.link} to={`/projects/12738/challenges/${challenge.id}/edit`}>Edit</Link>
          <a className={styles.link} href={getForumURL(challenge.forumId)}>View Forum</a>
        </div>
      )
  }
}

const renderStatus = (status) => {
  switch (status) {
    case CHALLENGE_STATUS.ACTIVE:
    case CHALLENGE_STATUS.DRAFT:
    case CHALLENGE_STATUS.COMPLETED:
      return (<ChallengeStatus status={status} />)
    default:
      return (<span className={styles.statusText}>{status}</span>)
  }
}

class ChallengeCard extends React.Component {
  render () {
    const { challenge } = this.props
    const { phaseMessage, endTime } = getPhaseInfo(challenge)

    return (
      <div className={styles.item}>
        <Link className={styles.col1} to={`/challenges/${challenge.id}`}>
          <div>
            <TrackIcon className={styles.icon} track={challenge.track} subTrack={challenge.subTrack} />
          </div>
          <div className={styles.name}>
            <span className={styles.block}>{challenge.name}</span>
            <span className='block light-text'>Ends {getEndDate(challenge)}</span>
          </div>
        </Link>
        <Link className={styles.col2} to={`/challenges/${challenge.id}`}>
          { renderStatus(challenge.status) }
        </Link>
        <Link className={styles.col3} to={`/challenges/${challenge.id}`}>
          <span className={styles.block}>{phaseMessage}</span>
          <span className='block light-text'>{endTime}</span>
        </Link>
        <div className={cn(styles.col4, styles.editingContainer)}>
          {hoverComponents(challenge)}
        </div>
        <div className={cn(styles.col4, styles.iconsContainer)}>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faUser} className={styles.faIcon} />
            <span>{challenge.numRegistrants}</span>
          </div>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faFile} className={styles.faIcon} />
            <span>{challenge.numSubmissions}</span>
          </div>
        </div>
      </div>
    )
  }
}

ChallengeCard.propTypes = {
  challenge: PropTypes.object
}

export default withRouter(ChallengeCard)
