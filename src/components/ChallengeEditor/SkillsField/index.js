import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import { searchSkills } from '../../../services/skills'
import cn from 'classnames'
import styles from './styles.module.scss'
import { AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../../config/constants'
import _ from 'lodash'

const fetchSkills = _.debounce((inputValue, callback) => {
  searchSkills(inputValue).then(
    (skills) => {
      const suggestedOptions = skills.map((skillItem) => ({
        label: skillItem.name,
        value: skillItem.emsiId
      }))
      return callback(suggestedOptions)
    })
    .catch(() => callback(null))
}, AUTOCOMPLETE_DEBOUNCE_TIME_MS)

const SkillsField = ({ readOnly }) => {
  const [selectedSkills, setSelectedSkills] = useState([])
  const existingSkills = useMemo(() => selectedSkills.map(item => item.label).join(','), [selectedSkills])

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='keywords'>Skills :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input type='hidden' />
        {readOnly ? (
          <span>{existingSkills}</span>
        ) : (
          <Select
            id='skill-select'
            isMulti
            simpleValue
            isAsync
            value={selectedSkills}
            onChange={(value) => setSelectedSkills(value || [])}
            cacheOptions
            loadOptions={fetchSkills}
          />
        )}
      </div>
    </div>
  )
}

SkillsField.defaultProps = {
  readOnly: false
}

SkillsField.propTypes = {
  readOnly: PropTypes.bool
}

export default SkillsField
