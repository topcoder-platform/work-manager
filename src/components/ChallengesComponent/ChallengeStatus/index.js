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
  [CHALLENGE_STATUS.COMPLETED]: styles.blue,
  [CHALLENGE_STATUS.CANCELLED]: styles.red,
  [CHALLENGE_STATUS.CANCELLED_CLIENT_REQUEST]: styles.red,
  [CHALLENGE_STATUS.CANCELLED_FAILED_REVIEW]: styles.red,
  [CHALLENGE_STATUS.CANCELLED_FAILED_SCREENING]: styles.red,
  [CHALLENGE_STATUS.CANCELLED_REQUIREMENTS_INFEASIBLE]: styles.red,
  [CHALLENGE_STATUS.CANCELLED_WINNER_UNRESPONSIVE]: styles.red,
  [CHALLENGE_STATUS.CANCELLED_ZERO_REGISTRATIONS]: styles.red,
  [CHALLENGE_STATUS.CANCELLED_ZERO_SUBMISSIONS]: styles.red
}

const ChallengeStatus = ({ status, statusText }) => {
  return (
    <div className={cn(styles.container, statuses[status])}>
      <span>{_.startCase(_.toLower(statusText))}</span>
    </div>
  )
}

ChallengeStatus.propTypes = {
  status: PropTypes.string,
  statusText: PropTypes.string
}

export default ChallengeStatus
