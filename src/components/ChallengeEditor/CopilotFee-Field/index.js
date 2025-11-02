import React from 'react'
import styles from './CopilotFee-Field.module.scss'
import cn from 'classnames'
import PropTypes from 'prop-types'
import { validateValue } from '../../../util/input-check'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { VALIDATION_VALUE_TYPE, PRIZE_SETS_TYPE, CHALLENGE_PRIZE_TYPE } from '../../../config/constants'

class CopilotFeeField extends React.Component {
  constructor (props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange (e) {
    const { challenge, onUpdateOthers } = this.props
    const type = PRIZE_SETS_TYPE.COPILOT_PAYMENT
    const copilotFee = (challenge.prizeSets && challenge.prizeSets.find(p => p.type === type)) || { type, prizes: [{ type: CHALLENGE_PRIZE_TYPE.USD, value: 0 }] }
    let value = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER)
    if (parseInt(value) > 1000000) {
      value = '1000000'
    }
    copilotFee.prizes = [{ type: CHALLENGE_PRIZE_TYPE.USD, value }]
    onUpdateOthers({ field: 'prizeSets', value: [...challenge.prizeSets.filter(p => p.type !== type), copilotFee] })
  }

  render () {
    const { challenge, readOnly } = this.props
    const type = PRIZE_SETS_TYPE.COPILOT_PAYMENT
    const copilotFee = (challenge.prizeSets && challenge.prizeSets.find(p => p.type === type)) || { type, prizes: [{ type: CHALLENGE_PRIZE_TYPE.USD, value: 0 }] }
    const value = copilotFee.prizes[0].value

    return (
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='copilotFee'>Copilot Fee :</label>
        </div>
        {readOnly ? (
          <span>${value}</span>
        ) : (
          <div className={cn(styles.field, styles.col2)}>
            <div className={styles.selectContainer}>
              <FontAwesomeIcon className={styles.icon} icon={faDollarSign} />
            </div>
            <input id='copilotFee' name='copilotFee' type='text' placeholder='' value={value} maxLength='7' required onChange={this.onChange} />
          </div>
        )}
      </div>
    )
  }
}

CopilotFeeField.defaultProps = {
  onUpdateOthers: () => {},
  readOnly: false
}

CopilotFeeField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func,
  readOnly: PropTypes.bool
}

export default CopilotFeeField
