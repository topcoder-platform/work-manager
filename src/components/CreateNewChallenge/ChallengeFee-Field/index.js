import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeFee-Field.module.scss'
import cn from 'classnames'

const ChallengeFeeField = ({ challenge }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='chalengeFee'>Challenge Fee :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <span>{_.isEmpty(challenge.challengeFee) ? '' : `$ ${challenge.challengeFee}`}</span>
      </div>
    </div>
  )
}

ChallengeFeeField.propTypes = {
  challenge: PropTypes.shape().isRequired
}

export default ChallengeFeeField
