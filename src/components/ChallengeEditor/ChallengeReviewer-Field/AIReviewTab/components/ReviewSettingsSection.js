import React from 'react'
import PropTypes from 'prop-types'
import styles from '../AIReviewTab.module.scss'

/**
 * Review Settings Section - Mode, auto-finalize, and threshold configuration
 */
const ReviewSettingsSection = ({ configuration, onUpdateConfiguration, readOnly, showTitle = true }) => {
  return (
    <div className={styles.reviewSettingsSection}>
      {showTitle && <h3>⚙️ Review Settings</h3>}

      <div className={styles.settingsGrid}>
        {/* Review Mode */}
        <div className={styles.setting}>
          <label>Review Mode:</label>
          <select
            value={configuration.mode}
            onChange={(e) => onUpdateConfiguration('mode', e.target.value)}
            disabled={readOnly}
            className={styles.modeDropdown}
          >
            <option value='AI_GATING'>AI_GATING</option>
            <option value='AI_ONLY'>AI_ONLY</option>
          </select>
          <p className={styles.modeInfo}>
            {configuration.mode === 'AI_GATING'
              ? 'AI gates low-quality submissions; humans review the rest.'
              : 'AI makes the final decision on all submissions.'}
          </p>
        </div>

        {/* Auto-Finalize */}
        <div className={styles.setting}>
          <label>Auto-Finalize:</label>
          <label className={styles.checkboxLabel}>
            <input
              type='checkbox'
              checked={configuration.autoFinalize}
              onChange={(e) => onUpdateConfiguration('autoFinalize', e.target.checked)}
              disabled={readOnly || configuration.mode !== 'AI_ONLY'}
            />
            <span>{configuration.autoFinalize ? 'On' : 'Off'}</span>
          </label>
          <p className={styles.autoFinalizeInfo}>
            Only available in AI_ONLY mode
          </p>
        </div>
      </div>

      {/* Min Passing Threshold Slider */}
      <div className={styles.thresholdSection}>
        <label>Min Passing Threshold:</label>
        <div className={styles.thresholdSlider}>
          <input
            type='range'
            min='0'
            max='100'
            value={configuration.minPassingThreshold}
            onChange={(e) => onUpdateConfiguration('minPassingThreshold', parseInt(e.target.value, 10))}
            disabled={readOnly}
            className={styles.slider}
          />
          <span className={styles.thresholdValue}>
            {configuration.minPassingThreshold} %
          </span>
        </div>
      </div>
    </div>
  )
}

ReviewSettingsSection.propTypes = {
  configuration: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    minPassingThreshold: PropTypes.number.isRequired,
    autoFinalize: PropTypes.bool.isRequired
  }).isRequired,
  onUpdateConfiguration: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  showTitle: PropTypes.bool
}

ReviewSettingsSection.defaultProps = {
  readOnly: false,
  showTitle: true
}

export default ReviewSettingsSection
