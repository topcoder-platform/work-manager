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
      .reduce((prev, next) => prev + next, 0)
  }

  let reviewerTotal = 0
  if (challenge.reviewers && Array.isArray(challenge.reviewers)) {
    reviewerTotal = challenge.reviewers
      .filter(r => {
        const isAI = r && (
          (r.aiWorkflowId && r.aiWorkflowId.trim() !== '') ||
          (r.isMemberReview === false)
        )
        return !isAI
      })
      .reduce((sum, r) => {
        const base = convertDollarToInteger(r.basePayment || '0', '')
        const count = parseInt(r.memberReviewerCount) || 1
        return sum + (base * count)
      }, 0)
  }

  const totalChallengeCost = (challengeTotal || 0) + reviewerTotal
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='challengeTotal'>Estimated Challenge Total :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <span>$ {totalChallengeCost}</span>
      </div>
    </div>
  )
}

ChallengeTotalField.propTypes = {
  challenge: PropTypes.shape().isRequired
}

export default ChallengeTotalField
