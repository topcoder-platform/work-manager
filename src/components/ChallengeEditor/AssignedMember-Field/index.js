/**
 * Field to choose assigned member using autocomplete.
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './AssignedMember-Field.module.scss'
import SelectUserAutocomplete from '../../SelectUserAutocomplete'

const AssignedMemberField = ({
  challenge,
  onAssignSelf,
  onChange,
  assignedMemberDetails,
  readOnly,
  showAssignToMe,
  label
}) => {
  const value = assignedMemberDetails ? {
    // if we know assigned member details, then show user `handle`, otherwise fallback to `userId`
    label: assignedMemberDetails.handle,
    value: assignedMemberDetails.userId + ''
  } : null

  return (
    <div className={styles.row}>
      <div className={cn(
        styles.field,
        styles.col1,
        {
          [styles.showAssignToMe]: showAssignToMe
        }
      )}>
        <label htmlFor='assignedMember'>{label} :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        {readOnly ? (
          value && <div className={styles.readOnlyValue}>{value.label}</div>
        ) : (
          <SelectUserAutocomplete
            value={value}
            onChange={onChange}
          />
        )}
      </div>
      {
        (!readOnly && showAssignToMe)
          ? (<div className={styles.assignSelfField}>
            <a href='#' onClick={(e) => {
              e.preventDefault()
              onAssignSelf()
            }}>Assign to me</a>
          </div>) : null
      }
    </div>
  )
}

AssignedMemberField.defaultProps = {
  assignedMemberDetails: null,
  readOnly: false,
  showAssignToMe: true,
  label: 'Assigned Member'
}

AssignedMemberField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onChange: PropTypes.func,
  assignedMemberDetails: PropTypes.shape(),
  readOnly: PropTypes.bool,
  showAssignToMe: PropTypes.bool,
  onAssignSelf: PropTypes.func,
  label: PropTypes.string
}

export default AssignedMemberField
