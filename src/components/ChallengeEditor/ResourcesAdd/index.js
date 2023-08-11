import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './styles.module.scss'
import { PrimaryButton } from '../../Buttons'
import Modal from '../../Modal'
import AssignedMemberField from '../AssignedMember-Field'
import Select from '../../Select'
import _ from 'lodash'

const theme = {
  container: styles.modalContainer
}
const roles = [
  'Reviewer',
  'Iterative Reviewer',
  'Observer',
  'Client Manager',
  'Primary Screener',
  'Final Reviewer',
  'Manager',
  'Copilot',
  'Checkpoint Screener',
  'Checkpoint Reviewer',
  'Specification Submitter',
  'Specification Reviewer'
]

const ResourcesAdd = ({
  challenge,
  onClose,
  createResource,
  loggedInUser,
  resourceRoles
}) => {
  const [assignedMemberDetails, setAssignedMemberDetails] = useState(null)
  const [isCreatingResource, setIsCreatingResource] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  const roleOptions = useMemo(
    () =>
      roles.map(r => {
        const matchRole = _.find(resourceRoles, { name: r })
        return {
          label: r,
          value: matchRole ? matchRole.id : null
        }
      }),
    [resourceRoles]
  )
  return (
    <Modal theme={theme} onCancel={onClose}>
      <div className={cn(styles.contentContainer, styles.confirm)}>
        <div className={styles.title}>Add Resource</div>
        <div>
          <AssignedMemberField
            challenge={challenge}
            assignedMemberDetails={assignedMemberDetails}
            onChange={option => {
              if (option && option.value) {
                setAssignedMemberDetails({
                  handle: option.label,
                  userId: parseInt(option.value, 10)
                })
              } else {
                setAssignedMemberDetails(null)
              }
            }}
            showAssignToMe={false}
            label='Member'
          />

          <div className={styles.fieldContainer}>
            <div className={cn(styles.field, styles.input1)}>
              <label htmlFor='status'>Role :</label>
            </div>
            <div className={cn(styles.selectField)}>
              <Select
                name='role'
                options={roleOptions}
                placeholder='Role'
                value={selectedRole}
                onChange={e => {
                  setSelectedRole(e || null)
                }}
                isClearable
              />
            </div>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <div className={styles.buttonSizeA}>
            <PrimaryButton
              text='Add'
              type={'info'}
              disabled={
                !selectedRole || !assignedMemberDetails || isCreatingResource
              }
              onClick={async () => {
                setIsCreatingResource(true)
                await createResource(
                  challenge.id,
                  selectedRole.value,
                  assignedMemberDetails.handle,
                  assignedMemberDetails.email,
                  assignedMemberDetails.userId
                )
                setIsCreatingResource(false)
                onClose()
              }}
            />
          </div>
          <div className={styles.buttonSizeA}>
            <PrimaryButton text='Cancel' type={'info'} onClick={onClose} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

ResourcesAdd.propTypes = {
  challenge: PropTypes.object,
  onClose: PropTypes.func,
  createResource: PropTypes.func,
  loggedInUser: PropTypes.object,
  resourceRoles: PropTypes.arrayOf(PropTypes.object)
}

export default ResourcesAdd
