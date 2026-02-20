import React from 'react'
import PropTypes from 'prop-types'
import styles from '../AIReviewTab.module.scss'

/**
 * Configuration Source Selector - Toggle between template and manual configuration
 */
const ConfigurationSourceSelector = ({ mode, onSwitch, readOnly }) => {
  return (
    <div className={styles.configurationSourceSelector}>
      <h4>Configuration Source:</h4>
      <div className={styles.sourceOptions}>
        <label className={styles.radioLabel}>
          <input
            type='radio'
            name='configSource'
            value='template'
            checked={mode === 'template'}
            disabled
            readOnly
          />
          <span>Template</span>
        </label>
        <label className={styles.radioLabel}>
          <input
            type='radio'
            name='configSource'
            value='manual'
            checked={mode === 'manual'}
            disabled
            readOnly
          />
          <span>Manual</span>
        </label>
        {!readOnly && (
          <button
            className={styles.switchButton}
            onClick={onSwitch}
          >
            Switch
          </button>
        )}
      </div>
    </div>
  )
}

ConfigurationSourceSelector.propTypes = {
  mode: PropTypes.oneOf(['template', 'manual']).isRequired,
  onSwitch: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

ConfigurationSourceSelector.defaultProps = {
  readOnly: false
}

export default ConfigurationSourceSelector
