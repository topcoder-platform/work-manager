import React from 'react'
import PropTypes from 'prop-types'
import styles from './ReviewCost-Field.module.scss'
import cn from 'classnames'
import { validateValue } from '../../../util/input-check'
import { VALIDATION_VALUE_TYPE, PRIZE_SETS_TYPE } from '../../../config/constants'
import { getPrizeType } from '../../../util/prize'

class ReviewCostField extends React.Component {
  constructor (props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange (e) {
    const { challenge, onUpdateOthers } = this.props
    const type = PRIZE_SETS_TYPE.REVIEWER_PAYMENT
    const prizeSets = challenge.prizeSets || []
    const prizeType = getPrizeType(prizeSets)
    const reviewCost = prizeSets.find(p => p.type === type) || { type, prizes: [{ type: prizeType, value: 0 }] }
    const value = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER, '$')
    reviewCost.prizes = [{ type: prizeType, value }]
    onUpdateOthers({ field: 'prizeSets', value: [...prizeSets.filter(p => p.type !== type), reviewCost] })
  }

  render () {
    const { challenge } = this.props
    const type = PRIZE_SETS_TYPE.REVIEWER_PAYMENT
    const prizeSets = challenge.prizeSets || []
    const prizeType = getPrizeType(prizeSets)
    const reviewCost = prizeSets.find(p => p.type === type) || { type, prizes: [{ type: prizeType, value: 0 }] }
    const value = reviewCost.prizes[0].value

    return (
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='reviewCost'>Review Cost :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input id='reviewCost' name='reviewCost' type='text' placeholder='' value={value} maxLength='200' onChange={this.onChange} />
        </div>
      </div>
    )
  }
}

ReviewCostField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default ReviewCostField
