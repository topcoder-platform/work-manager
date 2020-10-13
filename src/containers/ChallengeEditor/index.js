import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import ChallengeViewComponent from '../../components/ChallengeEditor/ChallengeView'
import Loader from '../../components/Loader'
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
  createChallenge,
  replaceResourceInRole
} from '../../actions/challenges'
import {
  loadMemberDetails
} from '../../actions/members'

import { connect } from 'react-redux'
import { SUBMITTER_ROLE_UUID } from '../../config/constants'

class ChallengeEditor extends Component {
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
    const { match, challengeDetails } = this.props
    const { match: newMatch, loadChallengeDetails, loadResources, challengeDetails: nextChallengeDetails } = nextProps
    const projectId = _.get(newMatch.params, 'projectId', null)
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    if (_.get(match.params, 'projectId', null) !== projectId || _.get(match.params, 'challengeId', null) !== challengeId) {
      this.fetchChallengeDetails(newMatch, loadChallengeDetails, loadResources)
    }

    // this section is called only one time as soon challenge details are loaded
    if (
      _.get(challengeDetails, 'id') !== _.get(nextChallengeDetails, 'id') &&
      challengeId === _.get(nextChallengeDetails, 'id')
    ) {
      this.loadAssignedMemberDetails(nextProps)
    }
  }

  /**
   * Load assign member details if challenge has a member assigned
   * @param {Object} nextProps the latest props
   */
  loadAssignedMemberDetails (nextProps) {
    // cannot use `loadMemberDetails` form the `nextProps` because linter complains about unused prop
    const { loadMemberDetails } = this.props
    const { challengeDetails } = nextProps
    const assignedMemberId = _.get(challengeDetails, 'task.memberId')

    if (assignedMemberId) {
      loadMemberDetails(assignedMemberId)
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
    const { hasProjectAccess, metadata: { resourceRoles }, challengeResources, loggedInUser } = this.props
    if (!hasProjectAccess) {
      return false
    }
    const userRoles = _.filter(challengeResources, cr => cr.memberId === `${loggedInUser.userId}`)
    const userResourceRoles = _.filter(resourceRoles, rr => _.some(userRoles, ur => ur.roleId === rr.id))
    return _.some(userResourceRoles, urr => urr.fullAccess && urr.isActive)
  }

  render () {
    const {
      match,
      isLoading,
      isProjectLoading,
      challengeDetails,
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
      replaceResourceInRole
      // members
    } = this.props
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
    const enableEdit = true // this.isEditable()
    return <div>
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
      { !enableEdit && <div className={styles.errorContainer}>You don't have access to edit the challenge</div>}
      { enableEdit && <Route
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
  loadMemberDetails: PropTypes.func,
  updateChallengeDetails: PropTypes.func.isRequired,
  partiallyUpdateChallengeDetails: PropTypes.func.isRequired,
  createChallenge: PropTypes.func.isRequired,
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
  loadMemberDetails,
  updateChallengeDetails,
  partiallyUpdateChallengeDetails,
  createChallenge,
  replaceResourceInRole
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor))
