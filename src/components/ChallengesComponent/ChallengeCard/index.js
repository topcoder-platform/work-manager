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
import ChallengeTag from '../ChallengeTag'
import styles from './ChallengeCard.module.scss'
import { getFormattedDuration } from '../../../util/date'
import { CHALLENGE_STATUS, COMMUNITY_APP_URL, DIRECT_PROJECT_URL, ONLINE_REVIEW_URL } from '../../../config/constants'
import { patchChallenge } from '../../../services/challenges'
import ConfirmationModal from '../../Modal/ConfirmationModal'
import AlertModal from '../../Modal/AlertModal'

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
  let time = moment(phase.scheduledEndDate).diff()
  const late = time < 0
  if (late) time = -time

  if (status !== CHALLENGE_STATUS.COMPLETED.toLowerCase()) {
    const duration = getFormattedDuration(time)
    return late ? `Late by ${duration}` : `${duration} to go`
  }

  return moment(phase.scheduledEndDate).format('DD/MM/YYYY')
}

/**
 * Find current phase and remaining time of it
 * @param c Challenge
 * @returns {{phaseMessage: string, endTime: {late, text}}}
 */
const getPhaseInfo = (c) => {
  const { currentPhaseNames, status, startDate, phases } = c
  /* let checkPhases = (currentPhases && currentPhases.length > 0 ? currentPhases : allPhases)
  if (_.isEmpty(checkPhases)) checkPhases = []
  let statusPhase = checkPhases
    .filter(p => p.phaseType !== 'Registration')
    .sort((a, b) => moment(a.scheduledEndTime).diff(b.scheduledEndTime))[0]

  if (!statusPhase && subTrack === 'FIRST_2_FINISH' && checkPhases.length) {
    statusPhase = Object.clone(checkPhases[0])
    statusPhase.phaseType = 'Submission'
  } */
  let phaseMessage = STALLED_MSG
  // if (statusPhase) phaseMessage = statusPhase.phaseType
  // else if (status === 'DRAFT') phaseMessage = DRAFT_MSG
  var lowerStatus = status.toLowerCase()
  if (lowerStatus === 'draft') {
    phaseMessage = DRAFT_MSG
  } else if (lowerStatus === 'active') {
    if (!currentPhaseNames || currentPhaseNames.length === 0) {
      var timeToStart = moment(startDate).diff()
      if (timeToStart > 0) {
        phaseMessage = `Scheduled in ${getFormattedDuration(timeToStart)}`
      }
    } else {
      phaseMessage = currentPhaseNames.join('/')
    }
  }
  const activePhases = phases.filter(p => !!p.isOpen)
  const activePhase = activePhases.length > 0 ? activePhases[0] : null
  const endTime = getTimeLeft(activePhase, lowerStatus)
  return { phaseMessage, endTime }
}

/**
 * Render components when mouse hover
 * @param challenge
 * @param onUpdateLaunch
 * @returns {*}
 */
const hoverComponents = (challenge, onUpdateLaunch, showError) => {
  const communityAppUrl = `${COMMUNITY_APP_URL}/challenges/${challenge.id}`
  const directUrl = `${DIRECT_PROJECT_URL}/contest/detail?projectId=${challenge.legacyId}`
  const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
  const showLegacyError = () => {
    if (showError) {
      showError((<span>The legacy processor has not yet given this challenge a legacy ID. Please wait a few minutes or contact <a href='mailto: support@topcoder.com'>support@topcoder.com</a></span>))
    }
  }

  switch (challenge.status.toUpperCase()) {
    case CHALLENGE_STATUS.DRAFT:
    case CHALLENGE_STATUS.ACTIVE:
    default:
      return challenge.legacyId ? (
        <div className={styles.linkGroup}>
          <div className={styles.linkGroupLeft} onClick={() => {
            window.location.href = communityAppUrl
          }}>
            <a className={styles.link} href={communityAppUrl}>View Challenge</a>
            <div className={styles.linkGroupLeftBottom}>
              <a onClick={(e) => e.stopPropagation()} className={styles.link} href={directUrl} target='_blank'>Direct</a>
              <span>|</span>
              <a onClick={(e) => e.stopPropagation()} className={styles.link} href={orUrl} target='_blank'>OR</a>
            </div>
          </div>
          {
            challenge.status === 'Draft' && (
              <button className={styles.activateButton} onClick={() => onUpdateLaunch()}>
                <span>Activate</span>
              </button>
            )
          }
        </div>
      ) : (
        <div className={styles.linkGroup}>
          <div className={styles.linkGroupLeft} onClick={() => {
            window.location.href = communityAppUrl
          }}>
            <a className={styles.link} href={communityAppUrl}>View Challenge</a>
            <div className={styles.linkGroupLeftBottom}>
              <a onClick={(e) => {
                e.stopPropagation()
                showLegacyError()
              }} className={styles.link}>Direct</a>
              <span>|</span>
              <a onClick={(e) => {
                e.stopPropagation()
                showLegacyError()
              }} className={styles.link}>OR</a>
            </div>
          </div>
          {
            challenge.status === 'Draft' && (
              <button className={styles.activateButton} onClick={() => onUpdateLaunch()}>
                <span>Activate</span>
              </button>
            )
          }
        </div>
      )
  }
}

const renderStatus = (status) => {
  switch (status) {
    case CHALLENGE_STATUS.ACTIVE:
    case CHALLENGE_STATUS.NEW:
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
      const error = _.get(e, 'response.data.message', 'Unable to activate the challenge')
      this.setState({ isSaving: false, error })
    }
  }

  render () {
    const { isLaunch, isConfirm, isSaving } = this.state
    const { challenge, shouldShowCurrentPhase, reloadChallengeList } = this.props
    const { phaseMessage, endTime } = getPhaseInfo(challenge)
    return (
      <div className={styles.item}>
        { isLaunch && !isConfirm && (
          <ConfirmationModal
            title='Confirm Launch'
            message={`Do you want to launch "${challenge.name}"?`}
            theme={theme}
            isProcessing={isSaving}
            errorMessage={this.state.error}
            onCancel={this.resetModal}
            onConfirm={this.onLaunchChallenge}
          />
        )
        }
        { isLaunch && isConfirm && (
          <AlertModal
            title='Success'
            message={`Challenge "${challenge.name}" is activated successfuly`}
            theme={theme}
            onCancel={reloadChallengeList}
            closeText='Close'
            okText='View Challenge'
            okLink='./view'
            onClose={this.resetModal}
          />
        ) }

        <Link className={styles.col1} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`}>
          <div className={styles.name}>
            <span className={styles.block}>{challenge.name}</span>
            <ChallengeTag track={challenge.trackId} challengeType={challenge.type} />
          </div>
        </Link>
        <Link className={styles.col2} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`}>
          {renderStatus(challenge.status.toUpperCase())}
        </Link>
        {shouldShowCurrentPhase && (<Link className={styles.col3} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`}>
          <span className={styles.block}>{phaseMessage}</span>
          <span className='block light-text'>{endTime}</span>
        </Link>)}
        <div className={cn(styles.col4, styles.editingContainer)}>
          {hoverComponents(challenge, this.onUpdateLaunch, this.props.showError)}
        </div>
        <div className={cn(styles.col4, styles.iconsContainer)}>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faUser} className={styles.faIcon} />
            <span>{challenge.numOfRegistrants || 0}</span>
          </div>
          <div className={styles.faIconContainer}>
            <FontAwesomeIcon icon={faFile} className={styles.faIcon} />
            <span>{challenge.numOfSubmissions || 0}</span>
          </div>
        </div>
      </div>
    )
  }
}

ChallengeCard.defaultPrps = {
  shouldShowCurrentPhase: true,
  showError: () => {},
  reloadChallengeList: () => {}
}

ChallengeCard.propTypes = {
  challenge: PropTypes.object,
  shouldShowCurrentPhase: PropTypes.bool,
  showError: PropTypes.func,
  reloadChallengeList: PropTypes.func
}

export default withRouter(ChallengeCard)
