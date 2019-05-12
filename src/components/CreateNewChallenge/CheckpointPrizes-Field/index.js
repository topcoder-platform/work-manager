import React from 'react'
import PropTypes from 'prop-types'
import styles from './CheckpointPrizes-Field.module.scss'
import cn from 'classnames'

const CheckpointPrizesField = ({ challenge, onUpdateInput, removeCheckpointPrizesPanel }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='checkpointPrizes'>Checkpoint Prizes :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input id='checkNumber' name='checkNumber' type='text' placeholder='Number of checkpoint prizes' value={challenge.checkpointPrizes.checkNumber} maxLength='200' onChange={(e) => onUpdateInput(e, true, 'checkpointPrizes')} />
        <input id='checkAmount' name='checkAmount' type='text' placeholder='Amount per prizes' value={challenge.checkpointPrizes.checkAmount} maxLength='200' onChange={(e) => onUpdateInput(e, true, 'checkpointPrizes')} />
      </div>
    </div>
  )
}

CheckpointPrizesField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired,
  removeCheckpointPrizesPanel: PropTypes.func.isRequired
}

export default CheckpointPrizesField
