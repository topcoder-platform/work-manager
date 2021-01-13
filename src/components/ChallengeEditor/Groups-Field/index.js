import React from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from '../../Select/AsyncSelect'
import cn from 'classnames'
import styles from './Groups-Field.module.scss'
import _ from 'lodash'
import { fetchGroups } from '../../../services/challenges'
import { AUTOCOMPLETE_MIN_LENGTH, AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../../config/constants'

const GroupsField = ({ onUpdateMultiSelect, challenge }) => {
  const [groups, setGroups] = React.useState([])

  const onInputChange = React.useCallback(_.debounce(async (inputValue, callback) => {
    if (!inputValue) return
    const preparedValue = inputValue.trim()
    if (preparedValue.length < AUTOCOMPLETE_MIN_LENGTH) {
      return []
    }
    const data = await fetchGroups({ name: inputValue })
    const suggestions = data.map(suggestion => ({
      label: suggestion.name,
      value: suggestion.id
    }))
    callback && callback(suggestions)
  }, AUTOCOMPLETE_DEBOUNCE_TIME_MS), [])

  React.useEffect(() => {
    Promise.all(
      challenge.groups
        .map(group => fetchGroups({}, `/${group}`))
    ).then(groups => {
      setGroups(groups.map(group => ({
        label: group.name,
        value: group.id
      })))
    }).catch(console.error)
  }, [])

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='type'>Groups :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <AsyncSelect
          name='group'
          isMulti
          loadOptions={(inputValue, callback) => {
            onInputChange(inputValue, callback)
          }}
          simpleValue
          value={groups}
          placeholder='Select groups'
          onChange={(e) => {
            onUpdateMultiSelect(e, 'groups')
            setGroups(e)
          }}
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
