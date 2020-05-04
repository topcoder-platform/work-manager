import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeTotal-Field.module.scss'
import cn from 'classnames'
import { convertDollarToInteger } from '../../../util/input-check'

const ChallengeTotalField = ({ challenge }) => {
  let challengeTotal = null
  if (challenge.prizeSets) {
    challengeTotal = _.flatten(challenge.prizeSets.map(p => p.prizes))
      .map(p => p.value)
      .map(v => convertDollarToInteger(v, '$'))
      .map(v => +v)
      .reduce((prev, next) => prev + next, 0)
  }
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='challengeTotal'>Estimated Challenge Total :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <span>$ {challengeTotal || 0}</span>
      </div>
    </div>
  )
}

ChallengeTotalField.propTypes = {
  challenge: PropTypes.shape().isRequired
}

export default ChallengeTotalField
