import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeName-Field.module.scss'
import cn from 'classnames'

const ChallengeNameField = ({ challenge, onUpdateInput }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='challengeName'>Challenge Name <span>*</span> :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <input id='challengeName' name='challengeName' type='text' placeholder='Challenge Name' value={challenge.challengeName} maxLength='200' required onChange={onUpdateInput} />
      </div>
    </div>
  )
}

ChallengeNameField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired
}

export default ChallengeNameField
