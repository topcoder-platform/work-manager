import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Type-Field.module.scss'

const TypeField = ({ types, onUpdateSelect, challenge, disabled }) => {
  types = _.sortBy(types, ['name'])
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='type'>Challenge Type <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2, { [styles.disabled]: disabled })}>
          <Select
            name='track'
            options={_.filter(types, t => t.isActive).map(type => ({ label: type.name, value: type.id }))}
            placeholder='Challenge Type'
            isClearable={false}
            onChange={(e) => onUpdateSelect(e.value, false, 'typeId')}
            isDisabled={disabled}
          />
        </div>
      </div>
      { challenge.submitTriggered && !challenge.typeId && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Challenge Type is required field
        </div>
      </div> }
    </>
  )
}

TypeField.defaultProps = {
  types: [],
  disabled: false
}

TypeField.propTypes = {
  // currentType: PropTypes.string.isRequired,
  types: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default TypeField
