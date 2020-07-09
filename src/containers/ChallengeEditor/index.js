import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Route } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import ChallengeViewComponent from '../../components/ChallengeEditor/ChallengeView'
import Loader from '../../components/Loader'

import {
  loadTimelineTemplates,
  loadChallengePhases,
  loadChallengeTypes,
  loadChallengeTimelines,
  loadChallengeTags,
  loadChallengeTerms,
  loadGroups,
  loadChallengeDetails,
  createAttachment,
  removeAttachment,
  loadResources,
  loadResourceRoles
} from '../../actions/challenges'

import { connect } from 'react-redux'

class ChallengeEditor extends Component {
  componentDidMount () {
    const {
      match,
      loadTimelineTemplates,
      loadChallengePhases,
      loadChallengeTypes,
      loadChallengeTimelines,
      loadChallengeTags,
      loadChallengeTerms,
      loadGroups,
      loadResourceRoles,
      loadChallengeDetails,
      loadResources
    } = this.props
    loadTimelineTemplates()
    loadChallengePhases()
    loadChallengeTypes()
    loadChallengeTimelines()
    loadChallengeTags()
    loadChallengeTerms()
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
    }
  }

  fetchChallengeDetails (newMatch, loadChallengeDetails, loadResources) {
    const projectId = _.get(newMatch.params, 'projectId', null)
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    loadResources(challengeId)
    loadChallengeDetails(projectId, challengeId)
  }

  render () {
    const {
      match,
      isLoading,
      challengeDetails,
      challengeResources,
      metadata,
      createAttachment,
      attachments,
      token,
      removeAttachment,
      failedToLoad,
      projectDetail
    } = this.props
    const challengeId = _.get(match.params, 'challengeId', null)
    if (challengeId && (!challengeDetails || !challengeDetails.id)) {
      return (<Loader />)
    }
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
          />
        ))
        } />
      <Route
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
          />
        ))
        } />
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
  loadChallengeTimelines: PropTypes.func,
  loadChallengeTags: PropTypes.func,
  loadChallengeTerms: PropTypes.func,
  loadGroups: PropTypes.func,
  loadChallengeDetails: PropTypes.func,
  loadResources: PropTypes.func,
  loadResourceRoles: PropTypes.func,
  challengeResources: PropTypes.arrayOf(PropTypes.object),
  challengeDetails: PropTypes.object,
  projectDetail: PropTypes.object,
  // history: PropTypes.object,
  metadata: PropTypes.shape({
    challengeTypes: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  createAttachment: PropTypes.func,
  attachments: PropTypes.arrayOf(PropTypes.shape()),
  token: PropTypes.string,
  removeAttachment: PropTypes.func,
  failedToLoad: PropTypes.bool
}

const mapStateToProps = ({ projects: { projectDetail }, challenges: { challengeDetails, challengeResources, metadata, isLoading, attachments, failedToLoad }, auth: { token } }) => ({
  challengeDetails,
  projectDetail,
  challengeResources,
  metadata,
  isLoading,
  attachments,
  token,
  failedToLoad
})

const mapDispatchToProps = {
  loadChallengeDetails,
  loadTimelineTemplates,
  loadChallengePhases,
  loadChallengeTypes,
  loadChallengeTimelines,
  loadChallengeTags,
  loadGroups,
  createAttachment,
  removeAttachment,
  loadChallengeTerms,
  loadResources,
  loadResourceRoles
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor))
