import React from 'react'
import PropTypes from 'prop-types'
import styles from '../AiReviewTab.module.scss'

/**
 * Summary Section - Display configuration summary with cards
 */
const SummarySection = ({ configuration }) => {
  return (
    <div className={styles.summarySection}>
      <h3>Summary</h3>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <h4>Mode</h4>
          <div className={styles.summaryValue}>{configuration.mode}</div>
        </div>
        <div className={styles.summaryCard}>
          <h4>Threshold</h4>
          <div className={styles.summaryValue}>{configuration.minPassingThreshold}%</div>
        </div>
        <div className={styles.summaryCard}>
          <h4>Workflows</h4>
          <div className={styles.summaryValue}>
            {configuration.workflows.length} total
            {configuration.workflows.some(w => w.isGating) && (
              <div className={styles.summarySubtext}>
                {configuration.workflows.filter(w => w.isGating).length} gating
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

SummarySection.propTypes = {
  configuration: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    minPassingThreshold: PropTypes.number.isRequired,
    workflows: PropTypes.arrayOf(
      PropTypes.shape({
        isGating: PropTypes.bool
      })
    ).isRequired
  }).isRequired
}

export default SummarySection
