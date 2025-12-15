import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeTotal-Field.module.scss'
import cn from 'classnames'
import { convertDollarToInteger } from '../../../util/input-check'
import { CHALLENGE_PRIZE_TYPE, PRIZE_SETS_TYPE } from '../../../config/constants'
import { getPrizeType } from '../../../util/prize'

const ChallengeTotalField = ({ challenge }) => {
  let challengeTotal = null
  const prizeSets = challenge.prizeSets || []
  const prizeType = getPrizeType(prizeSets)
  const prizeSetsForTotal = prizeType === CHALLENGE_PRIZE_TYPE.POINT
    ? prizeSets.filter(p => p.type === PRIZE_SETS_TYPE.COPILOT_PAYMENT)
    : prizeSets

  if (prizeSetsForTotal.length) {
    challengeTotal = _.flatten(prizeSetsForTotal.map(p => p.prizes))
      .map(p => p.value)
      .map(v => convertDollarToInteger(v, '$'))
      .reduce((prev, next) => prev + next, 0)
  }
  const placementPrizeSet = prizeSets.find(set => set.type === PRIZE_SETS_TYPE.CHALLENGE_PRIZES)
  const firstPlacePrize = prizeType === CHALLENGE_PRIZE_TYPE.POINT
    ? 0
    : (placementPrizeSet && placementPrizeSet.prizes && placementPrizeSet.prizes[0] && placementPrizeSet.prizes[0].value) || 0
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
        const basePayment = firstPlacePrize * parseFloat(r.baseCoefficient || 0)
        const incrementalPayment = parseFloat(r.incrementalCoefficient || 0) * firstPlacePrize

        const count = parseInt(r.memberReviewerCount) || 1
        return sum + (basePayment + incrementalPayment) * count
      }, 0)
  }

  const totalChallengeCost = ((challengeTotal || 0) + reviewerTotal) || 0
  const formattedTotalChallengeCost = Number.isFinite(totalChallengeCost) ? totalChallengeCost.toFixed(2) : '0.00'
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='challengeTotal'>Estimated Challenge Total :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <span>$ {formattedTotalChallengeCost}</span>
      </div>
    </div>
  )
}

ChallengeTotalField.propTypes = {
  challenge: PropTypes.shape().isRequired
}

export default ChallengeTotalField
