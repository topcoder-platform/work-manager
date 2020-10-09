import React from 'react'
import PropTypes from 'prop-types'
import styles from './ReviewCost-Field.module.scss'
import cn from 'classnames'
import { validateValue } from '../../../util/input-check'
import { VALIDATION_VALUE_TYPE, PRIZE_SETS_TYPE, CHALLENGE_PRIZE_TYPE } from '../../../config/constants'

const ReviewCostField = ({ challenge, onUpdateOthers }) => {
  const type = PRIZE_SETS_TYPE.REVIEWER_PAYMENT
  const reviewCost = challenge.prizeSets.find(p => p.type === type) || { type, prizes: [{ type: CHALLENGE_PRIZE_TYPE.USD, value: 0 }] }
  const value = reviewCost.prizes[0].value

  function onChange (e) {
    const value = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER, '$')
    reviewCost.prizes = [{ type: CHALLENGE_PRIZE_TYPE.USD, value }]
    onUpdateOthers({ field: 'prizeSets', value: [...challenge.prizeSets.filter(p => p.type !== type), reviewCost] })
  }

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='reviewCost'>Review Cost :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input id='reviewCost' name='reviewCost' type='text' placeholder='' value={value} maxLength='200' onChange={onChange} />
      </div>
    </div>
  )
}

ReviewCostField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default ReviewCostField
