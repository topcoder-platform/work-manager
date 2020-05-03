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
  [CHALLENGE_STATUS.NEW]: styles.yellow,
  [CHALLENGE_STATUS.DRAFT]: styles.gray,
  [CHALLENGE_STATUS.COMPLETED]: styles.blue
}

const ChallengeStatus = ({ status }) => {
  return (
    <div className={cn(styles.container, statuses[status])}>
      <span>{_.startCase(_.toLower(status))}</span>
    </div>
  )
}

ChallengeStatus.propTypes = {
  status: PropTypes.string
}

export default ChallengeStatus
