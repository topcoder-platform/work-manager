/**
 * Component to render when there is no active challenge
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './NoChallenge.module.scss'

const NoChallenge = ({ activeMenu }) => {
  return (
    <div className={styles.noChallenge}>
      {
        activeMenu !== ''
          ? (<p>You have no challenges at the moment</p>) : (<p>Please select a project to view challenges</p>)
      }
    </div>
  )
}

NoChallenge.defaultProps = {
  activeMenu: ''
}

NoChallenge.propTypes = {
  activeMenu: PropTypes.string
}

export default NoChallenge
