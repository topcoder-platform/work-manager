/**
 * Switch Button component
 */
import React from 'react'
import PropTypes from 'prop-types'
import styles from './SwitchButton.module.scss'

const SwitchButton = ({ label, ...props }) => {
  return (
    <div className={styles.switchButton}>
      <label>
        <input type='checkbox' {...props} />
        <i />
      </label>
    </div>
  )
}

SwitchButton.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func
}

export default SwitchButton
