import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'
import { loadChallengeDetails } from '../../actions/challenges'
import { connect } from 'react-redux'

class ChallengeEditor extends Component {
  componentDidMount () {
    const { match, loadChallengeDetails } = this.props
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
    const { match, isLoading, challengeDetails, metadata } = this.props
    return (
      <ChallengeEditorComponent
        isLoading={isLoading}
        challengeDetails={challengeDetails}
        metadata={metadata}
        projectId={_.get(match.params, 'projectId', null)}
        challengeId={_.get(match.params, 'challengeId', null)}
        isNew={_.isEmpty(_.get(match.params, 'challengeId', null))}
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
  isLoading: PropTypes.bool
}

const mapStateToProps = ({ challenges: { challengeDetails, metadata, isLoading } }) => ({
  challengeDetails,
  metadata,
  isLoading
})

const mapDispatchToProps = {
  loadChallengeDetails
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChallengeEditor))
