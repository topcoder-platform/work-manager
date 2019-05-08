import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Groups-Field.module.scss'

const GroupsField = ({ groups, onUpdateSelect, challenge }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='type'>Groups :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <Select
          name='group'
          options={groups}
          value={challenge.group}
          placeholder='Select a group'
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

GroupsField.propTypes = {
  onUpdateSelect: PropTypes.func.isRequired,
  challenge: PropTypes.shape().isRequired,
  groups: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default GroupsField
