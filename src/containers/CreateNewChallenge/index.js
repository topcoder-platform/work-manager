import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import CreateNewChallengeComponent from '../../components/CreateNewChallenge'

class CreateNewChallenge extends Component {
  render () {
    const { match } = this.props
    return (
      <CreateNewChallengeComponent
        challengeId={_.get(match.params, 'challengeId', null)}
        isNew={_.isEmpty(_.get(match.params, 'challengeId', null))}
      />
    )
  }
}

CreateNewChallenge.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      challengeId: PropTypes.string
      // projectId: PropTypes.string
    })
  }).isRequired
}

export default withRouter(CreateNewChallenge)
