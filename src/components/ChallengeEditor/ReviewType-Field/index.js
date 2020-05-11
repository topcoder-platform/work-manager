import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './ReviewType-Field.module.scss'

const ReviewTypeField = ({ reviewers, challenge, onUpdateOthers, onUpdateSelect }) => {
  const reviewType = challenge.reviewType ? challenge.reviewType.toLowerCase() : 'community'
  const isCommunity = reviewType === 'community'
  const isInternal = reviewType === 'internal'
  return (
    <div>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='reviewType'>Review Type <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <div className={styles.subGroup}>
            <div className={styles.subRow}>
              <div className={styles.tcRadioButton}>
                <input
                  name='community'
                  type='radio'
                  id='community'
                  checked={isCommunity}
                  onChange={(e) => e.target.checked && onUpdateOthers({ field: 'reviewType', value: 'community' })}
                />
                <label htmlFor='community'>
                  <div className={styles.radioButtonLabel}>
                    Community
                  </div>
                  <input type='hidden' />
                </label>
              </div>
            </div>
            <div className={styles.subRow}>
              <div className={styles.tcRadioButton}>
                <input
                  name='internal'
                  type='radio'
                  id='internal'
                  checked={isInternal}
                  onChange={(e) => e.target.checked && onUpdateOthers({ field: 'reviewType', value: 'internal' })}
                />
                <label htmlFor='internal'>
                  <div className={styles.radioButtonLabel}>
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
      {challenge.submitTriggered && isInternal && !challenge.reviewer && <div className={cn(styles.field, styles.row, styles.error)}>
        Select a reviewer
      </div>}
    </div>
  )
}

ReviewTypeField.defaultProps = {
  reviewers: []
}

ReviewTypeField.propTypes = {
  reviewers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired,
  onUpdateSelect: PropTypes.func.isRequired
}

export default ReviewTypeField
