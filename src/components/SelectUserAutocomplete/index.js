/**
 * Select field with autocomplete to select a Topcoder Member user.
 * The value of this component is CONTROLLABLE by `value` prop in combination with `onChange` handler.
 *
 * This component is self-sufficient and does API calls by itself without using Redux store.
 */
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import Select from '../Select'
import { suggestProfiles } from '../../services/user'
import _ from 'lodash'
import { AUTOCOMPLETE_MIN_LENGTH, AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../config/constants'

export default function SelectUserAutocomplete (props) {
  const [options, setOptions] = useState([])

  /**
   * Handler for the input which calls API for getting user handle suggestions
   */
  const onInputChange = useCallback(_.debounce((inputValue) => {
    const preparedValue = inputValue.trim()

    // don't request suggestions until user enters the minimal number of characters
    // otherwise there would be too many suggestions and they wouldn't make any sense
    if (preparedValue.length < AUTOCOMPLETE_MIN_LENGTH) {
      setOptions([])
      return
    }

    suggestProfiles(inputValue).then((suggestions) => {
      const suggestedOptions = suggestions.map((user) => ({
        label: user.handle,
        value: user.userId.toString()
      }))
      setOptions(suggestedOptions)
    })
  }, AUTOCOMPLETE_DEBOUNCE_TIME_MS), []) // debounce, to reduce API calling rate

  return (
    <Select
      options={options}
      isMulti={false}
      isClearable
      onInputChange={onInputChange}
      {...props}
    />
  )
}

SelectUserAutocomplete.defaultProps = {
}

SelectUserAutocomplete.propTypes = {
  value: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  }),
  onChange: PropTypes.func
}
