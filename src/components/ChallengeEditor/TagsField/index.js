import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './styles.module.scss'
import { SPECIAL_CHALLENGE_TAGS } from '../../../config/constants'
import _ from 'lodash'

const TagsField = ({ challenge, onUpdateMultiSelect, readOnly }) => {
  const selectedTags = useMemo(() => {
    return (challenge.tags || []).map(
      tag => ({ label: tag, value: tag })
    )
  }, [challenge.tags])

  const selectedValues = useMemo(() => {
    return _.filter(selectedTags, (tag) => SPECIAL_CHALLENGE_TAGS.indexOf(tag.value) < 0)
  }, [selectedTags])

  const existingTags = useMemo(() => {
    return selectedValues.length ? selectedValues.map(item => item.value).join(',') : ''
  }, [selectedValues])

  const selectedSpecialChallengeValues = useMemo(() => {
    return _.filter(selectedTags, (tag) => SPECIAL_CHALLENGE_TAGS.indexOf(tag.value) >= 0)
  }, [challenge.tags])

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='keywords'>Tags{!readOnly && (<span>*</span>)} :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input type='hidden' />
        {readOnly ? (
          <span>{existingTags}</span>
        ) : (
          <Select
            id='track-select'
            isMulti
            simpleValue
            value={selectedValues}
            onChange={(value) => onUpdateMultiSelect([
              ...(value || []),
              ...selectedSpecialChallengeValues
            ], 'tags')}
            isCreatable
          />
        )}
      </div>
    </div>
  )
}

TagsField.defaultProps = {
  readOnly: false
}

TagsField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateMultiSelect: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default TagsField
