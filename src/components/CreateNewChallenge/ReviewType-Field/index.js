import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './ReviewType-Field.module.scss'

const ReviewTypeField = ({ reviewers, challenge, onUpdateCheckbox, onUpdateSelect }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='reviewType'>Review Type :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <div className={styles.subGroup}>
          <div className={styles.subRow}>
            <div className={styles.tcCheckbox}>
              <input
                name='community'
                type='checkbox'
                id='community'
                checked={challenge.reviewType.community}
                onChange={(e) => onUpdateCheckbox('community', e.target.checked, 'reviewType', -1, false)}
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
                checked={challenge.reviewType.internal}
                onChange={(e) => onUpdateCheckbox('internal', e.target.checked, 'reviewType')}
              />
              <label htmlFor='internal'>
                <div className={styles.checkboxLabel}>
                  Internal
                </div>
                <input type='hidden' />
              </label>
            </div>
            {
              !challenge.reviewType.community && (
                <Select
                  name='reviewer'
                  options={reviewers}
                  placeholder='Select Reviewer'
                  labelKey='name'
                  valueKey='name'
                  clearable={false}
                  value={challenge.reviewType.reviewer}
                  onChange={(e) => onUpdateSelect(e, true, 'reviewType')}
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
  onUpdateCheckbox: PropTypes.func.isRequired,
  onUpdateSelect: PropTypes.func.isRequired
}

export default ReviewTypeField
