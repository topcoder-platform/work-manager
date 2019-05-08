import React from 'react'
import styles from './CopilotFee-Field.module.scss'
import cn from 'classnames'
import PropTypes from 'prop-types'

const CopilotFeeField = ({ challenge, onUpdateInput }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='copilotFee'>Copilot Fee :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input id='copilotFee' name='copilotFee' type='text' placeholder='' value={challenge.copilotFee} maxLength='200' required onChange={onUpdateInput} />
      </div>
    </div>
  )
}

CopilotFeeField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired
}

export default CopilotFeeField
