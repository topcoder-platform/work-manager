import React from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from '../../Select/AsyncSelect'
import cn from 'classnames'
import styles from './Groups-Field.module.scss'
import _ from 'lodash'
import { axiosInstance } from '../../../services/axiosWithAuth'
import { AUTOCOMPLETE_MIN_LENGTH, AUTOCOMPLETE_DEBOUNCE_TIME_MS, GROUPS_API_URL } from '../../../config/constants'

const GroupsField = ({ onUpdateMultiSelect, challenge }) => {
  async function fetchGroups (name) {
    if (!name) return []
    console.log('url')
    console.log(GROUPS_API_URL)
    const url = `${GROUPS_API_URL}?name=${name}`
    return axiosInstance.get(url)
  }

  const onInputChange = React.useCallback(_.debounce(async (inputValue, callback) => {
    if (!inputValue) return
    const preparedValue = inputValue.trim()
    if (preparedValue.length < AUTOCOMPLETE_MIN_LENGTH) {
      return []
    }
    const { data } = await fetchGroups(inputValue)
    const suggestions = data.map(suggestion => ({
      label: suggestion.name,
      value: suggestion.id
    }))
    callback && callback(suggestions)
  }, AUTOCOMPLETE_DEBOUNCE_TIME_MS), [])

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='type'>Groups :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <AsyncSelect
          name='group'
          multi
          loadOptions={(inputValue, callback) => {
            onInputChange(inputValue, callback)
          }}
          simpleValue
          value={challenge.groups.join(',')}
          placeholder='Select groups'
          onChange={(e) => onUpdateMultiSelect(e, 'groups')}
        />
      </div>
    </div>
  )
}

GroupsField.propTypes = {
  onUpdateMultiSelect: PropTypes.func.isRequired,
  challenge: PropTypes.shape().isRequired
}

export default GroupsField
