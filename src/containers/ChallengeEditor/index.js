import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route } from 'react-router-dom'
import moment from 'moment'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import ChallengeViewTabs from '../../components/ChallengeEditor/ChallengeViewTabs'
import Loader from '../../components/Loader'
import { checkAdmin, getResourceRoleByName } from '../../util/tc'
import styles from './ChallengeEditor.module.scss'
import modalStyles from '../../components/Modal/ConfirmationModal.module.scss'

import {
  loadTimelineTemplates,
  loadChallengePhases,
  loadChallengeTypes,
  loadChallengeTracks,
  loadChallengeTimelines,
  // loadChallengeTerms,
  loadGroups,
  loadChallengeDetails,
  createAttachments,
  removeAttachment,
  loadResources,
  loadResourceRoles,
  updateChallengeDetails,
  partiallyUpdateChallengeDetails,
  deleteChallenge,
  createChallenge,
  replaceResourceInRole,
  updateChallengeSkills,
  createResource,
  deleteResource,
  loadScorecards,
  loadDefaultReviewers
} from '../../actions/challenges'

import { loadSubmissions } from '../../actions/challengeSubmissions'

import { loadProject } from '../../actions/projects'

import { connect } from 'react-redux'
import { SUBMITTER_ROLE_UUID, MESSAGE, PROJECT_ROLES } from '../../config/constants'
import { patchChallenge } from '../../services/challenges'
import ConfirmationModal from '../../components/Modal/ConfirmationModal'
import AlertModal from '../../components/Modal/AlertModal'
import Modal from '../../components/Modal'
import PrimaryButton from '../../components/Buttons/PrimaryButton'
import OutlineButton from '../../components/Buttons/OutlineButton'

const theme = {
  container: styles.modalContainer
}

class ChallengeEditor extends Component {
  constructor (props) {
    super(props)
    const mountedWithCreatePage = props.match.path.endsWith('/new')
    this.state = {
      challengeDetails: props.challengeDetails,
      mountedWithCreatePage,
      isLaunching: false,
      showSuccessModal: false,
      showLaunchModal: false,
      showRejectModal: false,
      cancelReason: null,
      loginUserRoleInProject: '',
      submissionsListPage: 1
    }

    this.onLaunchChallenge = this.onLaunchChallenge.bind(this)
    this.cancelChallenge = this.cancelChallenge.bind(this)
    this.activateChallenge = this.activateChallenge.bind(this)
    this.closeLaunchModal = this.closeLaunchModal.bind(this)
    this.closeCloseTaskModal = this.closeCloseTaskModal.bind(this)
    this.closeSuccessModal = this.closeSuccessModal.bind(this)
    this.onCloseTask = this.onCloseTask.bind(this)
    this.closeTask = this.closeTask.bind(this)
    this.fetchProjectDetails = this.fetchProjectDetails.bind(this)
    this.assignYourselfCopilot = this.assignYourselfCopilot.bind(this)
    this.showRejectChallengeModal = this.showRejectChallengeModal.bind(this)
    this.closeRejectModal = this.closeRejectModal.bind(this)
    this.rejectChallenge = this.rejectChallenge.bind(this)
    this.onChangeCancelReason = this.onChangeCancelReason.bind(this)
    this.onApproveChallenge = this.onApproveChallenge.bind(this)
  }

  componentDidMount () {
    const {
      match,
      loadTimelineTemplates,
      loadChallengePhases,
      loadChallengeTypes,
      loadChallengeTracks,
      loadChallengeTimelines,
      // loadChallengeTerms,
      loadGroups,
      loadResourceRoles,
      loadSubmissions,
      loadChallengeDetails,
      loadResources,
      loadScorecards,
      loadDefaultReviewers,
      submissionsPerPage
    } = this.props
    loadTimelineTemplates()
    loadChallengePhases()
    loadChallengeTypes()
    loadChallengeTracks()
    loadChallengeTimelines()
    // loadChallengeTerms()
    loadGroups()
    loadResourceRoles()
    loadScorecards()
    this.fetchDefaultReviewersForChallenge(this.props.challengeDetails, loadDefaultReviewers)
    this.fetchChallengeDetails(
      match,
      loadChallengeDetails,
      loadResources,
      loadSubmissions,
      submissionsPerPage
    )
    // this.unlisten = this.props.history.listen(() => {
    //   const { isLoading } = this.props
    //   if (!isLoading) {
    //     const { match: newMatch, loadChallengeDetails, loadResources } = this.props
    //     this.fetchChallengeDetails(newMatch, loadChallengeDetails, loadResources)
    //   }
    // })
  }

  fetchDefaultReviewersForChallenge (challengeDetails, loadDefaultReviewersFn) {
    const typeId = _.get(challengeDetails, 'typeId')
    const trackId = _.get(challengeDetails, 'trackId')

    if (typeId && trackId && typeof loadDefaultReviewersFn === 'function') {
      loadDefaultReviewersFn({ typeId, trackId })
    }
  }

  componentWillUnmount () {
    // this.unlisten()
  }

  componentWillReceiveProps (nextProps) {
    const { match } = this.props
    const { match: newMatch, loadChallengeDetails, loadResources, loadSubmissions, projectDetail, loggedInUser } = nextProps
    const projectId = _.get(newMatch.params, 'projectId', null)
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    if (
      _.get(match.params, 'projectId', null) !== projectId ||
      _.get(match.params, 'challengeId', null) !== challengeId
    ) {
      this.fetchChallengeDetails(newMatch, loadChallengeDetails, loadResources, loadSubmissions)
    } else {
      this.setState({ challengeDetails: nextProps.challengeDetails })
    }

    const prevTypeId = _.get(this.props.challengeDetails, 'typeId')
    const prevTrackId = _.get(this.props.challengeDetails, 'trackId')
    const nextTypeId = _.get(nextProps.challengeDetails, 'typeId')
    const nextTrackId = _.get(nextProps.challengeDetails, 'trackId')

    if (
      nextTypeId &&
      nextTrackId &&
      (nextTypeId !== prevTypeId || nextTrackId !== prevTrackId)
    ) {
      this.fetchDefaultReviewersForChallenge(nextProps.challengeDetails, nextProps.loadDefaultReviewers)
    }
    if (projectDetail && loggedInUser) {
      const projectMembers = projectDetail.members
      const loginUserProjectInfo = _.find(projectMembers, { userId: loggedInUser.userId })
      if (loginUserProjectInfo && this.state.loginUserRoleInProject !== loginUserProjectInfo.role) {
        this.setState({
          loginUserRoleInProject: loginUserProjectInfo.role
        })
      }
    }
  }

  async fetchProjectDetails (newMatch) {
    let projectId = _.get(newMatch.params, 'projectId', null)
    projectId = projectId ? parseInt(projectId) : null
    if (projectId) {
      await this.props.loadProject(projectId)
    }
  }

  async fetchChallengeDetails (
    newMatch,
    loadChallengeDetails,
    loadResources,
    loadSubmissions,
    submissionsPerPage
  ) {
    let projectId = _.get(newMatch.params, 'projectId', null)
    projectId = projectId ? parseInt(projectId) : null
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    await [loadResources(challengeId), loadSubmissions(challengeId, {
      page: 1,
      perPage: submissionsPerPage
    })]

    loadChallengeDetails(projectId, challengeId)
    if (!challengeId) {
      this.fetchProjectDetails(newMatch)
    }
  }

  isEditable () {
    const {
      hasProjectAccess,
      metadata: { resourceRoles },
      challengeResources,
      loggedInUser,
      token
    } = this.props
    const isAdmin = checkAdmin(token)
    if (isAdmin) {
      return true
    }
    const { loginUserRoleInProject } = this.state
    if (loginUserRoleInProject === PROJECT_ROLES.READ) {
      return false
    }
    const userRoles = _.filter(
      challengeResources,
      cr => cr.memberId === `${loggedInUser.userId}`
    )
    const userResourceRoles = _.filter(resourceRoles, rr =>
      _.some(userRoles, ur => ur.roleId === rr.id)
    )
    return hasProjectAccess || _.some(
      userResourceRoles,
      urr => urr.fullWriteAccess && urr.isActive
    )
  }

  onLaunchChallenge () {
    if (!this.props.isBillingAccountExpired) {
      this.setState({ showLaunchModal: true })
    } else {
      this.setState({
        showLaunchModal: true,
        launchError:
          'Unable to activate challenge as Billing Account is not active.'
      })
    }
  }

  async onApproveChallenge () {
    const { partiallyUpdateChallengeDetails, challengeDetails } = this.props
    const newStatus = 'Approved'
    await partiallyUpdateChallengeDetails(challengeDetails.id, {
      status: newStatus
    })
    this.setState({
      challengeDetails: {
        ...challengeDetails,
        status: newStatus
      }
    })
  }

  async cancelChallenge (challenge, cancelReason) {
    const { partiallyUpdateChallengeDetails, history } = this.props

    await partiallyUpdateChallengeDetails(challenge.id, {
      status: cancelReason
    })
    history.push(`/projects/${challenge.projectId}/challenges`)
  }

  onCloseTask () {
    this.setState({ showCloseTaskModal: true })
  }

  closeLaunchModal () {
    this.setState({ showLaunchModal: false })
  }

  closeCloseTaskModal () {
    this.setState({ showCloseTaskModal: false })
  }

  closeSuccessModal () {
    this.setState({ showSuccessModal: false })
  }

  closeRejectModal () {
    this.setState({ showRejectModal: false })
  }

  async activateChallenge () {
    const { partiallyUpdateChallengeDetails } = this.props
    if (this.state.isLaunching) return
    const { challengeDetails, metadata } = this.props
    const isTask = _.find(metadata.challengeTypes, {
      id: challengeDetails.typeId,
      isTask: true
    })
    try {
      this.setState({ isLaunching: true })
      const payload = {
        status: 'Active'
      }
      if (isTask) {
        payload.startDate = moment().format()
      }
      // call action to update the challenge status
      const action = await partiallyUpdateChallengeDetails(
        challengeDetails.id,
        payload
      )
      this.setState({
        isLaunching: false,
        showLaunchModal: false,
        showSuccessModal: true,
        suceessMessage: MESSAGE.CHALLENGE_LAUNCH_SUCCESS,
        challengeDetails: action.challengeDetails
      })
    } catch (e) {
      const error = _.get(
        e,
        'response.data.message',
        'Unable to activate the challenge'
      )
      this.setState({ isLaunching: false, launchError: error })
    }
  }

  /**
   * Close task when user confirm it
   */
  async closeTask () {
    const { challengeResources } = this.props
    const { challengeDetails } = this.state
    const submitters =
      challengeResources &&
      challengeResources.filter(cr => cr.roleId === SUBMITTER_ROLE_UUID)
    var assignedMemberDetails = null
    if (submitters && submitters.length === 1) {
      assignedMemberDetails = {
        userId: submitters[0].memberId,
        handle: submitters[0].memberHandle
      }
    }

    // set assigned user as the only one winner
    const winners = [
      {
        userId: assignedMemberDetails.userId,
        handle: assignedMemberDetails.handle,
        placement: 1
      }
    ]
    try {
      this.setState({ isLaunching: true })
      const response = await patchChallenge(challengeDetails.id, {
        winners,
        status: 'Completed'
      })
      this.setState({
        isLaunching: false,
        showCloseTaskModal: false,
        showSuccessModal: true,
        suceessMessage: MESSAGE.TASK_CLOSE_SUCCESS,
        challengeDetails: { ...challengeDetails, status: response.status }
      })
    } catch (e) {
      const error = _.get(
        e,
        'response.data.message',
        'Unable to close the task'
      )
      this.setState({
        isLaunching: false,
        showCloseTaskModal: false,
        launchError: error
      })
    }
  }

  async assignYourselfCopilot () {
    const { challengeDetails, loggedInUser, metadata, replaceResourceInRole } = this.props

    // get the resource roles and new/old resource values
    const copilotRole = getResourceRoleByName(metadata.resourceRoles, 'Copilot')
    // const approverRole = getResourceRoleByName(metadata.resourceRoles, 'Approver')
    // const screenerRole = getResourceRoleByName(metadata.resourceRoles, 'Primary Screener')
    const copilotHandle = loggedInUser.handle
    const challengeId = challengeDetails.id
    const oldPilot = challengeDetails.legacy.selfServiceCopilot
    const newPilot = oldPilot === copilotHandle ? null : copilotHandle

    // replace the roles
    await replaceResourceInRole(challengeId, copilotRole.id, newPilot, oldPilot)
    // await replaceResourceInRole(challengeId, approverRole.id, newPilot, oldPilot)
    // await replaceResourceInRole(challengeId, screenerRole.id, newPilot, oldPilot)

    this.setState({
      challengeDetails: {
        ...challengeDetails,
        legacy: {
          ...challengeDetails.legacy,
          selfServiceCopilot: newPilot
        }
      }
    })
  }

  showRejectChallengeModal () {
    this.setState({ showRejectModal: true })
  }

  async rejectChallenge () {
    const { challengeDetails } = this.props
    const { cancelReason } = this.state
    const partialChallenge = {
      status: 'Cancelled - Requirements Infeasible',
      cancelReason: cancelReason
    }
    const updatedChallenge = await patchChallenge(challengeDetails.id, partialChallenge)
    this.setState({ challengeDetails: updatedChallenge })
    this.closeRejectModal()
  }

  onChangeCancelReason (reason) {
    this.setState({ cancelReason: reason })
  }

  render () {
    const {
      match,
      isLoading,
      isBillingAccountExpired,
      isProjectLoading,
      // challengeDetails,
      challengeSubmissions,
      challengeResources,
      metadata,
      createAttachments,
      attachments,
      token,
      removeAttachment,
      failedToLoad,
      errorMessage,
      projectDetail,
      updateChallengeDetails,
      partiallyUpdateChallengeDetails,
      createChallenge,
      replaceResourceInRole,
      updateChallengeSkills,
      deleteChallenge,
      loggedInUser,
      projectPhases,
      isProjectPhasesLoading,
      showRejectChallengeModal,
      createResource,
      deleteResource,
      totalSubmissions,
      submissionsPerPage,
      page,
      loadSubmissions
      // members
    } = this.props
    const {
      mountedWithCreatePage,
      isLaunching,
      showLaunchModal,
      showCloseTaskModal,
      showSuccessModal,
      suceessMessage,
      challengeDetails,
      showRejectModal,
      cancelReason
    } = this.state
    if (isProjectLoading || isLoading || isProjectPhasesLoading) return <Loader />
    const challengeId = _.get(match.params, 'challengeId', null)
    if (challengeId && (!challengeDetails || !challengeDetails.id)) {
      return <Loader />
    }
    const submitters =
      challengeResources &&
      challengeResources.filter(cr => cr.roleId === SUBMITTER_ROLE_UUID)
    var assignedMemberDetails = null
    if (submitters && submitters.length === 1) {
      assignedMemberDetails = {
        userId: submitters[0].memberId,
        handle: submitters[0].memberHandle
      }
    }
    const enableEdit = this.isEditable()
    const isCreatePage = this.props.match.path.endsWith('/new')

    const activateModal = (
      <ConfirmationModal
        title='Confirm Launch'
        message={`Do you want to launch "${challengeDetails.name}"?`}
        theme={theme}
        isProcessing={isLaunching}
        errorMessage={this.state.launchError}
        onCancel={this.closeLaunchModal}
        onConfirm={this.activateChallenge}
        disableConfirmButton={isBillingAccountExpired}
      />
    )
    const closeTaskModal = (
      <ConfirmationModal
        title='Confirm Close Task'
        message={`Do you want to close task "${challengeDetails.name}"?`}
        theme={theme}
        isProcessing={isLaunching}
        errorMessage={this.state.launchError}
        onCancel={this.closeCloseTaskModal}
        onConfirm={this.closeTask}
      />
    )
    const successModal = (
      <AlertModal
        title='Success'
        message={suceessMessage}
        theme={theme}
        closeText='Ok'
        onClose={this.closeSuccessModal}
      />
    )
    const rejectModalContainerClasses = `${modalStyles.contentContainer} ${styles.rejectChallengeContainer}`
    const rejectModal = (
      <Modal theme={theme} onCancel={this.closeRejectModal}>
        <div className={rejectModalContainerClasses}>
          <div className={modalStyles.title}>Reject Challenge</div>
          <span> Please provide a reason for rejecting "{challengeDetails.name}?"</span>
          <div className={styles.cancelReasonContainer}>
            <textarea id='cancelReason' name='cancelReason' placeholder='Enter your reason' rows='4' className={styles.cancelReason} onChange={e => this.onChangeCancelReason(e.target.value)} />
          </div>
          <div className={styles.rejectButtonContainer}>
            <PrimaryButton
              text='Reject challenge'
              type='danger'
              onClick={this.rejectChallenge}
              disabled={_.isEmpty(cancelReason)}
            />
            <OutlineButton
              text='Cancel'
              type='info'
              onClick={this.closeRejectModal}
            />
          </div>
        </div>
      </Modal>
    )
    return (
      <div>
        {showLaunchModal && activateModal}
        {showCloseTaskModal && closeTaskModal}
        {showSuccessModal && successModal}
        {showRejectModal && rejectModal}
        <Route
          exact
          path={this.props.match.path}
          render={({ match }) => (
            <ChallengeEditorComponent
              isLoading={isLoading}
              challengeDetails={challengeDetails}
              isBillingAccountExpired={isBillingAccountExpired}
              challengeResources={challengeResources}
              metadata={metadata}
              cancelChallenge={this.cancelChallenge}
              projectId={_.get(match.params, 'projectId', null)}
              challengeId={challengeId}
              isNew={!_.has(match.params, 'challengeId')}
              uploadAttachments={createAttachments}
              attachments={attachments}
              token={token}
              removeAttachment={removeAttachment}
              failedToLoad={failedToLoad}
              errorMessage={errorMessage}
              projectDetail={projectDetail}
              assignedMemberDetails={assignedMemberDetails}
              updateChallengeDetails={updateChallengeDetails}
              createChallenge={createChallenge}
              replaceResourceInRole={replaceResourceInRole}
              updateChallengeSkills={updateChallengeSkills}
              partiallyUpdateChallengeDetails={partiallyUpdateChallengeDetails}
              projectPhases={projectPhases}
              assignYourselfCopilot={this.assignYourselfCopilot}
              rejectChallenge={this.rejectChallenge}
              showRejectChallengeModal={showRejectChallengeModal}
              loggedInUser={loggedInUser}
              enableEdit={enableEdit}
            />
          )}
        />
        {!isCreatePage && !mountedWithCreatePage && !enableEdit && (
          <div className={styles.errorContainer}>
            You don't have access to edit the challenge
          </div>
        )}
        {(mountedWithCreatePage || enableEdit) && (
          <Route
            exact
            path={`${this.props.match.path}/edit`}
            render={({ match }) => (
              <ChallengeEditorComponent
                isLoading={isLoading}
                isBillingAccountExpired={isBillingAccountExpired}
                challengeDetails={challengeDetails}
                challengeResources={challengeResources}
                metadata={metadata}
                cancelChallenge={this.cancelChallenge}
                projectId={_.get(match.params, 'projectId', null)}
                challengeId={challengeId}
                isNew={!_.has(match.params, 'challengeId')}
                uploadAttachments={createAttachments}
                attachments={attachments}
                token={token}
                removeAttachment={removeAttachment}
                failedToLoad={failedToLoad}
                projectDetail={projectDetail}
                assignedMemberDetails={assignedMemberDetails}
                updateChallengeDetails={updateChallengeDetails}
                replaceResourceInRole={replaceResourceInRole}
                updateChallengeSkills={updateChallengeSkills}
                partiallyUpdateChallengeDetails={
                  partiallyUpdateChallengeDetails
                }
                deleteChallenge={deleteChallenge}
                loggedInUser={loggedInUser}
                projectPhases={projectPhases}
                assignYourselfCopilot={this.assignYourselfCopilot}
                enableEdit={enableEdit}
              />
            )}
          />
        )}
        <Route
          exact
          path={`${this.props.match.path}/view`}
          render={({ match }) => (
            <ChallengeViewTabs
              isLoading={isLoading}
              isBillingAccountExpired={isBillingAccountExpired}
              metadata={metadata}
              projectDetail={projectDetail}
              projectPhases={projectPhases}
              challengeSubmissions={challengeSubmissions}
              challenge={challengeDetails}
              cancelChallenge={this.cancelChallenge}
              attachments={attachments}
              challengeResources={challengeResources}
              token={token}
              challengeId={challengeId}
              assignedMemberDetails={assignedMemberDetails}
              enableEdit={enableEdit}
              onLaunchChallenge={this.onLaunchChallenge}
              onCloseTask={this.onCloseTask}
              assignYourselfCopilot={this.assignYourselfCopilot}
              showRejectChallengeModal={this.showRejectChallengeModal}
              loggedInUser={loggedInUser}
              onApproveChallenge={this.onApproveChallenge}
              createResource={createResource}
              deleteResource={deleteResource}
              loadSubmissions={loadSubmissions}
              totalSubmissions={totalSubmissions}
              submissionsPerPage={submissionsPerPage}
              page={page}
            />
          )}
        />
      </div>
    )
  }
}

ChallengeEditor.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      challengeId: PropTypes.string,
      projectId: PropTypes.string
    })
  }).isRequired,
  loadTimelineTemplates: PropTypes.func,
  loadChallengePhases: PropTypes.func,
  loadChallengeTypes: PropTypes.func,
  loadChallengeTracks: PropTypes.func,
  loadChallengeTimelines: PropTypes.func,
  // loadChallengeTerms: PropTypes.func,
  loadGroups: PropTypes.func,
  loadChallengeDetails: PropTypes.func,
  loadResources: PropTypes.func,
  loadResourceRoles: PropTypes.func,
  loadSubmissions: PropTypes.func,
  loadScorecards: PropTypes.func,
  loadDefaultReviewers: PropTypes.func,
  challengeResources: PropTypes.arrayOf(PropTypes.object),
  challengeSubmissions: PropTypes.arrayOf(PropTypes.object),
  challengeDetails: PropTypes.object,
  isProjectLoading: PropTypes.bool,
  hasProjectAccess: PropTypes.bool,
  projectDetail: PropTypes.object,
  history: PropTypes.object,
  metadata: PropTypes.shape({
    challengeTypes: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  isBillingAccountExpired: PropTypes.bool,
  createAttachments: PropTypes.func,
  attachments: PropTypes.arrayOf(PropTypes.shape()),
  token: PropTypes.string,
  loggedInUser: PropTypes.object,
  removeAttachment: PropTypes.func,
  failedToLoad: PropTypes.bool,
  errorMessage: PropTypes.string,
  updateChallengeDetails: PropTypes.func.isRequired,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  createChallenge: PropTypes.func.isRequired,
  deleteChallenge: PropTypes.func.isRequired,
  createResource: PropTypes.func.isRequired,
  deleteResource: PropTypes.func.isRequired,
  replaceResourceInRole: PropTypes.func,
  updateChallengeSkills: PropTypes.func,
  loadProject: PropTypes.func,
  projectPhases: PropTypes.arrayOf(PropTypes.object),
  isProjectPhasesLoading: PropTypes.bool,
  showRejectChallengeModal: PropTypes.func,
  totalSubmissions: PropTypes.number,
  submissionsPerPage: PropTypes.number,
  page: PropTypes.number
  // members: PropTypes.arrayOf(PropTypes.shape())
}

const mapStateToProps = ({
  projects,
  challengeSubmissions: { challengeSubmissions, totalSubmissions, submissionsPerPage, page },
  challenges: {
    challengeDetails,
    challengeResources,
    metadata,
    isLoading,
    attachments,
    failedToLoad,
    errorMessage
  },
  auth,
  members: { members }
}) => {
  return ({
    challengeDetails,
    hasProjectAccess: projects.hasProjectAccess,
    projectDetail: projects.projectDetail,
    projectPhases: projects.phases,
    isProjectPhasesLoading: projects.isPhasesLoading,
    challengeResources,
    challengeSubmissions,
    metadata,
    isLoading,
    isBillingAccountExpired: projects.isBillingAccountExpired,
    isProjectLoading: projects.isLoading,
    attachments,
    token: auth.token,
    loggedInUser: auth.user,
    failedToLoad,
    errorMessage,
    totalSubmissions,
    submissionsPerPage,
    page
    // members
  })
}

const mapDispatchToProps = {
  loadChallengeDetails,
  loadTimelineTemplates,
  loadChallengePhases,
  loadChallengeTypes,
  loadChallengeTracks,
  loadChallengeTimelines,
  loadGroups,
  createAttachments,
  removeAttachment,
  // loadChallengeTerms,
  loadResources,
  loadSubmissions,
  loadResourceRoles,
  updateChallengeDetails,
  partiallyUpdateChallengeDetails,
  deleteChallenge,
  createChallenge,
  replaceResourceInRole,
  updateChallengeSkills,
  loadProject,
  createResource,
  deleteResource,
  loadScorecards,
  loadDefaultReviewers
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor)
)
