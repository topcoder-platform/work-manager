/**
 * Multi-select field for project users.
 *
 * @param {Object} props Component props.
 * @param {Array<string|number>} props.value Selected user ids.
 * @param {Function} props.onChangeValue Callback invoked with selected user ids.
 * @param {string} props.id Field id.
 * @param {Array<Object>} props.projectMembers Project member records with `userId` and optional `handle`.
 * @param {Object} props.loggedInUser Logged in user record.
 * @returns {JSX.Element} User select component.
 *
 * Members without `handle` are excluded from dropdown options. For already
 * selected users missing a handle, this falls back to `userId` for labels.
 */

import React, { useMemo } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Select from '../Select'

const FieldUserAutoComplete = ({
  value,
  onChangeValue,
  id,
  projectMembers,
  loggedInUser
}) => {
  const selectedUsers = useMemo(() => {
    return value.map(item => {
      const selectedUser = _.find(projectMembers, { userId: item }) || {}
      return {
        label: selectedUser.handle || selectedUser.userId || item,
        value: selectedUser.userId || item
      }
    })
  }, [value, projectMembers])

  return (
    <Select
      id={id}
      createOption={false}
      isMulti
      simpleValue
      placeholder='Enter user handles'
      value={selectedUsers}
      onChange={values => {
        onChangeValue((values || []).map(value => value.value))
      }}
      options={(projectMembers || [])
        .filter(member => member.userId !== loggedInUser.userId && member.handle)
        .map(member => ({ value: member.userId, label: member.handle }))}
    />
  )
}

FieldUserAutoComplete.defaultProps = {
  onChangeValue: () => {},
  id: 'user-select',
  value: [],
  projectMembers: [],
  loggedInUser: {}
}

FieldUserAutoComplete.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.oneOfType(PropTypes.string, PropTypes.number)
  ),
  id: PropTypes.string,
  onChangeValue: PropTypes.func,
  projectMembers: PropTypes.arrayOf(PropTypes.object),
  loggedInUser: PropTypes.object
}

export default FieldUserAutoComplete
