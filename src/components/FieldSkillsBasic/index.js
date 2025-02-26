import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import Select from '../Select'
import { searchSkills } from '../../services/skills'
import { AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../config/constants'
import _ from 'lodash'

const fetchSkills = _.debounce((inputValue, callback) => {
  searchSkills(inputValue)
    .then(skills => {
      const suggestedOptions = skills.map(skillItem => ({
        label: skillItem.name,
        value: skillItem.id
      }))
      return callback(suggestedOptions)
    })
    .catch(() => {
      return callback(null)
    })
}, AUTOCOMPLETE_DEBOUNCE_TIME_MS)

const FieldSkillsBasic = ({ value, onChangeValue, id, placeholder }) => {
  const selectedSkills = useMemo(
    () =>
      value.map(skill => ({
        label: skill.name,
        value: skill.skillId
      })),
    [value]
  )

  return (
    <Select
      id={id}
      isMulti
      simpleValue
      isAsync
      value={selectedSkills}
      onChange={values => {
        onChangeValue(
          (values || []).map(value => ({
            name: value.label,
            skillId: value.value
          }))
        )
      }}
      cacheOptions
      loadOptions={fetchSkills}
      placeholder={placeholder}
    />
  )
}

FieldSkillsBasic.defaultProps = {
  onChangeValue: () => {},
  id: 'skill-select',
  value: [],
  placeholder: ''
}

FieldSkillsBasic.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape()),
  id: PropTypes.string,
  onChangeValue: PropTypes.func,
  placeholder: PropTypes.string
}

export default FieldSkillsBasic
