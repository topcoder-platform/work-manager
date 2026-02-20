import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from '../AiReviewTab.module.scss'
import { isAIReviewer } from '../utils'

/**
 * Manual Workflow Card - Editable workflow configuration card
 * Allows user to configure workflow ID, weight, and gating status
 */
const ManualWorkflowCard = ({
  workflow,
  index,
  availableWorkflows,
  challenge,
  onUpdate,
  onRemove,
  readOnly,
}) => {
  const isAssigned = (challenge.reviewers || []).some(r =>
    isAIReviewer(r) && r.aiWorkflowId === workflow.workflowId
  )

  return (
    <div className={styles.manualWorkflowCard}>
      <div className={styles.manualWorkflowHeader}>
        <div className={styles.manualWorkflowTitle}>Workflow {index + 1}</div>
        {!readOnly && (
          <button
            className={styles.removeWorkflowButton}
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>

      <div className={styles.manualWorkflowBody}>
        <div className={styles.manualWorkflowField}>
          <label>AI Workflow:</label>
          <select
            value={workflow.workflowId || ''}
            onChange={(e) => onUpdate(index, 'workflowId', e.target.value)}
            disabled={readOnly}
            className={styles.workflowSelect}
          >
            <option value=''>Select AI Workflow</option>
            {availableWorkflows.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.manualWorkflowRow}>
          <div className={styles.manualWorkflowField}>
            <label>Weight (%):</label>
            <input
              type='number'
              min='0'
              max='100'
              value={workflow.isGating ? '' : (workflow.weightPercent || 0)}
              placeholder={workflow.isGating ? 'N/A (gating)' : '0'}
              onChange={(e) => onUpdate(
                index,
                'weightPercent',
                parseInt(e.target.value, 10) || 0
              )}
              disabled={readOnly || workflow.isGating}
              className={styles.weightInput}
            />
            <div className={styles.fieldHint}>Weight for scoring. Ignored if gating.</div>
          </div>

          <div className={styles.manualWorkflowField}>
            <label>Gating Workflow:</label>
            <label className={styles.toggleLabel}>
              <input
                type='checkbox'
                checked={workflow.isGating}
                onChange={(e) => onUpdate(index, 'isGating', e.target.checked)}
                disabled={readOnly}
              />
              <span>{workflow.isGating ? 'Yes' : 'No'}</span>
            </label>
            <div className={styles.fieldHint}>
              {workflow.isGating ? '⚡ Pass/fail gate.' : 'Submissions below threshold are locked.'}
            </div>
          </div>
        </div>

        {workflow.workflowId && (
          <div
            className={cn(
              styles.assignmentNotice,
              isAssigned ? styles.assignmentMatch : styles.assignmentMissing
            )}
          >
            {isAssigned
              ? 'Matched: This workflow is assigned as AI Reviewer for this challenge.'
              : 'Not assigned: will be auto-added on save.'}
          </div>
        )}
      </div>
    </div>
  )
}

ManualWorkflowCard.propTypes = {
  workflow: PropTypes.shape({
    workflowId: PropTypes.string,
    weightPercent: PropTypes.number,
    isGating: PropTypes.bool
  }).isRequired,
  index: PropTypes.number.isRequired,
  availableWorkflows: PropTypes.array.isRequired,
  challenge: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
}

ManualWorkflowCard.defaultProps = {
  readOnly: false
}

export default ManualWorkflowCard
