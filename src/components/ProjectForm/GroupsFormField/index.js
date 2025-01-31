import React, { useCallback } from 'react'
import { debounce, map } from 'lodash'
import PropTypes from 'prop-types'
import Select from '../../Select'
import { fetchGroups as fetchGroupsApi } from '../../../services/challenges'
import { AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../../config/constants'
import { useMapSelectedGroups } from './use-map-selected-groups.hook'

/**
 * Search & fetch groups from api, filtering by group name
 */
const fetchGroups = debounce((inputValue, callback) => {
  fetchGroupsApi({ name: inputValue })
    .then(groups => {
      const suggestedOptions = groups.map(group => ({
        label: group.name,
        value: group.id
      }))
      return callback(suggestedOptions)
    })
    .catch(() => {
      return callback(null)
    })
}, AUTOCOMPLETE_DEBOUNCE_TIME_MS)

/**
 * Component to handle project groups
 */
const GroupsFormField = ({ value, name, onBlur, onChange, id, placeholder, ref }) => {
  const selectedGroups = useMapSelectedGroups(value)

  const handleChange = useCallback((values) => {
    onChange({ target: { name, value: map(values, 'value') } })
  }, [])

  return (
    <Select
      id={id}
      ref={ref}
      isMulti
      onBlur={onBlur}
      simpleValue
      isAsync
      name={name}
      value={selectedGroups}
      onChange={handleChange}
      cacheOptions
      loadOptions={fetchGroups}
      placeholder={placeholder}
    />
  )
}

GroupsFormField.defaultProps = {
  onChange: () => {},
  onBlur: () => {},
  id: 'group-select',
  value: [],
  name: '',
  ref: undefined,
  placeholder: ''
}

GroupsFormField.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape()),
  id: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  name: PropTypes.string,
  ref: PropTypes.ref,
  placeholder: PropTypes.string
}

export default GroupsFormField
