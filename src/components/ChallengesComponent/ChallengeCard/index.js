/**
 * Component to render a row for ChallengeList component
 */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import moment from 'moment'
import 'moment-duration-format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faUser } from '@fortawesome/free-solid-svg-icons'
import ChallengeStatus from '../ChallengeStatus'
import Modal from '../../Modal'
import TrackIcon from '../../TrackIcon'
import styles from './ChallengeCard.module.scss'
import { getFormattedDuration, getPhaseEndDate } from '../../../util/date'
import { CHALLENGE_STATUS, COMMUNITY_APP_URL } from '../../../config/constants'
import { OutlineButton, PrimaryButton } from '../../Buttons'
import { patchChallenge } from '../../../services/challenges'

const theme = {
  container: styles.modalContainer
}

const STALLED_MSG = 'Stalled'
const DRAFT_MSG = 'In Draft'
const STALLED_TIME_LEFT_MSG = 'Challenge is currently on hold'
const FF_TIME_LEFT_MSG = 'Winner is working on fixes'

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
  let checkPhases = (currentPhases && currentPhases.length > 0 ? currentPhases : allPhases)
  if (_.isEmpty(checkPhases)) checkPhases = []
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
 * @param onUpdateLaunch
 * @returns {*}
 */
const hoverComponents = (challenge, onUpdateLaunch) => {
  switch (challenge.status.toUpperCase()) {
    case CHALLENGE_STATUS.DRAFT:
      return (
        <ChallengeStatus
          status={CHALLENGE_STATUS.ACTIVE}
          isBig={challenge.status !== ''}
          challengeId={challenge.id}
          onUpdateLaunch={onUpdateLaunch}
        />
      )
    case CHALLENGE_STATUS.ACTIVE:
    default:
      return (
        <div className={styles.linkGroup}>
          <Link className={styles.link} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/edit`}>Edit</Link>
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
  constructor (props) {
    super(props)
    this.state = {
      isConfirm: false,
      isLaunch: false,
      isSaving: false
    }
    this.onUpdateConfirm = this.onUpdateConfirm.bind(this)
    this.onUpdateLaunch = this.onUpdateLaunch.bind(this)
    this.resetModal = this.resetModal.bind(this)
    this.onLaunchChallenge = this.onLaunchChallenge.bind(this)
  }

  onUpdateConfirm (value) {
    this.setState({ isConfirm: value })
  }

  onUpdateLaunch () {
    if (!this.state.isLaunch) {
      this.setState({ isLaunch: true })
    }
  }

  resetModal () {
    this.setState({ isConfirm: false, isLaunch: false })
  }

  async onLaunchChallenge () {
    if (this.state.isSaving) return
    const { challenge } = this.props
    try {
      this.setState({ isSaving: true })
      const response = await patchChallenge(challenge.id, { status: 'Active' })
      this.setState({ isLaunch: true, isConfirm: response.data.id, isSaving: false })
    } catch (e) {
      this.setState({ isSaving: false })
    }
  }

  render () {
    const { isLaunch, isConfirm, isSaving } = this.state
    const { challenge } = this.props
    const { phaseMessage, endTime } = getPhaseInfo(challenge)

    return (
      <div className={styles.item}>
        { isLaunch && !isConfirm && (
          <Modal theme={theme}>
            <div className={styles.contentContainer}>
              <div className={styles.title}>Launch Challenge Confirmation</div>
              <span>Do you want to launch this challenge?</span>
              <div className={styles.buttonGroup}>
                <div className={styles.button}>
                  <OutlineButton text={'Cancel'} type={'danger'} onClick={() => this.resetModal()} />
                </div>
                <div className={styles.button}>
                  <PrimaryButton text={isSaving ? 'Saving...' : 'Confirm'} type={'info'} onClick={() => this.onLaunchChallenge()} />
                </div>
              </div>
            </div>
          </Modal>
        )
        }
        { isLaunch && isConfirm && (
          <Modal theme={theme}>
            <div className={cn(styles.contentContainer, styles.confirm)}>
              <div className={styles.title}>Success</div>
              <span>Your challenge is saved as active</span>
              <div className={styles.buttonGroup}>
                <div className={styles.buttonSizeA}>
                  <PrimaryButton text={'Back to Dashboard'} type={'info'} link={'/'} />
                </div>
                <div className={styles.buttonSizeA} onClick={() => this.resetModal()}>
                  <OutlineButton text={'View Challenge'} type={'success'} link={`/projects/${challenge.projectId}/challenges/${isConfirm}/edit`} />
                </div>
              </div>
            </div>
          </Modal>
        ) }
        <a className={styles.col1} href={`${COMMUNITY_APP_URL}/challenges/${challenge.id}`}>
          <div>
            <TrackIcon className={styles.icon} track={challenge.track} subTrack={challenge.subTrack} />
          </div>
          <div className={styles.name}>
            <span className={styles.block}>{challenge.name}</span>
            <span className='block light-text'>Ends {getPhaseEndDate(challenge.phases.length - 1, challenge).format('MMM DD')}</span>
          </div>
        </a>
        <a className={styles.col2} href={`${COMMUNITY_APP_URL}/challenges/${challenge.id}`}>
          {renderStatus(challenge.status.toUpperCase())}
        </a>
        <a className={styles.col3} href={`${COMMUNITY_APP_URL}/challenges/${challenge.id}`}>
          <span className={styles.block}>{phaseMessage}</span>
          <span className='block light-text'>{endTime}</span>
        </a>
        <div className={cn(styles.col4, styles.editingContainer)}>
          {hoverComponents(challenge, this.onUpdateLaunch)}
        </div>
        <div className={cn(styles.col4, styles.iconsContainer)}>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faUser} className={styles.faIcon} />
            <span>{challenge.numRegistrants || 0}</span>
          </div>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faFile} className={styles.faIcon} />
            <span>{challenge.numSubmissions || 0}</span>
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
