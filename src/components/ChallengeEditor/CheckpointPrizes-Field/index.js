import React from 'react'
import PropTypes from 'prop-types'
import styles from './CheckpointPrizes-Field.module.scss'
import cn from 'classnames'
import { range } from 'lodash'
import { validateValue } from '../../../util/input-check'
import { VALIDATION_VALUE_TYPE, PRIZE_SETS_TYPE } from '../../../config/constants'

const CheckpointPrizesField = ({ challenge, onUpdateOthers }) => {
  const type = PRIZE_SETS_TYPE.CHECKPOINT_PRIZES
  const checkpointPrize = challenge.prizeSets.find(p => p.type === type) || { type, prizes: [] }
  const number = checkpointPrize.prizes.length
  const amount = checkpointPrize.prizes.length ? checkpointPrize.prizes[0].value : 0

  function onChange (number, amount) {
    checkpointPrize.prizes = range(validateValue(number, VALIDATION_VALUE_TYPE.INTEGER))
      .map(i => ({ type: 'Prize ' + i, value: validateValue(amount, VALIDATION_VALUE_TYPE.INTEGER, '$') }))
    onUpdateOthers({ field: 'prizeSets', value: [...challenge.prizeSets.filter(p => p.type !== type), +number && checkpointPrize].filter(p => p) })
  }
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='checkpointPrizes'>Checkpoint Prizes :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input id='checkNumber' name='checkNumber' type='text' placeholder='Number of checkpoint prizes' value={number} maxLength='200' onChange={e => onChange(e.target.value, amount)} />
        <input id='checkAmount' name='checkAmount' type='text' placeholder='Amount per prizes' value={amount} maxLength='200' onChange={e => onChange(number, e.target.value)} />
      </div>
    </div>
  )
}

CheckpointPrizesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default CheckpointPrizesField
