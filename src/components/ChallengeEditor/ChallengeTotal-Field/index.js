import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeTotal-Field.module.scss'
import cn from 'classnames'
import { convertDollarToInteger } from '../../../util/input-check'
import { PRIZE_SETS_TYPE } from '../../../config/constants'

const ChallengeTotalField = ({ challenge }) => {
  let challengeTotal = null

  if (challenge.prizeSets) {
    const prizeSets = _.cloneDeep(challenge.prizeSets)
    // calculate checkpoint prize
    const checkpointPrizeNumber =
      challenge.metadata &&
      challenge.metadata.find(p => p.name === 'checkpointPrizeNumber')
    const checkpointPrize =
      prizeSets &&
      prizeSets.find(p => p.type === PRIZE_SETS_TYPE.CHECKPOINT_PRIZES)
    if (checkpointPrize && checkpointPrize.prizes) {
      checkpointPrize.prizes[0].value = _.get(checkpointPrizeNumber, 'value', 0) * _.get(checkpointPrize, 'prizes[0].value', 0)
    }
    challengeTotal = _.flatten(prizeSets.map(p => p.prizes))
      .map(p => p.value)
      .map(v => convertDollarToInteger(v, '$'))
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
