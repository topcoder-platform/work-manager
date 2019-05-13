import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './ChallengeTotal-Field.module.scss'
import cn from 'classnames'

const ChallengeTotalField = ({ challenge }) => {
  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='challengeTotal'>Estimated Challenge Total :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        <span>{_.isEmpty(challenge.challengeTotalAmount) ? '' : challenge.challengeTotalAmount}</span>
      </div>
    </div>
  )
}

ChallengeTotalField.propTypes = {
  challenge: PropTypes.shape().isRequired
}

export default ChallengeTotalField
