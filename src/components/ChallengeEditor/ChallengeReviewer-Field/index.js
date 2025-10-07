import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cn from 'classnames'
import { PrimaryButton, OutlineButton } from '../../Buttons'
import { REVIEW_OPPORTUNITY_TYPE_LABELS, REVIEW_OPPORTUNITY_TYPES, VALIDATION_VALUE_TYPE } from '../../../config/constants'
import { loadScorecards, loadDefaultReviewers, loadWorkflows } from '../../../actions/challenges'
import styles from './ChallengeReviewer-Field.module.scss'
import { convertDollarToInteger, validateValue } from '../../../util/input-check'

class ChallengeReviewerField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null
    }

    this.addReviewer = this.addReviewer.bind(this)
    this.removeReviewer = this.removeReviewer.bind(this)
    this.updateReviewer = this.updateReviewer.bind(this)
    this.renderReviewerForm = this.renderReviewerForm.bind(this)
    this.handleApplyDefault = this.handleApplyDefault.bind(this)
    this.isAIReviewer = this.isAIReviewer.bind(this)
    this.getMissingRequiredPhases = this.getMissingRequiredPhases.bind(this)
  }

  isAIReviewer (reviewer) {
    return reviewer && (
      (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
      (reviewer.isMemberReview === false)
    )
  }

  getMissingRequiredPhases () {
    const { challenge } = this.props
    const reviewers = challenge.reviewers || []
    const phases = Array.isArray(challenge.phases) ? challenge.phases : []

    const requiredPhaseNames = [
      'Screening',
      'Review',
      'Post-mortem',
      'Approval',
      'Checkpoint Screening',
      'Iterative Review'
    ]

    const normalize = (name) => (name || '')
      .toString()
      .toLowerCase()
      .replace(/[-\s]/g, '')

    const requiredNormalized = new Set(requiredPhaseNames.map(normalize))

    // Map challenge phases by normalized name to phase ids (only those we care about)
    const requiredPhaseEntries = phases
      .filter(p => requiredNormalized.has(normalize(p.name)))
      .map(p => ({ name: p.name, id: p.phaseId || p.id }))

    const missing = []
    for (const entry of requiredPhaseEntries) {
      const hasReviewerWithScorecard = reviewers.some(r => {
        const rPhaseId = r.phaseId
        const hasScorecard = !!r.scorecardId
        return rPhaseId === entry.id && hasScorecard
      })
      if (!hasReviewerWithScorecard) {
        // Use the canonical capitalization from requiredPhaseNames when possible
        const canonical = requiredPhaseNames.find(n => normalize(n) === normalize(entry.name)) || entry.name
        missing.push(canonical)
      }
    }

    return missing
  }

  componentDidMount () {
    this.loadScorecards()
    this.loadDefaultReviewers()
    this.loadWorkflows()
  }

  componentDidUpdate (prevProps) {
    const { challenge, readOnly } = this.props
    const prevChallenge = prevProps.challenge

    if (challenge && prevChallenge &&
        (challenge.type !== prevChallenge.type || challenge.track !== prevChallenge.track)) {
      if (readOnly) {
        this.loadSpecificScorecards()
      } else {
        this.loadScorecards()
      }
    }

    if (challenge && prevChallenge &&
        (challenge.typeId !== prevChallenge.typeId || challenge.trackId !== prevChallenge.trackId)) {
      this.loadDefaultReviewers()
    }
  }

  loadScorecards () {
    const { challenge, loadScorecards } = this.props

    const filters = {}

    // Add challenge track if available
    if (challenge.track) {
      filters.challengeTrack = challenge.track.toUpperCase().replace(' ', '_')
    }

    // Add challenge type if available
    if (challenge.type) {
      filters.challengeType = challenge.type
    }

    loadScorecards(filters)
  }

  loadDefaultReviewers () {
    const { challenge, loadDefaultReviewers } = this.props

    // only load default reviewers if we have typeId and trackId
    if (!challenge.typeId || !challenge.trackId) {
      console.log('Cannot load default reviewers: missing typeId or trackId')
      return
    }

    loadDefaultReviewers({
      typeId: challenge.typeId,
      trackId: challenge.trackId
    })
  }

  loadWorkflows () {
    const { loadWorkflows } = this.props
    loadWorkflows()
  }

  addReviewer () {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []

    // Create a new default reviewer based on track and type
    const defaultReviewer = this.findDefaultReviewer()

    // Get the first available review phase if phases exist
    const reviewPhases = challenge.phases && challenge.phases.filter(phase =>
      phase.name && phase.name.toLowerCase().includes('review')
    )
    const firstReviewPhase = reviewPhases && reviewPhases.length > 0 ? reviewPhases[0] : null

    // If no review phases, get the first available phase as fallback
    const fallbackPhase = !firstReviewPhase && challenge.phases && challenge.phases.length > 0
      ? challenge.phases[0]
      : null

    const isAIReviewer = this.isAIReviewer(defaultReviewer)

    // For AI reviewers, get scorecardId from the workflow if available
    let scorecardId = ''
    if (isAIReviewer) {
      const { metadata = {} } = this.props
      const { workflows = [] } = metadata
      const defaultWorkflowId = defaultReviewer && defaultReviewer.aiWorkflowId
      if (defaultWorkflowId) {
        const workflow = workflows.find(w => w.id === defaultWorkflowId)
        scorecardId = workflow && workflow.scorecardId ? workflow.scorecardId : undefined
      } else {
        scorecardId = undefined
      }
    } else {
      scorecardId = (defaultReviewer && defaultReviewer.scorecardId) || ''
    }

    // Determine the default phase ID
    let defaultPhaseId = ''
    if (defaultReviewer && defaultReviewer.phaseId) {
      defaultPhaseId = defaultReviewer.phaseId
    } else if (firstReviewPhase) {
      defaultPhaseId = firstReviewPhase.phaseId || firstReviewPhase.id
    } else if (fallbackPhase) {
      defaultPhaseId = fallbackPhase.phaseId || fallbackPhase.id
    }

    const newReviewer = {
      scorecardId,
      isMemberReview: !isAIReviewer,
      phaseId: defaultPhaseId,
      basePayment: (defaultReviewer && defaultReviewer.basePayment) || '0',
      incrementalPayment: (defaultReviewer && defaultReviewer.incrementalPayment) || 0,
      type: isAIReviewer ? undefined : ((defaultReviewer && defaultReviewer.opportunityType) || REVIEW_OPPORTUNITY_TYPES.REGULAR_REVIEW)
    }

    if (isAIReviewer) {
      newReviewer.aiWorkflowId = (defaultReviewer && defaultReviewer.aiWorkflowId) || ''
    }

    // Set member-specific fields for member reviewers
    if (!isAIReviewer) {
      newReviewer.memberReviewerCount = (defaultReviewer && defaultReviewer.memberReviewerCount) || 1
    }

    const updatedReviewers = currentReviewers.concat([newReviewer])
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  removeReviewer (index) {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []
    const updatedReviewers = currentReviewers.filter((_, i) => i !== index)
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  updateReviewer (index, field, value) {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []
    const updatedReviewers = currentReviewers.slice()
    const fieldUpdate = {}
    fieldUpdate[field] = value

    if (field === 'aiWorkflowId') {
      const { metadata = {} } = this.props
      const { workflows = [] } = metadata
      const workflow = workflows.find(w => w.id === value)
      if (workflow && workflow.scorecardId) {
        fieldUpdate.scorecardId = workflow.scorecardId
      } else {
        fieldUpdate.scorecardId = undefined
      }
    }

    updatedReviewers[index] = Object.assign({}, updatedReviewers[index], fieldUpdate)
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  findDefaultReviewer () {
    const { challenge, metadata = {} } = this.props
    const { defaultReviewers = [] } = metadata

    if (!challenge || !challenge.trackId || !challenge.typeId) {
      return null
    }

    return defaultReviewers.find(dr =>
      dr.trackId === challenge.trackId && dr.typeId === challenge.typeId
    )
  }

  validateReviewer (reviewer) {
    const errors = {}
    const isAI = this.isAIReviewer(reviewer)

    if (isAI) {
      if (!reviewer.aiWorkflowId || reviewer.aiWorkflowId.trim() === '') {
        errors.aiWorkflowId = 'AI Workflow is required'
      }
    } else {
      if (!reviewer.scorecardId) {
        errors.scorecardId = 'Scorecard is required'
      }

      const memberCount = parseInt(reviewer.memberReviewerCount) || 1
      if (memberCount < 1 || !Number.isInteger(memberCount)) {
        errors.memberReviewerCount = 'Number of reviewers must be a positive integer'
      }

      const basePayment = convertDollarToInteger(reviewer.basePayment || '0', '')
      if (basePayment < 0) {
        errors.basePayment = 'Base payment must be non-negative'
      }
    }

    if (!reviewer.phaseId) {
      errors.phaseId = 'Phase is required'
    }

    return errors
  }

  handleApplyDefault () {
    const defaultReviewer = this.findDefaultReviewer()
    if (defaultReviewer) {
      this.addReviewer()
    }
  }

  renderReviewerForm (reviewer, index) {
    const { challenge, metadata = {}, readOnly = false } = this.props
    const { scorecards = [], workflows = [] } = metadata
    const validationErrors = challenge.submitTriggered ? this.validateReviewer(reviewer) : {}

    return (
      <div key={`reviewer-${index}`} className={styles.reviewerForm}>
        <div className={styles.reviewerHeader}>
          <h4>Reviewer Type {index + 1}</h4>
          {!readOnly && (
            <OutlineButton
              text='Remove'
              type='danger'
              onClick={() => this.removeReviewer(index)}
            />
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Reviewer Type:</label>
            {readOnly ? (
              <span>{this.isAIReviewer(reviewer) ? 'AI Reviewer' : 'Member Reviewer'}</span>
            ) : (
              <select
                value={this.isAIReviewer(reviewer) ? 'ai' : 'member'}
                onChange={(e) => {
                  const isAI = e.target.value === 'ai'
                  const { challenge, onUpdateReviewers } = this.props
                  const currentReviewers = challenge.reviewers || []
                  const updatedReviewers = currentReviewers.slice()

                  // Update reviewer type by setting/clearing aiWorkflowId
                  const currentReviewer = updatedReviewers[index]

                  // For AI reviewers, get scorecardId from the selected workflow if available
                  let scorecardId = currentReviewer.scorecardId
                  if (isAI) {
                    const { metadata = {} } = this.props
                    const { workflows = [] } = metadata
                    const workflowId = currentReviewer.aiWorkflowId
                    if (workflowId) {
                      const workflow = workflows.find(w => w.id === workflowId)
                      scorecardId = workflow && workflow.scorecardId ? workflow.scorecardId : undefined
                    } else {
                      scorecardId = undefined
                    }
                  }

                  const updatedReviewer = {
                    scorecardId,
                    isMemberReview: !isAI,
                    phaseId: currentReviewer.phaseId,
                    basePayment: currentReviewer.basePayment || '0',
                    incrementalPayment: currentReviewer.incrementalPayment || 0,
                    type: isAI ? undefined : (currentReviewer.type || REVIEW_OPPORTUNITY_TYPES.REGULAR_REVIEW)
                  }

                  if (isAI) {
                    updatedReviewer.aiWorkflowId = currentReviewer.aiWorkflowId || ''
                  }

                  if (!isAI) {
                    updatedReviewer.memberReviewerCount = currentReviewer.memberReviewerCount || 1
                  }

                  updatedReviewers[index] = updatedReviewer

                  onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
                }}
              >
                <option value='member'>Member Reviewer</option>
                <option value='ai'>AI Reviewer</option>
              </select>
            )}
          </div>

          {this.isAIReviewer(reviewer) ? (
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
                  onChange={(e) => this.updateReviewer(index, 'aiWorkflowId', e.target.value)}
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
          ) : (
            <div className={styles.formGroup}>
              <label>Scorecard:</label>
              {readOnly ? (
                <span>
                  {(() => {
                    const scorecard = scorecards.find(s => s.id === reviewer.scorecardId)
                    return scorecard ? `${scorecard.name || 'Unknown'} - ${scorecard.type || 'Unknown'} (${scorecard.challengeTrack || 'Unknown'}) v${scorecard.version || 'Unknown'}` : 'Not selected'
                  })()}
                </span>
              ) : (
                <select
                  value={reviewer.scorecardId}
                  onChange={(e) => this.updateReviewer(index, 'scorecardId', e.target.value)}
                >
                  <option value=''>Select Scorecard</option>
                  {scorecards.map(scorecard => (
                    <option key={scorecard.id} value={scorecard.id}>
                      {scorecard.name || 'Unknown'} - {scorecard.type || 'Unknown'} ({scorecard.challengeTrack || 'Unknown'}) v{scorecard.version || 'Unknown'}
                    </option>
                  ))}
                </select>
              )}
              {!readOnly && challenge.submitTriggered && validationErrors.scorecardId && (
                <div className={styles.error}>
                  {validationErrors.scorecardId}
                </div>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Phase:</label>
            {readOnly ? (
              <span>
                {(() => {
                  const phase = challenge.phases && challenge.phases.find(p =>
                    (p.id === reviewer.phaseId) || (p.phaseId === reviewer.phaseId)
                  )
                  return phase ? (phase.name || `Phase ${phase.phaseId || phase.id}`) : 'Not selected'
                })()}
              </span>
            ) : (
              <select
                value={reviewer.phaseId || ''}
                onChange={(e) => this.updateReviewer(index, 'phaseId', e.target.value)}
              >
                <option value=''>Select Phase</option>
                {challenge.phases && challenge.phases
                  .filter(phase => {
                    const rawName = phase.name ? phase.name : ''
                    const phaseName = rawName.toLowerCase()
                    const norm = phaseName.replace(/[-\s]/g, '')
                    const isReviewPhase = phaseName.includes('review')
                    const isSubmissionPhase = phaseName.includes('submission')
                    const isScreeningPhase = norm === 'screening' || norm === 'checkpointscreening'
                    const isApprovalPhase = norm === 'approval'
                    const isPostMortemPhase = norm === 'postmortem'
                    const isCurrentlySelected = reviewer.phaseId && ((phase.id === reviewer.phaseId) || (phase.phaseId === reviewer.phaseId)) && !isSubmissionPhase

                    // For AI reviewers, allow review, submission, and other required phases
                    // For member reviewers, allow review and other required phases
                    if (this.isAIReviewer(reviewer)) {
                      return (
                        isReviewPhase ||
                        isSubmissionPhase ||
                        isScreeningPhase ||
                        isApprovalPhase ||
                        isPostMortemPhase ||
                        isCurrentlySelected
                      )
                    } else {
                      return (
                        isReviewPhase ||
                        isScreeningPhase ||
                        isApprovalPhase ||
                        isPostMortemPhase ||
                        isCurrentlySelected
                      )
                    }
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

        {!this.isAIReviewer(reviewer) && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Number of Reviewers:</label>
              {readOnly ? (
                <span>{reviewer.memberReviewerCount || 1}</span>
              ) : (
                <input
                  type='number'
                  min='1'
                  value={reviewer.memberReviewerCount || 1}
                  onChange={(e) => {
                    const validatedValue = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER)
                    const parsedValue = parseInt(validatedValue) || 1
                    this.updateReviewer(index, 'memberReviewerCount', Math.max(1, parsedValue))
                  }}
                />
              )}
              {!readOnly && challenge.submitTriggered && validationErrors.memberReviewerCount && (
                <div className={styles.error}>
                  {validationErrors.memberReviewerCount}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Base Payment ($):</label>
              {readOnly ? (
                <span>${reviewer.basePayment || '0'}</span>
              ) : (
                <input
                  type='number'
                  min='0'
                  value={reviewer.basePayment || '0'}
                  onChange={(e) => {
                    const validatedValue = validateValue(e.target.value, VALIDATION_VALUE_TYPE.INTEGER)
                    this.updateReviewer(index, 'basePayment', validatedValue)
                  }}
                />
              )}
              {!readOnly && challenge.submitTriggered && validationErrors.basePayment && (
                <div className={styles.error}>
                  {validationErrors.basePayment}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Incremental Payment ($):</label>
              {readOnly ? (
                <span>${reviewer.incrementalPayment || 0}</span>
              ) : (
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={reviewer.incrementalPayment || 0}
                  onChange={(e) => this.updateReviewer(index, 'incrementalPayment', parseFloat(e.target.value))}
                />
              )}
            </div>
          </div>
        )}

        {!this.isAIReviewer(reviewer) && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Review Type:</label>
              {readOnly ? (
                <span>
                  { REVIEW_OPPORTUNITY_TYPE_LABELS[reviewer.type] || 'Regular Review'}
                </span>
              ) : (
                <select
                  value={reviewer.type || REVIEW_OPPORTUNITY_TYPES.REGULAR_REVIEW}
                  onChange={(e) => this.updateReviewer(index, 'type', e.target.value)}
                >
                  <option value={REVIEW_OPPORTUNITY_TYPES.REGULAR_REVIEW}>Regular Review</option>
                  <option value={REVIEW_OPPORTUNITY_TYPES.COMPONENT_DEV_REVIEW}>Component Dev Review</option>
                  <option value={REVIEW_OPPORTUNITY_TYPES.SPEC_REVIEW}>Spec Review</option>
                  <option value={REVIEW_OPPORTUNITY_TYPES.ITERATIVE_REVIEW}>Iterative Review</option>
                  <option value={REVIEW_OPPORTUNITY_TYPES.SCENARIOS_REVIEW}>Scenarios Review</option>
                </select>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  render () {
    const { challenge, metadata = {}, isLoading, readOnly = false } = this.props
    const { error } = this.state
    const { scorecards = [], defaultReviewers = [], workflows = [] } = metadata
    const reviewers = challenge.reviewers || []

    if (isLoading) {
      return (
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label>Review Configuration :</label>
          </div>
          <div className={cn(styles.field, styles.col2)}>
            <div className={styles.loading}>Loading...</div>
          </div>
        </div>
      )
    }

    if (error && !scorecards.length && !defaultReviewers.length && !workflows.length) {
      return (
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label>Review Configuration :</label>
          </div>
          <div className={cn(styles.field, styles.col2, styles.error)}>
            {error}
          </div>
        </div>
      )
    }

    return (
      <>
        <div className={styles.row}>
          <div className={cn(styles.field, styles.col1)}>
            <label>Review Configuration :</label>
          </div>
          <div className={cn(styles.field, styles.col2)}>
            {(!readOnly && challenge.submitTriggered) && (() => {
              const missing = this.getMissingRequiredPhases()
              if (missing.length > 0) {
                return (
                  <div className={styles.error}>
                    {`Please configure a scorecard for: ${missing.join(', ')}`}
                  </div>
                )
              }
              return null
            })()}
            {!readOnly && (
              <div className={styles.description}>
                Configure how this challenge will be reviewed. You can add multiple reviewers including AI and member reviewers.
              </div>
            )}

            {!readOnly && reviewers && reviewers.length === 0 && (
              <div className={styles.noReviewers}>
                <p>No reviewers configured. Click "Add Reviewer" to get started.</p>
                {this.findDefaultReviewer() && (
                  <div className={styles.defaultReviewerNote}>
                    <p><strong>Note:</strong> Default reviewer configuration is available for this track and type combination.</p>
                    <OutlineButton
                      text='Apply Default Configuration'
                      type='info'
                      onClick={this.handleApplyDefault}
                    />
                  </div>
                )}
              </div>
            )}

            {readOnly && reviewers && reviewers.length === 0 && (
              <div className={styles.noReviewers}>
                <p>No reviewers configured for this challenge.</p>
              </div>
            )}

            {reviewers && reviewers.map((reviewer, index) =>
              this.renderReviewerForm(reviewer, index)
            )}

            {reviewers && reviewers.length > 0 && (
              <div className={styles.summary}>
                <h4>Review Summary</h4>
                <div className={styles.summaryRow}>
                  <span>Total Member Reviewers:</span>
                  <span>{reviewers.filter(r => !this.isAIReviewer(r)).reduce((sum, r) => sum + (parseInt(r.memberReviewerCount) || 0), 0)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total AI Reviewers:</span>
                  <span>{reviewers.filter(r => this.isAIReviewer(r)).length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total Review Cost:</span>
                  <span>${reviewers.filter(r => !this.isAIReviewer(r)).reduce((sum, r) => {
                    const base = convertDollarToInteger(r.basePayment || '0', '')
                    const count = parseInt(r.memberReviewerCount) || 1
                    return sum + (base * count)
                  }, 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {!readOnly && (
              <div className={styles.addButton}>
                <PrimaryButton
                  text='Add Reviewer'
                  type='info'
                  onClick={this.addReviewer}
                />
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

ChallengeReviewerField.propTypes = {
  challenge: PropTypes.object.isRequired,
  onUpdateReviewers: PropTypes.func.isRequired,
  metadata: PropTypes.shape({
    scorecards: PropTypes.array,
    defaultReviewers: PropTypes.array,
    workflows: PropTypes.array,
    scorecardById: PropTypes.object
  }),
  isLoading: PropTypes.bool,
  readOnly: PropTypes.bool,
  loadScorecards: PropTypes.func.isRequired,
  loadDefaultReviewers: PropTypes.func.isRequired,
  loadWorkflows: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  metadata: state.challenges.metadata || {},
  isLoading: state.challenges.isLoading
})

const mapDispatchToProps = {
  loadScorecards,
  loadDefaultReviewers,
  loadWorkflows
}

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeReviewerField)
