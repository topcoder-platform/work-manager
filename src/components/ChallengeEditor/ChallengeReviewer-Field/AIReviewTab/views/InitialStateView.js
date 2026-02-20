import React from 'react'
import PropTypes from 'prop-types'
import AIWorkflowCard from '../../AIWorkflowCard'
import styles from '../AIReviewTab.module.scss'

/**
 * Initial State View - Shown when AI reviewers are assigned but no configuration exists
 * Provides options to use a template or configure manually
 */
const InitialStateView = ({
  assignedWorkflows,
  onSelectTemplate,
  onSelectManual,
  onRemoveReviewer,
  readOnly
}) => {
  return (
    <div className={styles.initialStateContainer}>
      <div className={styles.warningBox}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningContent}>
          <h3>AI workflows are assigned but no AI Review Config has been created</h3>
          <p>Workflows will run but scoring, gating, and thresholds are not defined.</p>
          <p><strong>Choose how to configure:</strong></p>
        </div>
      </div>

      <div className={styles.configurationOptions}>
        <div className={styles.optionCard}>
          <h4>📋 Use a Template</h4>
          <p>Pre-fill from a standard config for this track & type.</p>
          <button
            className={styles.optionButton}
            onClick={onSelectTemplate}
          >
            Use Template
          </button>
        </div>

        <div className={styles.optionCard}>
          <h4>✏️ Configure Manually</h4>
          <p>Set up each workflow weight, mode, and threshold yourself.</p>
          <button
            className={styles.optionButton}
            onClick={onSelectManual}
          >
            Configure Manually
          </button>
        </div>
      </div>

      <div className={styles.assignedWorkflowsSection}>
        <h3>Assigned AI Workflows</h3>
        <p>These AI workflows are assigned to this challenge from the default reviewer configuration.</p>

        <div className={styles.workflowsList}>
          {assignedWorkflows.map((item, index) => (
            <AIWorkflowCard
              key={`workflow-${index}`}
              workflow={item.workflow || { name: item.reviewer.aiWorkflowId }}
              scorecardId={(item.workflow || item.reviewer).scorecardId}
              description=''
              onRemove={() => onRemoveReviewer(index)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

InitialStateView.propTypes = {
  assignedWorkflows: PropTypes.arrayOf(
    PropTypes.shape({
      reviewer: PropTypes.object.isRequired,
      workflow: PropTypes.object,
      scorecardId: PropTypes.string
    })
  ).isRequired,
  onSelectTemplate: PropTypes.func.isRequired,
  onSelectManual: PropTypes.func.isRequired,
  onRemoveReviewer: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

InitialStateView.defaultProps = {
  readOnly: false
}

export default InitialStateView
