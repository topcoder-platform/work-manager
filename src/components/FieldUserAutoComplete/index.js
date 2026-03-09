/**
 * Multi-select field for project users.
 *
 * @param {Object} props Component props.
 * @param {Array<string|number>} props.value Selected user ids.
 * @param {Function} props.onChangeValue Callback invoked with selected user ids.
 * @param {string} props.id Field id.
 * @param {Array<Object>} props.projectMembers Project member records with `userId`
 *   and optional `handle` / `email`.
 * @returns {JSX.Element} User select component.
 *
 * Every project member with a `userId` is included in the dropdown. Labels
 * fall back from `handle` to `email` to `userId`, and selected users are
 * resolved by normalized `userId` matching so string/number ids both work.
 */

import React, { useMemo } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Select from '../Select'
import { getProjectMemberByUserId } from '../../util/tc'

function getMemberOptionLabel (member, fallbackUserId) {
  const fallbackValue = _.isNil(fallbackUserId) ? '' : `${fallbackUserId}`.trim()

  return (
    _.get(member, 'handle') ||
    _.get(member, 'email') ||
    (_.isNil(_.get(member, 'userId')) ? '' : `${member.userId}`.trim()) ||
    fallbackValue
  )
}

const FieldUserAutoComplete = ({
  value,
  onChangeValue,
  id,
  projectMembers
}) => {
  const selectedUsers = useMemo(() => {
    return value.map(item => {
      const selectedUser = getProjectMemberByUserId(projectMembers, item) || {}
      return {
        label: getMemberOptionLabel(selectedUser, item),
        value: selectedUser.userId || item
      }
    })
  }, [value, projectMembers])

  const memberOptions = useMemo(() => {
    return _.uniqBy(
      (projectMembers || [])
        .map(member => {
          if (_.isNil(member.userId) || `${member.userId}`.trim().length === 0) {
            return null
          }

          return {
            value: member.userId,
            label: getMemberOptionLabel(member)
          }
        })
        .filter(Boolean),
      option => `${option.value}`.trim()
    )
  }, [projectMembers])

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
      options={memberOptions}
    />
  )
}

FieldUserAutoComplete.defaultProps = {
  onChangeValue: () => {},
  id: 'user-select',
  value: [],
  projectMembers: []
}

FieldUserAutoComplete.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  id: PropTypes.string,
  onChangeValue: PropTypes.func,
  projectMembers: PropTypes.arrayOf(PropTypes.object)
}

export default FieldUserAutoComplete
