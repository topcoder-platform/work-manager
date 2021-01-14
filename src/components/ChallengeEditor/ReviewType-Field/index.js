import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Select from '../../Select'
import cn from 'classnames'
import styles from './ReviewType-Field.module.scss'
import Tooltip from '../../Tooltip'
import { DES_TRACK_ID, REVIEW_TYPES, MESSAGE, QA_TRACK_ID } from '../../../config/constants'

const ReviewTypeField = ({ reviewers, challenge, onUpdateOthers, onUpdateSelect }) => {
  const isDesignChallenge = challenge.trackId === DES_TRACK_ID
  const isQAChallenge = challenge.trackId === QA_TRACK_ID
  const isTask = _.get(challenge, 'task.isTask', false)
  const defaultReviewType = isDesignChallenge ? REVIEW_TYPES.INTERNAL : REVIEW_TYPES.COMMUNITY
  const reviewType = challenge.reviewType ? challenge.reviewType.toUpperCase() : defaultReviewType
  const isCommunity = reviewType === REVIEW_TYPES.COMMUNITY
  const isInternal = reviewType === REVIEW_TYPES.INTERNAL || isTask
  const communityOption = (disabled) => (<div className={styles.tcRadioButton}>
    <input
      name='community'
      type='radio'
      id='community'
      checked={isCommunity}
      disabled={disabled}
      onChange={(e) => e.target.checked && onUpdateOthers({ field: 'reviewType', value: REVIEW_TYPES.COMMUNITY })}
    />
    <label htmlFor='community'>
      <div className={styles.radioButtonLabel}>
        Community
      </div>
      <input type='hidden' />
    </label>
  </div>)
  const internalOption = (disabled) => (<div className={styles.tcRadioButton}>
    <input
      name='internal'
      type='radio'
      id='internal'
      disabled={disabled}
      checked={isInternal}
      onChange={(e) => e.target.checked && onUpdateOthers({ field: 'reviewType', value: REVIEW_TYPES.INTERNAL })}
    />
    <label htmlFor='internal'>
      <div className={styles.radioButtonLabel}>
        Internal
      </div>
      <input type='hidden' />
    </label>
  </div>)
  return (
    <div>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='reviewType'>Reviewer <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <div className={styles.subGroup}>
            <div className={styles.subRow}>
              { isDesignChallenge &&
                <Tooltip content={MESSAGE.COMMUNITY_REVIEW_DISABLED}>
                  { communityOption(true) }
                </Tooltip>
              }
              { !isDesignChallenge && !isTask &&
                communityOption()
              }
            </div>
            <div className={styles.subRow}>
              {
                isQAChallenge &&
                <Tooltip content={MESSAGE.INTERNAL_REVIEW_DISABLED}>
                  { internalOption(true) }
                </Tooltip>
              }
              { !isQAChallenge &&
                internalOption()
              }
              {
                isInternal && (
                  <Select
                    name='reviewer'
                    options={reviewers.map(({ handle }) => ({ label: handle, value: handle }))}
                    placeholder='Select Reviewer'
                    value={{ label: challenge.reviewer, value: challenge.reviewer }}
                    isClearable={false}
                    onChange={(e) => onUpdateSelect(e.value, false, 'reviewer')}
                    isDisabled={false}
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
