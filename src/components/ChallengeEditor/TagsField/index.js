import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Tags-Field.module.scss'

const TagsField = ({ challengeTags, challenge, onUpdateMultiSelect }) => {
  const mapOps = item => ({ label: item.name, value: item.id })
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='keywords'>Tags<span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input type='hidden' />
          <Select
            id='track-select'
            multi
            options={challengeTags.map(mapOps)}
            simpleValue
            value={challenge.tags.join(',')}
            onChange={(value) => onUpdateMultiSelect(value, 'tags')}
          />
        </div>
      </div>

      { challenge.submitTriggered && !challenge.tags.length && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Select at least one tag
        </div>
      </div> }
    </>
  )
}

TagsField.defaultProps = {
  challengeTags: []
}

TagsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  challengeTags: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired
}

export default TagsField
