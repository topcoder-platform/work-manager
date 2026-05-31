import React from 'react'
import PropTypes from 'prop-types'
import styles from './CheckpointPrizes-Field.module.scss'
import cn from 'classnames'
import _ from 'lodash'
import { validateValue } from '../../../util/input-check'
import {
  VALIDATION_VALUE_TYPE,
  PRIZE_SETS_TYPE,
  CHALLENGE_PRIZE_TYPE,
  MAX_CHECKPOINT_PRIZE_COUNT,
  DEFAULT_CHECKPOINT_PRIZE,
  DEFAULT_CHECKPOINT_PRIZE_COUNT
} from '../../../config/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import Select from '../../Select'
import { getPrizeType } from '../../../util/prize'

const CheckpointPrizesField = ({ challenge, onUpdateOthers, readOnly }) => {
  const type = PRIZE_SETS_TYPE.CHECKPOINT_PRIZES
  const prizeSets = _.get(challenge, 'prizeSets') || []

  // Determine the currency type from the main challenge prizes (PLACEMENT)
  const mainChallengeCurrencyType = getPrizeType(prizeSets)

  const checkpointPrizeSet = prizeSets.find(p => p.type === type) || { type: PRIZE_SETS_TYPE.CHECKPOINT_PRIZES, prizes: [], 'description': 'Checkpoint Prizes' }
  const number = _.get(checkpointPrizeSet, 'prizes.length') || DEFAULT_CHECKPOINT_PRIZE_COUNT
  const amount = _.get(checkpointPrizeSet, 'prizes.length') ? checkpointPrizeSet.prizes[0].value : DEFAULT_CHECKPOINT_PRIZE

  // update the check point prize with default values if it's not already defined
  // or if the prize type is not CHECKPOINT (e.g., legacy data might have USD/POINT)
  if (_.get(checkpointPrizeSet, 'prizes.length') === 0 || _.get(checkpointPrizeSet, 'prizes[0].type') !== CHALLENGE_PRIZE_TYPE.CHECKPOINT) {
    onChange(number, amount)
  }

  function onChange (number, amount) {
    checkpointPrizeSet.prizes = _.range(validateValue(number, VALIDATION_VALUE_TYPE.INTEGER))
      .map(i => ({
        type: CHALLENGE_PRIZE_TYPE.CHECKPOINT, // Set the prize type to CHECKPOINT
        value: +validateValue(amount, VALIDATION_VALUE_TYPE.INTEGER)
      }))
    // Filter out the old checkpoint prize set and add the updated one
    onUpdateOthers({ field: 'prizeSets', value: [...prizeSets.filter(p => p.type !== type), +number && checkpointPrizeSet].filter(p => p) })
  }

  // Use the main challenge currency type for display symbol
  const symbol = mainChallengeCurrencyType === CHALLENGE_PRIZE_TYPE.POINT ? 'Pts' : '$'

  return (
    <>
      <div className={cn(styles.row)}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor={`checkpointPrizes`} className={styles.checkpointLabel}>Checkpoint Prizes :</label>
        </div>
        {
          readOnly ? (
            <div className={cn(styles.field, styles.col2)}>
              {symbol}{symbol === '$' ? '' : ' '}{amount} for each submission up to {number} submissions
            </div>
          ) : (
            <div className={cn(styles.field, styles.col2)}>
              <div>
                <div className={styles.checkpointPrizeInputContainer}>
                  <div className={styles.checkpointPrizeAmountContainer}>
                    {mainChallengeCurrencyType === CHALLENGE_PRIZE_TYPE.POINT
                      ? <span className={styles.pointsLabel}>Pts</span>
                      : <FontAwesomeIcon className={styles.dollarIcon} icon={faDollarSign} />}
                  </div>
                  <input id='checkpointPrize' name='checkpointPrize' type='text' placeholder='' value={amount} maxLength='7' required onChange={(e) => onChange(number, e.target.value)} />
                </div>
              </div>
              <div>
                for each submission up to&nbsp;&nbsp;
              </div>
              <div className={styles.checkpointSelect}>
                <Select
                  name='submissions'
                  options={_.range(1, MAX_CHECKPOINT_PRIZE_COUNT + 1).map((v) => ({ label: v, value: v }))}
                  value={{ label: number, value: number }}
                  isClearable={false}
                  onChange={e => onChange(e.value, amount)}
                  isDisabled={false}
                />
              </div>
            </div>
          )
        }
      </div>
    </>
  )
}

CheckpointPrizesField.defaultProps = {
  readOnly: false,
  onUpdateOthers: () => {}
}

CheckpointPrizesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func,
  readOnly: PropTypes.bool
}

export default CheckpointPrizesField
