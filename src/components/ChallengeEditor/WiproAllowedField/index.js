import React from 'react'
import PropTypes from 'prop-types'
import styles from './WiproAllowedField.module.scss'

/**
 * Renders a checkbox to toggle the `wiproAllowed` flag for challenges.
 *
 * @param {Object} props component props
 * @param {Object} props.challenge challenge data object that may include `wiproAllowed`
 * @param {Function} props.onUpdateOthers callback used to update top-level challenge fields
 * @param {boolean} props.readOnly when true, renders the control as read-only
 * @returns {import('react').ReactNode} rendered wipro allowed checkbox field
 */
const WiproAllowedField = ({ challenge, onUpdateOthers, readOnly }) => {
  const isWiproAllowed = challenge.wiproAllowed === true

  return (
    <div className={styles.row}>
      <div className={styles.tcCheckbox}>
        <input
          name='wiproAllowed'
          type='checkbox'
          id='wiproAllowed'
          checked={isWiproAllowed}
          readOnly={readOnly}
          onChange={() => onUpdateOthers({ field: 'wiproAllowed', value: !isWiproAllowed })}
        />
        <label htmlFor='wiproAllowed'>
          <div>Wipro Allowed</div>
          <input type='hidden' />
        </label>
      </div>
    </div>
  )
}

WiproAllowedField.defaultProps = {
  readOnly: false
}

WiproAllowedField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export default WiproAllowedField
