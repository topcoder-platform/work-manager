import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './ReviewType-Field.module.scss'

const ReviewTypeField = ({ reviewers, challenge, onUpdateOthers, onUpdateSelect }) => {
  const isCommunity = challenge.reviewType === 'community'
  const isInternal = challenge.reviewType === 'internal'
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='reviewType'>Review Type <span>*</span> :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <div className={styles.subGroup}>
          <div className={styles.subRow}>
            <div className={styles.tcCheckbox}>
              <input
                name='community'
                type='checkbox'
                id='community'
                checked={isCommunity}
                onChange={(e) => e.target.checked && onUpdateOthers({ field: 'reviewType', value: 'community' })}
              />
              <label htmlFor='community'>
                <div className={styles.checkboxLabel}>
                  Community
                </div>
                <input type='hidden' />
              </label>
            </div>
          </div>
          <div className={styles.subRow}>
            <div className={styles.tcCheckbox}>
              <input
                name='internal'
                type='checkbox'
                id='internal'
                checked={isInternal}
                onChange={(e) => e.target.checked && onUpdateOthers({ field: 'reviewType', value: 'internal' })}
              />
              <label htmlFor='internal'>
                <div className={styles.checkboxLabel}>
                  Internal
                </div>
                <input type='hidden' />
              </label>
            </div>
            {
              isInternal && (
                <Select
                  name='reviewer'
                  options={reviewers}
                  placeholder='Select Reviewer'
                  labelKey='handle'
                  valueKey='handle'
                  clearable={false}
                  value={challenge.reviewer}
                  onChange={(e) => onUpdateSelect(e.handle, false, 'reviewer')}
                  disabled={false}
                />
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

ReviewTypeField.propTypes = {
  reviewers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired,
  onUpdateSelect: PropTypes.func.isRequired
}

export default ReviewTypeField
