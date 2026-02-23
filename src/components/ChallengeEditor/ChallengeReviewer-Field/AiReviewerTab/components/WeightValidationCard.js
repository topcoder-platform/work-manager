import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from '../AiReviewTab.module.scss'

/**
 * Weight Validation Card - Validates that scoring workflow weights total 100%
 */
const WeightValidationCard = ({ workflows }) => {
  const scoringWorkflows = workflows.filter(workflow => !workflow.isGating)
  const gatingWorkflows = workflows.filter(workflow => workflow.isGating)
  const weightsTotal = workflows.reduce((sum, workflow) => sum + (Number(workflow.weightPercent) || 0), 0)
  const isWeightValid = Math.abs(weightsTotal - 100) < 0.01
  const remainingWeight = Math.round((100 - weightsTotal) * 100) / 100
  const scoringSummary = `${scoringWorkflows.map(workflow => `${Number(workflow.weightPercent) || 0}%`).join(' + ')} = ${weightsTotal}%`

  return (
    <div className={styles.weightValidationSection}>
      <h3>Weight Validation</h3>
      <div className={cn(styles.validationCard, isWeightValid ? styles.validationSuccess : styles.validationWarning)}>
        <div>
          Scoring workflows weight total: {scoringSummary} {isWeightValid ? 'OK' : 'Invalid'}
        </div>
        {!isWeightValid && (
          <div className={styles.validationMessage}>
            Scoring workflow weights must total 100%. {remainingWeight > 0
              ? `Remaining: ${remainingWeight}% unassigned.`
              : `Over by ${Math.abs(remainingWeight)}%.`}
          </div>
        )}
        <div className={styles.validationMessage}>Gating workflows: {gatingWorkflows.length}</div>
      </div>
    </div>
  )
}

WeightValidationCard.propTypes = {
  workflows: PropTypes.arrayOf(
    PropTypes.shape({
      weightPercent: PropTypes.number,
      isGating: PropTypes.bool
    })
  ).isRequired
}

export default WeightValidationCard
