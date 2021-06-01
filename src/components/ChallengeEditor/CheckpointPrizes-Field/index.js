import React from 'react'
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
  CHALLENGE_PRIZE_TYPE
} from '../../../config/constants'

const CheckpointPrizesField = ({ challenge, onUpdateOthers, readOnly }) => {
  const type = PRIZE_SETS_TYPE.CHECKPOINT_PRIZES
  const checkpointPrize = (challenge.prizeSets &&
    challenge.prizeSets.find(p => p.type === type)) || {
    type,
    prizes: [{ type: CHALLENGE_PRIZE_TYPE.USD, value: 0 }]
  }
  const checkpointPrizeNumber = (challenge.metadata &&
    challenge.metadata.find(p => p.name === 'checkpointPrizeNumber')) || {
    name: 'checkpointPrizeNumber',
    value: 0
  }

  const number = checkpointPrizeNumber.value
  const amount = checkpointPrize.prizes.length
    ? checkpointPrize.prizes[0].value
    : 0

  function onChangeNumber (number) {
    checkpointPrizeNumber.value = validateValue(
      number,
      VALIDATION_VALUE_TYPE.INTEGER
    )
    onUpdateOthers({
      field: 'metadata',
      value: [
        ...(challenge.metadata && challenge.metadata.filter(p => p.name !== 'checkpointPrizeNumber')) || [],
        checkpointPrizeNumber
      ]
    })
  }
  function onChangeAmount (amount) {
    checkpointPrize.prizes = [
      {
        type: CHALLENGE_PRIZE_TYPE.USD,
        value: validateValue(amount, VALIDATION_VALUE_TYPE.INTEGER)
      }
    ]
    onUpdateOthers({
      field: 'prizeSets',
      value: [
        ...(challenge.prizeSets && challenge.prizeSets.filter(p => p.type !== type)) || [],
        checkpointPrize
      ]
    })
  }
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='checkpointPrizes'>Checkpoint Prizes :</label>
      </div>
      {readOnly ? (
        <span className={styles.readonlyRow}>{+number} X ${amount}</span>
      ) : (
        <div className={cn(styles.field, styles.col2)}>
          <input
            id='checkNumber'
            name='checkNumber'
            type='text'
            placeholder='Number of prizes'
            value={number}
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
