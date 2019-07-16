import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Type-Field.module.scss'

const TypeField = ({ types, onUpdateSelect, challenge }) => {
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='type'>Type <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <Select
            name='track'
            options={types}
            value={challenge.typeId}
            placeholder='Track Type'
            labelKey='name'
            valueKey='id'
            clearable={false}
            onChange={(e) => onUpdateSelect(e.id, false, 'typeId')}
            disabled={false}
          />
        </div>
      </div>
      { challenge.submitTriggered && !challenge.typeId && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Type is required field
        </div>
      </div> }
    </>
  )
}

TypeField.defaultProps = {
  types: []
}

TypeField.propTypes = {
  // currentType: PropTypes.string.isRequired,
  types: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateSelect: PropTypes.func.isRequired
}

export default TypeField
