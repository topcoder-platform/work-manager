import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeName-Field.module.scss'
import cn from 'classnames'

const ChallengeNameField = ({ challenge, onUpdateInput }) => {
  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='challengeName'>Work Name <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <input className={styles.challengeName} id='name' name='name' type='text' placeholder='Work Name' value={challenge.name} maxLength='200' required onChange={onUpdateInput} />
        </div>
      </div>
      { challenge.submitTriggered && !challenge.name && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Work Name is required field
        </div>
      </div> }
    </>
  )
}

ChallengeNameField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateInput: PropTypes.func.isRequired
}

export default ChallengeNameField
