/**
 * Component to render when there is no active challenge
 */
import React from 'react'
import styles from './NoSubmissions.module.scss'

const NoChallenge = () => {
  return (
    <div className={styles.noSubmissions}>
      <p>There are no submissions available for this challenge</p>
      <p>or you don’t have access to view them.</p>
    </div>
  )
}

export default NoChallenge
