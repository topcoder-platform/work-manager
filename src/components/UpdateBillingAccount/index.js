import Select from '../Select'
import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './UpdateBillingAccount.module.scss'
import { SALESFORCE_BILLING_ACCOUNT_LINK } from '../../config/constants'
import { PrimaryButton, OutlineButton } from '../Buttons'
import moment from 'moment-timezone'
const UpdateBillingAccount = ({
  billingAccounts,
  isBillingAccountsLoading,
  isBillingAccountLoading,
  isBillingAccountLoadingFailed,
  billingStartDate,
  billingEndDate,
  isBillingAccountExpired,
  isAdmin,
  currentBillingAccount,
  projectId,
  updateProject,
  isMemberOfActiveProject,
  isManager
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedBillingAccount, setSelectedBillingAccount] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleEditClick = () => {
    let billingAccount = billingAccounts.find(
      (billingAccount) => billingAccount.value === currentBillingAccount
    )
    // if option is not on the list, then create such option
    // this is needed if the user doesn't have access to the selected account
    if (!billingAccount && currentBillingAccount) {
      billingAccount = {
        label: `<Assigned Account>(${currentBillingAccount}) ${
          billingEndDate
            ? ' - ' + moment(billingEndDate).format('MMM DD, YYYY')
            : ''
        }`,
        value: currentBillingAccount
      }
      billingAccounts.push(billingAccount)
    }
    setSelectedBillingAccount(billingAccount)
    setIsEditing(true)
  }

  const handleChange = (value) => {
    setSelectedBillingAccount(value)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedBillingAccount(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateProject(projectId, {
      billingAccountId: selectedBillingAccount
        ? selectedBillingAccount.value
        : null
    })
    setIsSaving(false)
    setIsEditing(false)
    setSelectedBillingAccount(null)
  }

  const placeholder =
    billingAccounts && billingAccounts.length > 0
      ? 'Select billing account'
      : 'No Billing Account Available'

  const renderBillingAccount = () => {
    return (
      <Fragment>
        <div className={cn(styles.field, styles.input1)}>
          <label htmlFor='billingAccount'>Choose a Billing Account :</label>
        </div>
        <div className={styles.buttonContainer}>
          <div className={cn(styles.field, styles.input2)}>
            <Select
              name='billingAccount'
              placeholder={placeholder}
              onChange={handleChange}
              options={billingAccounts}
              value={selectedBillingAccount}
              isLoading={isBillingAccountsLoading}
              isClearable
              isDisabled={billingAccounts.length === 0}
              showDropdownIndicator
            />
          </div>
          <PrimaryButton
            onClick={handleSave}
            text={'Save'}
            type={'info'}
            isLoading={isSaving}
            disabled={isSaving}
          />
          <OutlineButton
            onClick={handleCancel}
            text={'Cancel'}
            type={'info'}
            disabled={isSaving}
          />
        </div>
        {selectedBillingAccount && (
          <div className={styles.manageBillingAccountLinkWrapper}>
            <a
              className={styles.manageBillingAccountLink}
              href={`${SALESFORCE_BILLING_ACCOUNT_LINK}${selectedBillingAccount.value}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              Manage the billing account in Salesforce
            </a>
          </div>
        )}
      </Fragment>
    )
  }
  if (isBillingAccountLoading) {
    return <></>
  }
  return !isEditing ? (
    <Fragment>
      {!isBillingAccountLoading &&
        isBillingAccountLoadingFailed &&
        !currentBillingAccount && (
        <Fragment>
          <span className={styles.error}>No Billing Account set</span>
          {(isAdmin || (isManager && isMemberOfActiveProject)) && (
            <span>
              {' '}
              ({' '}
              <a href='javascript:void(0)' onClick={handleEditClick}>
                Select Billing Account
              </a>{' '}
              )
            </span>
          )}
        </Fragment>
      )}
      {!isBillingAccountLoading &&
        !isBillingAccountLoadingFailed &&
        currentBillingAccount !== null && (
        <Fragment>
          <span className={styles.title}>Billing Account: </span>
          <span
            className={
              isBillingAccountExpired ? styles.inactive : styles.active
            }
          >
            {isBillingAccountExpired ? 'INACTIVE' : 'ACTIVE'}
          </span>{' '}
          {(isAdmin || (isManager && isMemberOfActiveProject)) && (
            <span>
              {' '}
              ({' '}
              <a href='javascript:void(0)' onClick={handleEditClick}>
                Edit Billing Account
              </a>{' '}
              )
            </span>
          )}
          <div>
            <span className={styles.title}>Start Date:</span>{' '}
            {billingStartDate} &nbsp;{' '}
            <span className={styles.title}>End Date:</span> {billingEndDate}{' '}
          </div>
        </Fragment>
      )}
    </Fragment>
  ) : (
    renderBillingAccount()
  )
}

UpdateBillingAccount.propTypes = {
  billingAccounts: PropTypes.arrayOf(PropTypes.object),
  isBillingAccountsLoading: PropTypes.bool,
  isBillingAccountLoading: PropTypes.bool,
  isBillingAccountLoadingFailed: PropTypes.bool,
  billingStartDate: PropTypes.string,
  billingEndDate: PropTypes.string,
  currentBillingAccount: PropTypes.number,
  isBillingAccountExpired: PropTypes.bool,
  isAdmin: PropTypes.bool,
  projectId: PropTypes.number,
  updateProject: PropTypes.func.isRequired,
  isMemberOfActiveProject: PropTypes.bool.isRequired,
  isManager: PropTypes.bool.isRequired
}

export default UpdateBillingAccount
