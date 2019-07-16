import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './BillingAccount-Field.module.scss'

const BillingAccountField = ({ accounts, onUpdateSelect, challenge }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='type'>Billing Account :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <Select
          name='billingAccount'
          options={accounts}
          value={challenge.billingAccount}
          placeholder='Select an existing account'
          labelKey='name'
          valueKey='name'
          clearable={false}
          onChange={(e) => onUpdateSelect(e)}
          disabled={false}
        />
      </div>
    </div>
  )
}

BillingAccountField.defaultProps = {
  accounts: []
}

BillingAccountField.propTypes = {
  onUpdateSelect: PropTypes.func.isRequired,
  challenge: PropTypes.shape().isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default BillingAccountField
