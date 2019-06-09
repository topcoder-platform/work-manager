import React from 'react'
import PropTypes from 'prop-types'
import styles from './ReviewCost-Field.module.scss'
import cn from 'classnames'

const ReviewCostField = ({ challenge, onUpdateInput }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='reviewCost'>Review Cost :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input id='reviewCost' name='reviewCost' type='text' placeholder='' value={challenge.reviewCost} maxLength='200' onChange={onUpdateInput} />
      </div>
    </div>
  )
}

ReviewCostField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired
}

export default ReviewCostField
