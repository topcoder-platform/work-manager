import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './CheckpointPrizes-Field.module.scss'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
// import { range } from 'lodash'
import { validateValue } from '../../../util/input-check'
import {
  VALIDATION_VALUE_TYPE,
  PRIZE_SETS_TYPE,
  CHALLENGE_PRIZE_TYPE,
  PRIZE_SETS_TYPE_DESCRIPTION
} from '../../../config/constants'

const CheckpointPrizesField = ({ challenge, onUpdateOthers, readOnly }) => {
  const type = PRIZE_SETS_TYPE.CHECKPOINT_PRIZES
  const description = PRIZE_SETS_TYPE_DESCRIPTION[type]
  const checkPointPrizeSet = (challenge.prizeSets && challenge.prizeSets.find(p => p.type === type)) || {}
  let checkPointPrizeCount = (checkPointPrizeSet.prizes && checkPointPrizeSet.prizes.length) || 0
  let checkPointPrizeAmount = (checkPointPrizeSet.prizes && checkPointPrizeSet.prizes.length > 0 &&
    checkPointPrizeSet.prizes[0].value) || 0
  const [count, setCount] = useState(checkPointPrizeCount)
  const [amount, setAmount] = useState(checkPointPrizeAmount)

  function updateState () {
    const newCheckPointPrize = {
      prizes: [],
      type,
      description
    }
    for (let i = 0; i < checkPointPrizeCount; i++) {
      newCheckPointPrize.prizes.push(
        {
          'type': CHALLENGE_PRIZE_TYPE.USD,
          'value': checkPointPrizeAmount
        }
      )
    }

    const newPrizeSets = [
      ...(challenge.prizeSets && challenge.prizeSets.filter(p => p.type !== type)) || [],
      newCheckPointPrize
    ]

    onUpdateOthers({
      field: 'prizeSets',
      value: newPrizeSets
    })
  }

  function onChangeNumber (number) {
    const validValue = validateValue(
      number,
      VALIDATION_VALUE_TYPE.INTEGER
    )
    setCount(validValue)
    checkPointPrizeCount = validValue
    updateState()
  }

  function onChangeAmount (amount) {
    const validValue = validateValue(amount, VALIDATION_VALUE_TYPE.INTEGER)
    setAmount(validValue)
    checkPointPrizeAmount = validValue
    updateState()
  }

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='checkpointPrizes'>Checkpoint Prizes :</label>
      </div>
      {readOnly ? (
        <span className={styles.readonlyRow}>{+count} X ${amount}</span>
      ) : (
        <div className={cn(styles.field, styles.col2)}>
          <input
            id='checkNumber'
            name='checkNumber'
            type='text'
            placeholder='Number of prizes'
            value={count}
            maxLength='7'
            onChange={e => onChangeNumber(e.target.value)}
          />
          X
          <div className={styles.selectContainer}>
            <FontAwesomeIcon className={styles.icon} icon={faDollarSign} />
          </div>
          <input
            id='checkAmount'
            name='checkAmount'
            type='text'
            placeholder='Amount per prizes'
            value={amount}
            maxLength='7'
            onChange={e => onChangeAmount(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

CheckpointPrizesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func,
  readOnly: PropTypes.bool
}

export default CheckpointPrizesField
