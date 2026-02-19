import React from 'react'
import PropTypes from 'prop-types'
import styles from './AiWorkflowCard.module.scss'

const AIWorkflowCard = ({ workflow, scorecardId, description, onRemove, readOnly = false }) => {
  return (
    <div className={styles.workflowCard}>
      <div className={styles.workflowcardHeader}>
        <div className={styles.workflowInfo}>
          <div className={styles.workflowName}>
            <span className={styles.workflowIcon}>🤖</span>
            <span className={styles.workflowTitle}>{workflow.name}</span>
          </div>
        </div>
        {!readOnly && onRemove && (
          <button
            className={styles.workflowRemoveBtn}
            onClick={onRemove}
            title='Remove workflow'
            aria-label='Remove workflow'
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.workflowcardContent}>
        {description && (
          <div className={styles.workflowDescription}>
            <strong>Description:</strong>
            <p>{description}</p>
          </div>
        )}

        {scorecardId && (
          <div className={styles.workflowScorecard}>
            <strong>Scorecard:</strong>
            {scorecardId}
          </div>
        )}
      </div>
    </div>
  )
}

AIWorkflowCard.propTypes = {
  workflow: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired
  }).isRequired,
  scorecardId: PropTypes.string,
  description: PropTypes.string,
  onRemove: PropTypes.func,
  readOnly: PropTypes.bool
}

export default AIWorkflowCard
