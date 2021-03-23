import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './CheckpointPrizes-Field.module.scss'
import cn from 'classnames'
import { range } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign, faTimes } from '@fortawesome/free-solid-svg-icons'
import { validateValue } from '../../../util/input-check'
import { VALIDATION_VALUE_TYPE, PRIZE_SETS_TYPE, CHALLENGE_PRIZE_TYPE } from '../../../config/constants'

const CheckpointPrizesField = ({ readOnly, challenge, onUpdateOthers }) => {
  const [number, setNumber] = useState(0)
  const [amount, setAmount] = useState(0)
  const type = PRIZE_SETS_TYPE.CHECKPOINT_PRIZES
  const checkpointPrize = (challenge.prizeSets && challenge.prizeSets.find(p => p.type === type)) || { type, prizes: [] }

  const inputAmount = (checkpointPrize.prizes.length && checkpointPrize.prizes[0].value) || amount
  let inputNumber = checkpointPrize.prizes.length || number
  if (inputAmount > 0 && +inputNumber === 0) {
    inputNumber = ''
  }

  function onChange (number, amount) {
    const value = validateValue(amount, VALIDATION_VALUE_TYPE.INTEGER)
    setAmount(value)

    const numberValue = validateValue(number, VALIDATION_VALUE_TYPE.INTEGER)
    setNumber(numberValue)

    checkpointPrize.prizes = range(numberValue)
      .map(i => ({ type: CHALLENGE_PRIZE_TYPE.USD, value }))

    if (amount > 0 && +number === 0) {
      // add invalid tag  for validation before submition
      checkpointPrize.invalid = true
    } else {
      // delete tag
      delete checkpointPrize.invalid
    }
    const existingPrizes = challenge.prizeSets
      ? challenge.prizeSets.filter(p => p.type !== type)
      : []
    const prizesSets = { field: 'prizeSets', value: [...existingPrizes, ...[checkpointPrize]] }
    onUpdateOthers(prizesSets)
  }

  if (readOnly && inputNumber < 1) {
    return null
  }
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='checkpointPrizes'>Checkpoint Prizes :</label>
        </div>
        {readOnly ? (
          <span>${inputAmount}  ×  {inputNumber}</span>
        ) : (
          <div className={cn(styles.field, styles.col2)}>
            <div className={styles.selectContainer}>
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <input id='checkAmount' name='checkAmount' type='text' placeholder='Amount per prizes' value={inputAmount} maxLength='200' onChange={e => onChange(inputNumber, e.target.value)} />
            <div className={styles.selectContainer}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <input id='checkNumber' name='checkNumber' type='text' placeholder='Number of checkpoint prizes' value={inputNumber} maxLength='200' onChange={e => onChange(e.target.value, inputAmount)} />
          </div>
        )}
      </div>
      {!readOnly && challenge.submitTriggered && inputAmount > 0 && !inputNumber && (
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)} />
          <div className={cn(styles.field, styles.col2, styles.error)}>
            Number of checkpoint prizes must bigger than 0
          </div>
        </div>
      )}
    </div>
  )
}

CheckpointPrizesField.propTypes = {
  readOnly: PropTypes.bool,
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default CheckpointPrizesField
