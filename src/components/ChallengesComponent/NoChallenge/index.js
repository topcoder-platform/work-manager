/**
 * Component to render when there is no active challenge
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './NoChallenge.module.scss'

const NoChallenge = ({ activeProject }) => {
  return (
    <div className={styles.noChallenge}>
      {
        activeProject
          ? (<p>You have no challenges at the moment</p>) : (<p>Please select a project to view challenges</p>)
      }
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
  })
}

export default NoChallenge
