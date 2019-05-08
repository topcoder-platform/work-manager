import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Type-Field.module.scss'

const TypeField = ({ types, onUpdateSelect, challenge }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='type'>Type <span>*</span> :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <Select
          name='trackType'
          options={types}
          value={challenge.trackType}
          placeholder='Track Type'
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

TypeField.propTypes = {
  // currentType: PropTypes.string.isRequired,
  types: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func.isRequired
}

export default TypeField
