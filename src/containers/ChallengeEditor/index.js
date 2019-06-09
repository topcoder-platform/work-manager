import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import ChallengeEditorComponent from '../../components/ChallengeEditor'

class ChallengeEditor extends Component {
  render () {
    const { match } = this.props
    return (
      <ChallengeEditorComponent
        challengeId={_.get(match.params, 'challengeId', null)}
        isNew={_.isEmpty(_.get(match.params, 'challengeId', null))}
      />
    )
  }
}

ChallengeEditor.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      challengeId: PropTypes.string
      // projectId: PropTypes.string
    })
  }).isRequired
}

export default withRouter(ChallengeEditor)
