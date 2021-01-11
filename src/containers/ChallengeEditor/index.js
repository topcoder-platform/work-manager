import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import ChallengeViewComponent from '../../components/ChallengeEditor/ChallengeView'
import Loader from '../../components/Loader'
import { checkAdmin } from '../../util/tc'
import styles from './ChallengeEditor.module.scss'

import {
  loadTimelineTemplates,
  loadChallengePhases,
  loadChallengeTypes,
  loadChallengeTracks,
  loadChallengeTimelines,
  loadChallengeTags,
  // loadChallengeTerms,
  loadGroups,
  loadChallengeDetails,
  createAttachment,
  removeAttachment,
  loadResources,
  loadResourceRoles,
  updateChallengeDetails,
  partiallyUpdateChallengeDetails,
  deleteChallenge,
  createChallenge,
  replaceResourceInRole
} from '../../actions/challenges'

import { connect } from 'react-redux'
import { SUBMITTER_ROLE_UUID, MESSAGE } from '../../config/constants'
import { patchChallenge } from '../../services/challenges'
import ConfirmationModal from '../../components/Modal/ConfirmationModal'
import AlertModal from '../../components/Modal/AlertModal'

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
      showLaunchModal: false
    }

    this.onLaunchChallenge = this.onLaunchChallenge.bind(this)
    this.activateChallenge = this.activateChallenge.bind(this)
    this.closeLaunchModal = this.closeLaunchModal.bind(this)
    this.closeCloseTaskModal = this.closeCloseTaskModal.bind(this)
    this.closeSuccessModal = this.closeSuccessModal.bind(this)
    this.onCloseTask = this.onCloseTask.bind(this)
    this.closeTask = this.closeTask.bind(this)
  }

  componentDidMount () {
    const {
      match,
      loadTimelineTemplates,
      loadChallengePhases,
      loadChallengeTypes,
      loadChallengeTracks,
      loadChallengeTimelines,
      loadChallengeTags,
      // loadChallengeTerms,
      loadGroups,
      loadResourceRoles,
      loadChallengeDetails,
      loadResources
    } = this.props
    loadTimelineTemplates()
    loadChallengePhases()
    loadChallengeTypes()
    loadChallengeTracks()
    loadChallengeTimelines()
    loadChallengeTags()
    // loadChallengeTerms()
    loadGroups()
    loadResourceRoles()
    this.fetchChallengeDetails(match, loadChallengeDetails, loadResources)

    // this.unlisten = this.props.history.listen(() => {
    //   const { isLoading } = this.props
    //   if (!isLoading) {
    //     const { match: newMatch, loadChallengeDetails, loadResources } = this.props
    //     this.fetchChallengeDetails(newMatch, loadChallengeDetails, loadResources)
    //   }
    // })
  }

  componentWillUnmount () {
    // this.unlisten()
  }

  componentWillReceiveProps (nextProps) {
    const { match } = this.props
    const { match: newMatch, loadChallengeDetails, loadResources } = nextProps
    const projectId = _.get(newMatch.params, 'projectId', null)
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    if (_.get(match.params, 'projectId', null) !== projectId || _.get(match.params, 'challengeId', null) !== challengeId) {
      this.fetchChallengeDetails(newMatch, loadChallengeDetails, loadResources)
    } else {
      this.setState({ challengeDetails: nextProps.challengeDetails })
    }
  }

  async fetchChallengeDetails (newMatch, loadChallengeDetails, loadResources) {
    let projectId = _.get(newMatch.params, 'projectId', null)
    projectId = projectId ? parseInt(projectId) : null
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    await loadResources(challengeId)
    loadChallengeDetails(projectId, challengeId)
  }

  isEditable () {
    const { hasProjectAccess, metadata: { resourceRoles }, challengeResources, loggedInUser, token } = this.props
    const isAdmin = checkAdmin(token)
    if (isAdmin) {
      return true
    }
    if (!hasProjectAccess) {
      return false
    }
    const userRoles = _.filter(challengeResources, cr => cr.memberId === `${loggedInUser.userId}`)
    const userResourceRoles = _.filter(resourceRoles, rr => _.some(userRoles, ur => ur.roleId === rr.id))
    return _.some(userResourceRoles, urr => urr.fullWriteAccess && urr.isActive)
  }

  onLaunchChallenge () {
    this.setState({ showLaunchModal: true })
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

  async activateChallenge () {
    const { partiallyUpdateChallengeDetails } = this.props
    if (this.state.isLaunching) return
    const { challengeDetails } = this.props
    try {
      this.setState({ isLaunching: true })
      // call action to update the challenge status
      const action = await partiallyUpdateChallengeDetails(challengeDetails.id, {
        status: 'Active'
      })
      this.setState({
        isLaunching: false,
        showLaunchModal: false,
        showSuccessModal: true,
        suceessMessage: MESSAGE.CHALLENGE_LAUNCH_SUCCESS,
        challengeDetails: action.challengeDetails
      })
    } catch (e) {
      const error = _.get(e, 'response.data.message', 'Unable to activate the challenge')
      this.setState({ isLaunching: false, launchError: error })
    }
  }

  /**
   * Close task when user confirm it
   */
  async closeTask () {
    const { challengeResources } = this.props
    const { challengeDetails } = this.state
    const submitters = challengeResources && challengeResources.filter(cr => cr.roleId === SUBMITTER_ROLE_UUID)
    var assignedMemberDetails = null
    if (submitters && submitters.length === 1) {
      assignedMemberDetails = {
        userId: submitters[0].memberId,
        handle: submitters[0].memberHandle
      }
    }

    // set assigned user as the only one winner
    const winners = [{
      userId: assignedMemberDetails.userId,
      handle: assignedMemberDetails.handle,
      placement: 1
    }]
    try {
      this.setState({ isLaunching: true })
      const response = await patchChallenge(challengeDetails.id, { winners, status: 'Completed' })
      this.setState({
        isLaunching: false,
        showCloseTaskModal: false,
        showSuccessModal: true,
        suceessMessage: MESSAGE.TASK_CLOSE_SUCCESS,
        challengeDetails: { ...challengeDetails, status: response.status }
      })
    } catch (e) {
      const error = _.get(e, 'response.data.message', 'Unable to close the task')
      this.setState({ isLaunching: false, showCloseTaskModal: false, launchError: error })
    }
  }

  render () {
    const {
      match,
      isLoading,
      isProjectLoading,
      // challengeDetails,
      challengeResources,
      metadata,
      createAttachment,
      attachments,
      token,
      removeAttachment,
      failedToLoad,
      projectDetail,
      updateChallengeDetails,
      partiallyUpdateChallengeDetails,
      createChallenge,
      replaceResourceInRole,
      deleteChallenge
      // members
    } = this.props
    const {
      mountedWithCreatePage,
      isLaunching,
      showLaunchModal,
      showCloseTaskModal,
      showSuccessModal,
      suceessMessage,
      challengeDetails
    } = this.state
    if (isProjectLoading || isLoading) return <Loader />
    const challengeId = _.get(match.params, 'challengeId', null)
    if (challengeId && (!challengeDetails || !challengeDetails.id)) {
      return (<Loader />)
    }
    const submitters = challengeResources && challengeResources.filter(cr => cr.roleId === SUBMITTER_ROLE_UUID)
    var assignedMemberDetails = null
    if (submitters && submitters.length === 1) {
      assignedMemberDetails = {
        userId: submitters[0].memberId,
        handle: submitters[0].memberHandle
      }
    }
    const enableEdit = this.isEditable()
    const isCreatePage = this.props.match.path.endsWith('/new')

    const activateModal = <ConfirmationModal
      title='Confirm Launch'
      message={`Do you want to launch "${challengeDetails.name}"?`}
      theme={theme}
      isProcessing={isLaunching}
      errorMessage={this.state.launchError}
      onCancel={this.closeLaunchModal}
      onConfirm={this.activateChallenge}
    />
    const closeTaskModal = <ConfirmationModal
      title='Confirm Close Task'
      message={`Do you want to close task "${challengeDetails.name}"?`}
      theme={theme}
      isProcessing={isLaunching}
      errorMessage={this.state.launchError}
      onCancel={this.closeCloseTaskModal}
      onConfirm={this.closeTask}
    />
    const successModal = <AlertModal
      title='Success'
      message={suceessMessage}
      theme={theme}
      closeText='Ok'
      onClose={this.closeSuccessModal}
    />
    return <div>
      { showLaunchModal && activateModal }
      { showCloseTaskModal && closeTaskModal }
      { showSuccessModal && successModal }
      <Route
        exact
        path={this.props.match.path}
        render={({ match }) => ((
          <ChallengeEditorComponent
            isLoading={isLoading}
            challengeDetails={challengeDetails}
            challengeResources={challengeResources}
            metadata={metadata}
            projectId={_.get(match.params, 'projectId', null)}
            challengeId={challengeId}
            isNew={!_.has(match.params, 'challengeId')}
            uploadAttachment={createAttachment}
            attachments={attachments}
            token={token}
            removeAttachment={removeAttachment}
            failedToLoad={failedToLoad}
            projectDetail={projectDetail}
            assignedMemberDetails={assignedMemberDetails}
            updateChallengeDetails={updateChallengeDetails}
            createChallenge={createChallenge}
            replaceResourceInRole={replaceResourceInRole}
            partiallyUpdateChallengeDetails={partiallyUpdateChallengeDetails}
          />
        ))
        } />
      { !isCreatePage && !mountedWithCreatePage && !enableEdit && <div className={styles.errorContainer}>You don't have access to edit the challenge</div>}
      { (mountedWithCreatePage || enableEdit) && <Route
        exact
        path={`${this.props.match.path}/edit`}
        render={({ match }) => ((
          <ChallengeEditorComponent
            isLoading={isLoading}
            challengeDetails={challengeDetails}
            challengeResources={challengeResources}
            metadata={metadata}
            projectId={_.get(match.params, 'projectId', null)}
            challengeId={challengeId}
            isNew={!_.has(match.params, 'challengeId')}
            uploadAttachment={createAttachment}
            attachments={attachments}
            token={token}
            removeAttachment={removeAttachment}
            failedToLoad={failedToLoad}
            projectDetail={projectDetail}
            assignedMemberDetails={assignedMemberDetails}
            updateChallengeDetails={updateChallengeDetails}
            replaceResourceInRole={replaceResourceInRole}
            partiallyUpdateChallengeDetails={partiallyUpdateChallengeDetails}
            deleteChallenge={deleteChallenge}
          />
        ))
        } />
      }
      <Route
        exact
        path={`${this.props.match.path}/view`}
        render={({ match }) => ((
          <ChallengeViewComponent
            isLoading={isLoading}
            metadata={metadata}
            projectDetail={projectDetail}
            challenge={challengeDetails}
            challengeResources={challengeResources}
            token={token}
            challengeId={challengeId}
            assignedMemberDetails={assignedMemberDetails}
            enableEdit={enableEdit}
            onLaunchChallenge={this.onLaunchChallenge}
            onCloseTask={this.onCloseTask}
          />
        ))
        } />
    </div>
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
  loadChallengeTags: PropTypes.func,
  // loadChallengeTerms: PropTypes.func,
  loadGroups: PropTypes.func,
  loadChallengeDetails: PropTypes.func,
  loadResources: PropTypes.func,
  loadResourceRoles: PropTypes.func,
  challengeResources: PropTypes.arrayOf(PropTypes.object),
  challengeDetails: PropTypes.object,
  isProjectLoading: PropTypes.bool,
  hasProjectAccess: PropTypes.bool,
  projectDetail: PropTypes.object,
  // history: PropTypes.object,
  metadata: PropTypes.shape({
    challengeTypes: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  createAttachment: PropTypes.func,
  attachments: PropTypes.arrayOf(PropTypes.shape()),
  token: PropTypes.string,
  loggedInUser: PropTypes.object,
  removeAttachment: PropTypes.func,
  failedToLoad: PropTypes.bool,
  updateChallengeDetails: PropTypes.func.isRequired,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  createChallenge: PropTypes.func.isRequired,
  deleteChallenge: PropTypes.func.isRequired,
  replaceResourceInRole: PropTypes.func
  // members: PropTypes.arrayOf(PropTypes.shape())
}

const mapStateToProps = ({ projects, challenges: { challengeDetails, challengeResources, metadata, isLoading, attachments, failedToLoad }, auth: { token, user }, members: { members } }) => ({
  challengeDetails,
  hasProjectAccess: projects.hasProjectAccess,
  projectDetail: projects.projectDetail,
  challengeResources,
  metadata,
  isLoading,
  isProjectLoading: projects.isLoading,
  attachments,
  token,
  loggedInUser: user,
  failedToLoad
  // members
})

const mapDispatchToProps = {
  loadChallengeDetails,
  loadTimelineTemplates,
  loadChallengePhases,
  loadChallengeTypes,
  loadChallengeTracks,
  loadChallengeTimelines,
  loadChallengeTags,
  loadGroups,
  createAttachment,
  removeAttachment,
  // loadChallengeTerms,
  loadResources,
  loadResourceRoles,
  updateChallengeDetails,
  partiallyUpdateChallengeDetails,
  deleteChallenge,
  createChallenge,
  replaceResourceInRole
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor))
