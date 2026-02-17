import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { PrimaryButton, OutlineButton } from '../../Buttons'
import styles from './ChallengeReviewer-Field.module.scss'

class AIReviewTab extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      selectedTemplate: null,
      aiReviewConfigs: [] // Will manage AI review configs separately
    }

    this.addAIReviewer = this.addAIReviewer.bind(this)
    this.removeAIReviewer = this.removeAIReviewer.bind(this)
    this.updateAIReviewer = this.updateAIReviewer.bind(this)
    this.renderAIReviewerForm = this.renderAIReviewerForm.bind(this)
  }

  addAIReviewer () {
    const { challenge, onUpdateReviewers, metadata = {} } = this.props
    const { workflows = [] } = metadata
    const currentReviewers = challenge.reviewers || []

    const defaultWorkflow = workflows && workflows.length > 0 ? workflows[0] : null

    const reviewPhases = challenge.phases && challenge.phases.filter(phase =>
      phase.name && (phase.name.toLowerCase().includes('review') || phase.name.toLowerCase().includes('submission'))
    )
    const firstReviewPhase = reviewPhases && reviewPhases.length > 0 ? reviewPhases[0] : null

    const fallbackPhase = !firstReviewPhase && challenge.phases && challenge.phases.length > 0
      ? challenge.phases[0]
      : null

    let defaultPhaseId = ''
    if (firstReviewPhase) {
      defaultPhaseId = firstReviewPhase.phaseId || firstReviewPhase.id
    } else if (fallbackPhase) {
      defaultPhaseId = fallbackPhase.phaseId || fallbackPhase.id
    }

    const scorecardId = defaultWorkflow && defaultWorkflow.scorecardId ? defaultWorkflow.scorecardId : undefined

    const newReviewer = {
      scorecardId,
      isMemberReview: false,
      phaseId: defaultPhaseId,
      aiWorkflowId: (defaultWorkflow && defaultWorkflow.id) || ''
    }

    if (this.state.error) {
      this.setState({ error: null })
    }

    const updatedReviewers = currentReviewers.concat([newReviewer])
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  removeAIReviewer (index) {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []
    
    // Map the AI reviewer index to the actual index in the full reviewers array
    const aiReviewers = currentReviewers.filter(r => this.isAIReviewer(r))
    const reviewerToRemove = aiReviewers[index]
    const actualIndex = currentReviewers.indexOf(reviewerToRemove)
    
    if (actualIndex !== -1) {
      const updatedReviewers = currentReviewers.filter((_, i) => i !== actualIndex)
      onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
    }
  }

  updateAIReviewer (index, field, value) {
    const { challenge, onUpdateReviewers, metadata = {} } = this.props
    const currentReviewers = challenge.reviewers || []
    const updatedReviewers = currentReviewers.slice()
    const fieldUpdate = { [field]: value }

    // Map the AI reviewer index to the actual index in the full reviewers array
    const aiReviewers = currentReviewers.filter(r => this.isAIReviewer(r))
    const reviewerToUpdate = aiReviewers[index]
    const actualIndex = currentReviewers.indexOf(reviewerToUpdate)

    if (actualIndex === -1) return

    if (field === 'aiWorkflowId') {
      const { workflows = [] } = metadata
      const selectedWorkflow = workflows.find(w => w.id === value)
      if (selectedWorkflow && selectedWorkflow.scorecardId) {
        fieldUpdate.scorecardId = selectedWorkflow.scorecardId
      }
    }

    updatedReviewers[actualIndex] = Object.assign({}, updatedReviewers[actualIndex], fieldUpdate)
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  isAIReviewer (reviewer) {
    return reviewer && (
      (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
      (reviewer.isMemberReview === false)
    )
  }

  validateAIReviewer (reviewer) {
    const errors = {}

    if (!reviewer.aiWorkflowId || reviewer.aiWorkflowId.trim() === '') {
      errors.aiWorkflowId = 'AI Workflow is required'
    }

    if (!reviewer.phaseId) {
      errors.phaseId = 'Phase is required'
    }

    return errors
  }

  renderAIReviewerForm (reviewer, index) {
    const { challenge, metadata = {}, readOnly = false } = this.props
    const { workflows = [] } = metadata
    const validationErrors = challenge.submitTriggered ? this.validateAIReviewer(reviewer) : {}

    return (
      <div key={`ai-reviewer-${index}`} className={styles.reviewerForm}>
        <div className={styles.reviewerHeader}>
          <h4>AI Reviewer Configuration {index + 1}</h4>
          {!readOnly && (
            <OutlineButton
              minWidth
              text='Remove'
              type='danger'
              onClick={() => this.removeAIReviewer(index)}
            />
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Phase:</label>
            {readOnly ? (
              <span>
                {(() => {
                  const phase = (challenge.phases || []).find(p => (p.id === reviewer.phaseId) || (p.phaseId === reviewer.phaseId))
                  return phase ? (phase.name || `Phase ${phase.phaseId || phase.id}`) : 'Not selected'
                })()}
              </span>
            ) : (
              <select
                value={reviewer.phaseId || ''}
                onChange={(e) => this.updateAIReviewer(index, 'phaseId', e.target.value)}
              >
                <option value=''>Select Phase</option>
                {(challenge.phases || [])
                  .filter(phase => {
                    const rawName = phase.name ? phase.name : ''
                    const phaseName = rawName.toLowerCase()
                    const isReviewPhase = phaseName.includes('review')
                    const isSubmissionPhase = phaseName.includes('submission')
                    const isCurrentlySelected = reviewer.phaseId && ((phase.id === reviewer.phaseId) || (phase.phaseId === reviewer.phaseId))

                    return (
                      isReviewPhase ||
                      isSubmissionPhase ||
                      isCurrentlySelected
                    )
                  })
                  .map(phase => (
                    <option key={phase.id || phase.phaseId} value={phase.phaseId || phase.id}>
                      {phase.name || `Phase ${phase.phaseId || phase.id}`}
                    </option>
                  ))}
              </select>
            )}
            {!readOnly && challenge.submitTriggered && validationErrors.phaseId && (
              <div className={styles.error}>
                {validationErrors.phaseId}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>AI Workflow:</label>
            {readOnly ? (
              <span>
                {(() => {
                  const workflow = workflows.find(w => w.id === reviewer.aiWorkflowId)
                  return workflow ? workflow.name : 'Not selected'
                })()}
              </span>
            ) : (
              <select
                value={reviewer.aiWorkflowId || ''}
                onChange={(e) => this.updateAIReviewer(index, 'aiWorkflowId', e.target.value)}
              >
                <option value=''>Select AI Workflow</option>
                {workflows.map(workflow => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </option>
                ))}
              </select>
            )}
            {!readOnly && challenge.submitTriggered && validationErrors.aiWorkflowId && (
              <div className={styles.error}>
                {validationErrors.aiWorkflowId}
              </div>
            )}
          </div>
        </div>

        {readOnly && reviewer.scorecardId && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Scorecard:</label>
              <span>
                {reviewer.scorecardId}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  render () {
    const { challenge, isLoading, readOnly = false } = this.props
    const { error } = this.state
    const aiReviewers = (challenge.reviewers || []).filter(r => this.isAIReviewer(r))

    if (isLoading) {
      return <div className={styles.loading}>Loading...</div>
    }

    return (
      <div className={styles.tabContent}>
        {!readOnly && (
          <div className={styles.description}>
            Configure AI-powered review workflows for this challenge. Select AI templates and assign to phases.
          </div>
        )}

        {!readOnly && aiReviewers.length === 0 && (
          <div className={styles.noReviewers}>
            <p>No AI review workflows configured. Click "Add AI Reviewer" to get started.</p>
          </div>
        )}

        {readOnly && aiReviewers.length === 0 && (
          <div className={styles.noReviewers}>
            <p>No AI review workflows configured for this challenge.</p>
          </div>
        )}

        {aiReviewers.length > 0 && aiReviewers.map((reviewer, index) =>
          this.renderAIReviewerForm(reviewer, index)
        )}

        {aiReviewers.length > 0 && (
          <div className={styles.summary}>
            <h4>AI Review Summary</h4>
            <div className={styles.summaryRow}>
              <span>Total AI Workflows:</span>
              <span>{aiReviewers.length}</span>
            </div>
          </div>
        )}

        {!readOnly && (
          <div className={styles.addButton}>
            <button
              className={styles.addReviewerBtn}
              onClick={this.addAIReviewer}
            >
              Add AI Reviewer
            </button>
          </div>
        )}

        {error && !isLoading && (
          <div className={cn(styles.fieldError, styles.error)}>
            {error}
          </div>
        )}
      </div>
    )
  }
}

AIReviewTab.propTypes = {
  challenge: PropTypes.object.isRequired,
  onUpdateReviewers: PropTypes.func.isRequired,
  metadata: PropTypes.shape({
    workflows: PropTypes.array,
    challengeTracks: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  readOnly: PropTypes.bool
}

export default AIReviewTab
