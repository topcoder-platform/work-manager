import React from 'react'
import cn from 'classnames'
import PropTypes from 'prop-types'
import styles from './RoundType-Field.module.scss'
import { ROUND_TYPES } from '../../../config/constants'

const RoundTypeField = ({ roundType, onUpdateOthers }) => {
  const isSingleRoundType = !roundType || roundType === ROUND_TYPES.SINGLE_ROUND
  const isTwoRoundsType = roundType === ROUND_TYPES.TWO_ROUNDS

  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='roundType'>Round Type <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <div className={styles.tcRadioButton}>
            <input name='Single round' type='radio' id='single_round' checked={isSingleRoundType} onChange={(e) => e.target.checked && onUpdateOthers({ field: 'roundType', value: ROUND_TYPES.SINGLE_ROUND })} />
            <label htmlFor='single_round'>
              <div>
                {ROUND_TYPES.SINGLE_ROUND}
              </div>
            </label>
          </div>
          <div className={styles.tcRadioButton}>
            <input name='Two rounds' type='radio' id='two_rounds' checked={isTwoRoundsType} onChange={(e) => e.target.checked && onUpdateOthers({ field: 'roundType', value: ROUND_TYPES.TWO_ROUNDS })} />
            <label htmlFor='two_rounds'>
              <div>
                {ROUND_TYPES.TWO_ROUNDS}
              </div>
            </label>
          </div>

        </div>
      </div>

    </>
  )
}

RoundTypeField.propTypes = {
  roundType: PropTypes.string,
  onUpdateOthers: PropTypes.func.isRequired
}

export default RoundTypeField
