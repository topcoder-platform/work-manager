import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import {
  loadTimelineTemplates,
  loadChallengePhases,
  loadChallengeTypes,
  loadChallengeTags,
  loadGroups,
  loadChallengeDetails,
  createAttachment,
  removeAttachment,
  setFilterChallengeValue
} from '../../actions/challenges'

import { connect } from 'react-redux'

class ChallengeEditor extends Component {
  componentDidMount () {
    const {
      match,
      loadChallengeDetails,
      loadTimelineTemplates,
      loadChallengePhases,
      loadChallengeTypes,
      loadChallengeTags,
      loadGroups
    } = this.props
    loadTimelineTemplates()
    loadChallengePhases()
    loadChallengeTypes()
    loadChallengeTags()
    loadGroups()
    loadChallengeDetails(_.get(match.params, 'projectId', null), _.get(match.params, 'challengeId', null))
  }

  componentWillReceiveProps (nextProps) {
    const { match } = this.props
    const { match: newMatch, loadChallengeDetails } = nextProps
    const projectId = _.get(newMatch.params, 'projectId', null)
    const challengeId = _.get(newMatch.params, 'challengeId', null)
    if (_.get(match.params, 'projectId', null) !== projectId || _.get(match.params, 'challengeId', null) !== challengeId) {
      loadChallengeDetails(projectId, challengeId)
    }
  }

  render () {
    const { match, isLoading, challengeDetails, metadata, createAttachment, attachments, token, removeAttachment, failedToLoad } = this.props
    return (
      <ChallengeEditorComponent
        isLoading={isLoading}
        challengeDetails={challengeDetails}
        metadata={metadata}
        projectId={_.get(match.params, 'projectId', null)}
        challengeId={_.get(match.params, 'challengeId', null)}
        isNew={!_.has(match.params, 'challengeId')}
        isDraft={_.get(challengeDetails, 'status') === 'Draft'}
        uploadAttachment={createAttachment}
        attachments={attachments}
        token={token}
        removeAttachment={removeAttachment}
        failedToLoad={failedToLoad}
      />
    )
  }
}

ChallengeEditor.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      challengeId: PropTypes.string,
      projectId: PropTypes.string
    })
  }).isRequired,
  loadTimelineTemplates: PropTypes.func,
  loadChallengePhases: PropTypes.func,
  loadChallengeTypes: PropTypes.func,
  loadChallengeTags: PropTypes.func,
  loadGroups: PropTypes.func,
  loadChallengeDetails: PropTypes.func,
  challengeDetails: PropTypes.object,
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

const mapStateToProps = ({ challenges: { challengeDetails, metadata, isLoading, attachments, failedToLoad }, auth: { token } }) => ({
  challengeDetails,
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
  loadChallengeTags,
  loadGroups,
  createAttachment,
  removeAttachment,
  setFilterChallengeValue
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor))
