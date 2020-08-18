/**
 * Field to choose assigned member using autocomplete.
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './AssignedMember-Field.module.scss'
import SelectUserAutocomplete from '../../SelectUserAutocomplete'

const AssignedMemberField = ({ challenge, onChange, assignedMemberDetails, readOnly }) => {
  const value = challenge.task.memberId ? {
    // if we know assigned member details, then show user `handle`, otherwise fallback to `userId`
    label: assignedMemberDetails ? assignedMemberDetails.handle : `User id: ${challenge.task.memberId}`,
    value: challenge.task.memberId
  } : null

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='assignedMember'>Assigned Member :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        {readOnly ? (
          <div className={styles.readOnlyValue}>{value.label}</div>
        ) : (
          <SelectUserAutocomplete
            value={value}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  )
}

AssignedMemberField.defaultProps = {
  assignedMemberDetails: null,
  readOnly: false
}

AssignedMemberField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onChange: PropTypes.func,
  assignedMemberDetails: PropTypes.shape(),
  readOnly: PropTypes.bool
}

export default AssignedMemberField
