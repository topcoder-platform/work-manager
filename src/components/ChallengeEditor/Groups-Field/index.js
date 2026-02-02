import React from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from '../../Select/AsyncSelect'
import Modal from '../../Modal'
import cn from 'classnames'
import styles from './Groups-Field.module.scss'
import _ from 'lodash'
import { fetchGroups } from '../../../services/challenges'
import { AUTOCOMPLETE_MIN_LENGTH, AUTOCOMPLETE_DEBOUNCE_TIME_MS } from '../../../config/constants'
import GroupsContainer from '../../../containers/Groups'

const GroupsField = ({ onUpdateMultiSelect, challenge }) => {
  const [groups, setGroups] = React.useState([])
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = React.useState(false)

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

  const openCreateGroupModal = React.useCallback(() => {
    setIsCreateGroupModalOpen(true)
  }, [])

  const closeCreateGroupModal = React.useCallback(() => {
    setIsCreateGroupModalOpen(false)
  }, [])

  const handleGroupCreated = React.useCallback((createdGroup) => {
    if (!createdGroup || !createdGroup.id) {
      return
    }

    const newGroupOption = {
      label: createdGroup.name,
      value: createdGroup.id
    }

    setGroups((prevGroups) => {
      const currentGroups = Array.isArray(prevGroups) ? prevGroups : []
      const exists = currentGroups.some((group) => group.value === newGroupOption.value)
      const updatedGroups = exists ? currentGroups : [...currentGroups, newGroupOption]
      onUpdateMultiSelect(updatedGroups, 'groups')
      return updatedGroups
    })
  }, [onUpdateMultiSelect])

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='type'>Groups :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <div className={styles.selectWrapper}>
          <AsyncSelect
            name='group'
            isMulti
            loadOptions={(inputValue, callback) => {
              onInputChange(inputValue, callback)
            }}
            simpleValue
            value={groups}
            placeholder='Search groups'
            onChange={(e) => {
              onUpdateMultiSelect(e, 'groups')
              setGroups(e)
            }}
          />
        </div>
        <button
          type='button'
          className={styles.createGroupLink}
          onClick={openCreateGroupModal}
        >
          Create Group
        </button>
      </div>
      {isCreateGroupModalOpen && (
        <Modal onCancel={closeCreateGroupModal}>
          <div className={styles.createGroupModal}>
            <GroupsContainer
              onCreateSuccess={handleGroupCreated}
              onSuccessModalClose={closeCreateGroupModal}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}

GroupsField.propTypes = {
  onUpdateMultiSelect: PropTypes.func.isRequired,
  challenge: PropTypes.shape().isRequired
}

export default GroupsField
