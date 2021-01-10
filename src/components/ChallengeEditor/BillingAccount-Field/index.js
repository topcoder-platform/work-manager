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
          options={accounts.map(account => ({ label: account.name, value: account.name, name: account.name }))}
          value={{ label: challenge.billingAccount, value: challenge.billingAccount }}
          placeholder='Select an existing account'
          isClearable={false}
          onChange={(e) => onUpdateSelect(e)}
          isDisabled={false}
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
