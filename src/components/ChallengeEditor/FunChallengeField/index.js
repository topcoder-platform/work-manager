import React from 'react'
import PropTypes from 'prop-types'
import styles from './FunChallengeField.module.scss'

/**
 * Renders a checkbox to toggle the `funChallenge` flag for Marathon Match challenges.
 *
 * @param {Object} props component props
 * @param {Object} props.challenge challenge data object that may include `funChallenge`
 * @param {Function} props.onUpdateOthers callback used to update top-level challenge fields
 * @param {boolean} props.readOnly when true, renders the control as read-only
 * @returns {import('react').ReactNode} rendered fun challenge checkbox field
 */
const FunChallengeField = ({ challenge, onUpdateOthers, readOnly }) => {
  const isFunChallenge = challenge.funChallenge === true

  return (
    <div className={styles.row}>
      <div className={styles.tcCheckbox}>
        <input
          name='funChallenge'
          type='checkbox'
          id='funChallenge'
          checked={isFunChallenge}
          readOnly={readOnly}
          onChange={() => onUpdateOthers({ field: 'funChallenge', value: !isFunChallenge })}
        />
        <label htmlFor='funChallenge'>
          <div>Fun Challenge</div>
          <input type='hidden' />
        </label>
      </div>
    </div>
  )
}

FunChallengeField.defaultProps = {
  readOnly: false
}

FunChallengeField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default FunChallengeField
