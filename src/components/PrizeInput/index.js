import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { CHALLENGE_PRIZE_TYPE } from '../../config/constants'

import styles from './PrizeInput.module.scss'

const PrizeInput = ({ prize, onUpdateInput, isFocus, index, prizeType }) => {
  const activePrizeType = prize.type || prizeType || CHALLENGE_PRIZE_TYPE.USD
  const isPoints = activePrizeType === CHALLENGE_PRIZE_TYPE.POINT
  return (
    <div className={styles.container}>
      <div className={styles.selectContainer}>
        {isPoints ? (
          <span className={styles.pointsLabel}>Pts</span>
        ) : (
          <FontAwesomeIcon className={styles.icon} icon={faDollarSign} />
        )}
      </div>

      <input
        id='amount' name='amount' autoFocus={isFocus} type='text' placeholder='Prize'
        value={prize.value} maxLength='7' onChange={e => onUpdateInput(e.target.value, index)} />
    </div>
  )
}

PrizeInput.propTypes = {
  prize: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isFocus: PropTypes.bool,
  prizeType: PropTypes.string
}

export default PrizeInput
