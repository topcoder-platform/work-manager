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
import ChallengeStatus from '../ChallengeStatus'
import ChallengeTag from '../ChallengeTag'
import styles from './ChallengeCard.module.scss'
import { formatDate } from '../../../util/date'
import { CHALLENGE_STATUS, COMMUNITY_APP_URL, DIRECT_PROJECT_URL, MESSAGE, ONLINE_REVIEW_URL, PROJECT_ROLES } from '../../../config/constants'
import ConfirmationModal from '../../Modal/ConfirmationModal'
import { checkChallengeEditPermission, checkReadOnlyRoles } from '../../../util/tc'
import { getCurrentPhase } from '../../../util/phase'
import AlertModal from '../../Modal/AlertModal'
import Tooltip from '../../Tooltip'

const theme = {
  container: styles.modalContainer
}

const PERMISSION_DELETE_MESSAGE_ERROR =
  "You don't have permission to delete this challenge"

/**
 * Render components when mouse hover
 * @param challenge
 * @param onUpdateLaunch
 * @returns {*}
 */
const hoverComponents = (challenge, onUpdateLaunch, deleteModalLaunch) => {
  const communityAppUrl = `${COMMUNITY_APP_URL}/challenges/${challenge.id}`
  const directUrl = `${DIRECT_PROJECT_URL}/contest/detail?projectId=${challenge.legacyId}`
  const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
  const isTask = _.get(challenge, 'task.isTask', false)

  // NEW projects never have Legacy challenge created, so don't show links and "Activate" button for them at all
  if (challenge.status.toUpperCase() === CHALLENGE_STATUS.NEW) {
    return (
      <button className={styles.deleteButton} onClick={deleteModalLaunch}>
        <span>Delete</span>
      </button>
    )
  }

  return challenge.legacyId || isTask ? (
    <div className={styles.linkGroup}>
      <div className={styles.linkGroupLeft}>
        <a className={styles.link} href={communityAppUrl} target='_blank'>View Challenge</a>
        {!isTask && (
          <div className={styles.linkGroupLeftBottom}>
            <a className={styles.link} href={directUrl} target='_blank'>Direct</a>
            <span className={styles.linkDivider}>|</span>
            <a className={styles.link} href={orUrl} target='_blank'>OR</a>
          </div>
        )}
      </div>
      {challenge.status.toUpperCase() === CHALLENGE_STATUS.DRAFT && (
        <button className={styles.activateButton} onClick={() => onUpdateLaunch()}>
          <span>Activate</span>
        </button>
      )}
    </div>
  ) : (
    <div className={styles.linkGroup}>
      <div className={styles.linkGroupLeft}>
        <a className={styles.link} href={communityAppUrl}>View Challenge</a>
        {!isTask && (
          <div className={styles.linkGroupLeftBottom}>
            <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
              <span className={styles.link}>Direct</span>
            </Tooltip>
            <span className={styles.linkDivider}>|</span>
            <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
              <span className={styles.link}>OR</span>
            </Tooltip>
          </div>
        )}
      </div>
      {
        challenge.status === 'Draft' && (
          <Tooltip content={MESSAGE.NO_LEGACY_CHALLENGE}>
            {/* Don't disable button for real inside tooltip, otherwise mouseEnter/Leave events work not good */}
            <button className={cn(styles.activateButton, styles.activateButtonDisabled)}>
              <span>Activate</span>
            </button>
          </Tooltip>
        )
      }
    </div>
  )
}

const renderStatus = (status, getStatusText) => {
  const statusMessage = status.split(' ')[0]
  switch (statusMessage) {
    case CHALLENGE_STATUS.ACTIVE:
    case CHALLENGE_STATUS.APPROVED:
    case CHALLENGE_STATUS.NEW:
    case CHALLENGE_STATUS.DRAFT:
    case CHALLENGE_STATUS.COMPLETED:
    case CHALLENGE_STATUS.CANCELLED:
      const statusText = getStatusText ? getStatusText(statusMessage) : statusMessage
      return (<ChallengeStatus status={statusMessage} statusText={statusText} />)
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
      isDeleteLaunch: false,
      isSaving: false,
      isCheckChalengePermission: false,
      hasEditChallengePermission: false,
      loginUserRoleInProject: '',
      currentPhase: getCurrentPhase(props.challenge),
      forumLink: this.getForumLink(props.challenge)
    }
    this.onUpdateConfirm = this.onUpdateConfirm.bind(this)
    this.onUpdateLaunch = this.onUpdateLaunch.bind(this)
    this.onDeleteChallenge = this.onDeleteChallenge.bind(this)
    this.deleteModalLaunch = this.deleteModalLaunch.bind(this)
    this.resetModal = this.resetModal.bind(this)
    this.onLaunchChallenge = this.onLaunchChallenge.bind(this)
  }

  getForumLink (challenge) {
    const discussionsHaveUrls = (challenge.discussions || []).filter((p) => !!p.url)
    return discussionsHaveUrls.length ? discussionsHaveUrls[0].url : ''
  }

  componentDidUpdate (prevProps) {
    const { challenge } = this.props
    if (!_.isEqual(challenge.phases, prevProps.challenge.phases)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        currentPhase: getCurrentPhase(challenge)
      })
    }
    if (!_.isEqual(challenge.discussions, prevProps.challenge.discussions)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        forumLink: this.getForumLink(challenge)
      })
    }
  }

  onUpdateConfirm (value) {
    this.setState({ isConfirm: value })
  }

  onUpdateLaunch () {
    if (!this.state.isLaunch) {
      if (!this.props.isBillingAccountExpired) {
        this.setState({ isLaunch: true })
      } else {
        this.setState({ isLaunch: true, error: 'Unable to activate challenge as Billing Account is not active.' })
      }
    }
  }

  deleteModalLaunch () {
    const { challenge } = this.props
    if (!this.state.isDeleteLaunch) {
      checkChallengeEditPermission(challenge.id).then(hasPermission => {
        this.setState({
          isCheckChalengePermission: false,
          hasEditChallengePermission: hasPermission
        })
      })
      this.setState({
        isDeleteLaunch: true,
        isCheckChalengePermission: true,
        hasEditChallengePermission: false
      })
    }
  }

  resetModal () {
    this.setState({ isConfirm: false, isLaunch: false, isDeleteLaunch: false })
  }

  async onLaunchChallenge () {
    const { partiallyUpdateChallengeDetails } = this.props
    if (this.state.isSaving) return
    const { challenge } = this.props
    try {
      this.setState({ isSaving: true })
      const isTask = _.get(challenge, 'task.isTask', false)
      const payload = {
        status: 'Active'
      }
      if (isTask) {
        payload.startDate = moment().format()
      }
      // call action to update the challenge with a new status
      await partiallyUpdateChallengeDetails(challenge.id, payload)
      this.setState({ isLaunch: true, isConfirm: challenge.id, isSaving: false })
    } catch (e) {
      const error = _.get(e, 'response.data.message', 'Unable to activate the challenge')
      this.setState({ isSaving: false, error })
    }
  }

  async onDeleteChallenge () {
    const { deleteChallenge, challenge } = this.props
    try {
      this.setState({ isSaving: true })
      // Call action to delete the challenge
      await deleteChallenge(challenge.id)
      this.setState({ isSaving: false })
      this.resetModal()
    } catch (e) {
      const error = _.get(e, 'response.data.message', 'Unable to Delete the challenge')
      this.setState({ isSaving: false, error })
    }
  }

  render () {
    const { isLaunch, isConfirm, isSaving, isDeleteLaunch, isCheckChalengePermission, hasEditChallengePermission, currentPhase, forumLink } = this.state
    const { setActiveProject, challenge, reloadChallengeList, isBillingAccountExpired, disableHover, getStatusText, challengeTypes, loginUserRoleInProject } = this.props
    const deleteMessage = isCheckChalengePermission
      ? 'Checking permissions...'
      : `Do you want to delete "${challenge.name}"?`
    const orUrl = `${ONLINE_REVIEW_URL}/review/actions/ViewProjectDetails?pid=${challenge.legacyId}`
    const communityAppUrl = `${COMMUNITY_APP_URL}/challenges/${challenge.id}`
    const isReadOnly = checkReadOnlyRoles(this.props.auth.token) || loginUserRoleInProject === PROJECT_ROLES.READ

    return (
      <div className={styles.item}>
        {isDeleteLaunch && !isConfirm && (
          <ConfirmationModal
            title='Confirm Delete'
            message={deleteMessage}
            theme={theme}
            isProcessing={isSaving}
            disableConfirmButton={!hasEditChallengePermission}
            errorMessage={
              !isCheckChalengePermission && !hasEditChallengePermission
                ? PERMISSION_DELETE_MESSAGE_ERROR
                : this.state.error
            }
            onCancel={this.resetModal}
            onConfirm={this.onDeleteChallenge}
          />
        )}
        {isLaunch && !isConfirm && (
          <ConfirmationModal
            title='Confirm Launch'
            message={`Do you want to launch "${challenge.name}"?`}
            theme={theme}
            isProcessing={isSaving}
            errorMessage={this.state.error}
            onCancel={this.resetModal}
            onConfirm={this.onLaunchChallenge}
            disableConfirmButton={isBillingAccountExpired}
          />
        )
        }
        {isLaunch && isConfirm && (
          <AlertModal
            title='Success'
            message={`Challenge "${challenge.name}" is activated successfully`}
            theme={theme}
            onCancel={reloadChallengeList}
            closeText='Close'
            okText='View Challenge'
            okLink={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`}
            onClose={this.resetModal}
          />
        )}

        <div className={styles.col5}>
          <ChallengeTag type={challenge.type} challengeTypes={challengeTypes} />
        </div>

        <Link className={styles.col2} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/view`} onClick={() => setActiveProject(parseInt(challenge.projectId))}>
          <div className={styles.name}>
            <span className={styles.link}>{challenge.name}</span>
          </div>
        </Link>
        <div className={styles.col3}>
          <span>{formatDate(challenge.startDate)}</span>
        </div>
        <div className={styles.col3}>
          <span>{formatDate(challenge.endDate)}</span>
        </div>
        <div className={styles.col4}>
          <span>{challenge.numOfRegistrants}</span>
        </div>
        <div className={styles.col4}>
          <span>{challenge.numOfSubmissions}</span>
        </div>
        <div className={styles.col3}>
          {renderStatus(challenge.status.toUpperCase(), getStatusText)}
        </div>
        <div className={styles.col3}>
          {currentPhase}
        </div>
        {
          !isReadOnly && (
            <div className={styles.col6}>
              {(disableHover ? <Link className={styles.link} to={`/projects/${challenge.projectId}/challenges/${challenge.id}/edit`}>Edit</Link> : hoverComponents(challenge, this.onUpdateLaunch, this.deleteModalLaunch))}
            </div>
          )
        }
        <div className={styles.col6}>
          <a className={styles.link} href={orUrl} target='_blank'>OR</a>
        </div>
        <div className={styles.col6}>
          <a className={styles.link} href={communityAppUrl} target='_blank'>CA</a>
        </div>
        <div className={styles.col6}>
          {forumLink ? (<a className={styles.link} href={forumLink} target='_blank'>Forum</a>)
            : (<a className={styles.link} href='javascript:void(0)'>Forum</a>)}
        </div>
      </div>
    )
  }
}

ChallengeCard.defaultPrps = {
  reloadChallengeList: () => { },
  challengeTypes: [],
  setActiveProject: () => {},
  loginUserRoleInProject: ''
}

ChallengeCard.propTypes = {
  challenge: PropTypes.object,
  reloadChallengeList: PropTypes.func,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  setActiveProject: PropTypes.func,
  deleteChallenge: PropTypes.func.isRequired,
  isBillingAccountExpired: PropTypes.bool,
  disableHover: PropTypes.bool,
  getStatusText: PropTypes.func,
  challengeTypes: PropTypes.arrayOf(PropTypes.shape()),
  auth: PropTypes.object.isRequired,
  loginUserRoleInProject: PropTypes.string
}

export default withRouter(ChallengeCard)
