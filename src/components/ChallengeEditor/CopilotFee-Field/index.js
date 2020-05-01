import React from 'react'
import styles from './CopilotFee-Field.module.scss'
import cn from 'classnames'
import PropTypes from 'prop-types'
import { validateValue } from '../../../util/input-check'
import { VALIDATION_VALUE_TYPE } from '../../../config/constants'

const CopilotFeeField = ({ challenge, onUpdateOthers }) => {
  const type = 'Copilot payment'
  const copilotFee = challenge.prizeSets.find(p => p.type === type) || { type, prizes: [{ type, value: 0 }] }
  const value = copilotFee.prizes[0].value

  function onChange (e) {
    const value = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER)
    copilotFee.prizes = [{ type, value }]
    onUpdateOthers({ field: 'prizeSets', value: [...challenge.prizeSets.filter(p => p.type !== type), copilotFee] })
  }

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='copilotFee'>Copilot Fee :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input id='copilotFee' name='copilotFee' type='text' placeholder='' value={value} maxLength='200' required onChange={onChange} />
      </div>
    </div>
  )
}

CopilotFeeField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default CopilotFeeField
