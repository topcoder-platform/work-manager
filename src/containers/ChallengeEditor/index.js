import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import { loadChallengeDetails, createAttachment, removeAttachment, setFilterChallengeName } from '../../actions/challenges'
import { connect } from 'react-redux'

class ChallengeEditor extends Component {
  componentDidMount () {
    const { match, loadChallengeDetails, setFilterChallengeName } = this.props
    // reset filter challenge name
    setFilterChallengeName('')
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
    const { match, isLoading, challengeDetails, metadata, createAttachment, attachments, token, removeAttachment } = this.props
    return (
      <ChallengeEditorComponent
        isLoading={isLoading}
        challengeDetails={challengeDetails}
        metadata={metadata}
        projectId={_.get(match.params, 'projectId', null)}
        challengeId={_.get(match.params, 'challengeId', null)}
        isNew={!_.has(match.params, 'challengeId')}
        uploadAttachment={createAttachment}
        attachments={attachments}
        token={token}
        removeAttachment={removeAttachment}
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
  setFilterChallengeName: PropTypes.func
}

const mapStateToProps = ({ challenges: { challengeDetails, metadata, isLoading, attachments }, auth: { token } }) => ({
  challengeDetails,
  metadata,
  isLoading,
  attachments,
  token
})

const mapDispatchToProps = {
  loadChallengeDetails,
  createAttachment,
  removeAttachment,
  setFilterChallengeName
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor))
