/**
 * Component to render when there is no active records
 */
import React from 'react'
import styles from './NoRecords.module.scss'
import PropTypes from 'prop-types'

const NoRecords = ({ name }) => {
  return (
    <div className={styles.noRecords}>
      <p>There are no {name} available for this submission</p>
      <p>or you don’t have access to view them.</p>
    </div>
  )
}

NoRecords.propTypes = {
  name: PropTypes.string
}

export default NoRecords
