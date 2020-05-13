import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'

import styles from './PrizeInput.module.scss'

const PrizeInput = ({ prize, onUpdateInput, isFocus, index }) => {
  return (
    <div className={styles.container}>
      <div className={styles.selectContainer}>
        <FontAwesomeIcon className={styles.icon} icon={faDollarSign} />
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
  isFocus: PropTypes.bool
}

export default PrizeInput
