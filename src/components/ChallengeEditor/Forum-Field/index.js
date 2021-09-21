import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Forum-Field.module.scss'

const ForumField = ({ types, onSelectForum, challenge, hasForum, disabled }) => {
  disabled = true
  if (challenge.name && challenge.typeId) {
    disabled = false
  }
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='type'>Forum Dicussion :</label>
        </div>
        <div className={cn(styles.field, styles.col2, { [styles.disabled]: disabled })}>
          <Select
            name='forum'
            options={types.map(type => ({ label: type.name, value: type.id }))}
            isClearable={false}
            onChange={(e) => onSelectForum(e.value)}
            isDisabled={disabled}
            value={hasForum ? { label: 'On', value: true } : { label: 'Off', value: false }}
          />
        </div>
      </div>
    </>
  )
}

ForumField.defaultProps = {
  types: [{ name: 'On', id: true }, { name: 'Off', id: false }],
  hasForum: false,
  disabled: false
}

ForumField.propTypes = {
  // currentType: PropTypes.string.isRequired,
  types: PropTypes.arrayOf(PropTypes.shape()),
  challenge: PropTypes.shape().isRequired,
  onSelectForum: PropTypes.func.isRequired,
  hasForum: PropTypes.bool,
  disabled: PropTypes.bool
}

export default ForumField
