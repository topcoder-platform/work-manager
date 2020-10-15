import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './Tags-Field.module.scss'

const TagsField = ({ challengeTags, challenge, onUpdateMultiSelect, readOnly }) => {
  const mapOps = item => ({ label: item.name, value: item.id })
  const existingTags = (challenge.tags && challenge.tags.length) ? challenge.tags.join(',') : ''
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='keywords'>Tags{!readOnly && (<span>*</span>)} :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input type='hidden' />
          {readOnly ? (
            <span>{existingTags}</span>
          ) : (<Select
            id='track-select'
            multi
            options={challengeTags.map(mapOps)}
            simpleValue
            value={existingTags}
            onChange={(value) => onUpdateMultiSelect(value, 'tags')}
          />)}
        </div>
      </div>

      { !readOnly && challenge.submitTriggered && (!challenge.tags || !challenge.tags.length) && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Select at least one tag
        </div>
      </div> }
    </>
  )
}

TagsField.defaultProps = {
  challengeTags: [],
  readOnly: false
}

TagsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  challengeTags: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default TagsField
