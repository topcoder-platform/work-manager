import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Groups-Field.module.scss'

const GroupsField = ({ groups, onUpdateMultiSelect, challenge }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='type'>Groups :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <Select
          name='group'
          multi
          options={groups.map(g => ({ label: g.name, value: g.name }))}
          simpleValue
          value={challenge.groups.join(',')}
          placeholder='Select groups'
          onChange={(e) => onUpdateMultiSelect(e, 'groups')}
        />
      </div>
    </div>
  )
}

GroupsField.defaultProps = {
  groups: []
}

GroupsField.propTypes = {
  onUpdateMultiSelect: PropTypes.func.isRequired,
  challenge: PropTypes.shape().isRequired,
  groups: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default GroupsField
