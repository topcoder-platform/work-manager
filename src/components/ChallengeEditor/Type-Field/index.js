import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Type-Field.module.scss'

const TypeField = ({ types, onUpdateSelect, challenge, disabled }) => {
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='type'>Work Format <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2, { [styles.disabled]: disabled })}>
          <Select
            name='track'
            options={_.filter(types, t => t.isActive && t.track === challenge.track)}
            value={challenge.typeId}
            placeholder='Work Format'
            labelKey='name'
            valueKey='id'
            clearable={false}
            onChange={(e) => onUpdateSelect(e.id, false, 'typeId')}
            disabled={disabled}
          />
        </div>
      </div>
      { challenge.submitTriggered && !challenge.typeId && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Work Format is required field
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
  track: PropTypes.string,
  types: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default TypeField
