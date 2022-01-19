/**
 * Component to render when there is no active challenge
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './NoChallenge.module.scss'

const NoChallenge = ({
  activeProject,
  selfService
}) => {
  let noChallengeMessage
  if (selfService || !!activeProject) {
    noChallengeMessage = selfService ? 'There are' : 'You have'
    noChallengeMessage += ' no challenges at the moment'
  } else {
    noChallengeMessage = 'Please select a project to view challenges'
  }

  return (
    <div className={styles.noChallenge}>
      <p>{noChallengeMessage}</p>
    </div>
  )
}

NoChallenge.defaultProps = {
  activeProject: null
}

NoChallenge.propTypes = {
  activeProject: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  selfService: PropTypes.bool
}

export default NoChallenge
