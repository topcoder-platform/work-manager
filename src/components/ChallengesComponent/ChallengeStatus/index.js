/**
 * Component to render Challenges Status
 */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import {
  CHALLENGE_STATUS
} from '../../../config/constants'
import styles from './ChallengeStatus.module.scss'

const statuses = {
  [CHALLENGE_STATUS.ACTIVE]: styles.green,
  [CHALLENGE_STATUS.APPROVED]: styles.yellow,
  [CHALLENGE_STATUS.NEW]: styles.yellow,
  [CHALLENGE_STATUS.DRAFT]: styles.gray,
  [CHALLENGE_STATUS.COMPLETED]: styles.blue
}

const ChallengeStatus = ({ status, statusText }) => {
  const normalizedStatus = (status || '').toUpperCase()
  const isCancelledStatus = normalizedStatus.startsWith(CHALLENGE_STATUS.CANCELLED)
  const containerClass = cn(styles.container, isCancelledStatus ? styles.red : statuses[normalizedStatus])
  const displayText = isCancelledStatus ? 'Cancelled' : _.startCase(_.toLower(statusText || normalizedStatus))

  return (
    <div className={containerClass}>
      <span>{displayText}</span>
    </div>
  )
}

ChallengeStatus.propTypes = {
  status: PropTypes.string,
  statusText: PropTypes.string
}

export default ChallengeStatus
