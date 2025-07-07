/* Component to render select user field */

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
      const selectedUser = _.find(projectMembers, { userId: item })
      return {
        label: selectedUser.handle,
        value: selectedUser.userId
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
        .filter(member => member.userId !== loggedInUser.userId)
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
