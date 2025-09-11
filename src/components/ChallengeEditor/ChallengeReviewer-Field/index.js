import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cn from 'classnames'
import { PrimaryButton, OutlineButton } from '../../Buttons'
import { REVIEW_OPPORTUNITY_TYPES } from '../../../config/constants'
import { loadScorecards, loadDefaultReviewers } from '../../../actions/challenges'
import styles from './ChallengeReviewer-Field.module.scss'

class ChallengeReviewerField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null
    }

    // Bind methods
    this.addReviewer = this.addReviewer.bind(this)
    this.removeReviewer = this.removeReviewer.bind(this)
    this.updateReviewer = this.updateReviewer.bind(this)
    this.renderReviewerForm = this.renderReviewerForm.bind(this)
    this.handleApplyDefault = this.handleApplyDefault.bind(this)
  }

  componentDidMount () {
    this.loadScorecards()
    this.loadDefaultReviewers()
  }

  loadScorecards () {
    const { challenge, loadScorecards } = this.props
    // Build query parameters for the scorecard API
    const filters = {}

    // Add challenge track if available
    if (challenge.track) {
      filters.challengeTrack = challenge.track.toUpperCase()
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

  addReviewer () {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []

    // Create a new default reviewer based on track and type
    const defaultReviewer = this.findDefaultReviewer()

    // Get the first available phase if phases exist
    const firstPhase = challenge.phases && challenge.phases.length > 0 ? challenge.phases[0] : null

    const newReviewer = {
      scorecardId: (defaultReviewer && defaultReviewer.scorecardId) || '',
      isMemberReview: true,
      memberReviewerCount: (defaultReviewer && defaultReviewer.memberReviewerCount) || 1,
      phaseId: (defaultReviewer && defaultReviewer.phaseId) || (firstPhase ? firstPhase.id : ''),
      basePayment: (defaultReviewer && defaultReviewer.basePayment) || 0,
      incrementalPayment: (defaultReviewer && defaultReviewer.incrementalPayment) || 0,
      type: (defaultReviewer && defaultReviewer.opportunityType) || REVIEW_OPPORTUNITY_TYPES.REGULAR_REVIEW,
      isAIReviewer: false
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
    updatedReviewers[index] = Object.assign({}, updatedReviewers[index], fieldUpdate)
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  findDefaultReviewer () {
    const { challenge, metadata } = this.props
    const { defaultReviewers = [] } = metadata

    if (!challenge || !challenge.trackId || !challenge.typeId) {
      return null
    }

    return defaultReviewers.find(dr =>
      dr.trackId === challenge.trackId && dr.typeId === challenge.typeId
    )
  }

  validateReviewer (reviewer) {
    const errors = []

    if (!reviewer.scorecardId) {
      errors.push('Scorecard is required')
    }

    if (!reviewer.phaseId) {
      errors.push('Phase is required')
    }

    if (!reviewer.isAIReviewer && (!reviewer.memberReviewerCount || reviewer.memberReviewerCount < 1)) {
      errors.push('Number of reviewers must be at least 1')
    }

    if (!reviewer.isAIReviewer && (!reviewer.basePayment || reviewer.basePayment < 0)) {
      errors.push('Base payment must be non-negative')
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
    const { challenge, metadata, readOnly = false } = this.props
    const { scorecards = [] } = metadata
    const validationErrors = this.validateReviewer(reviewer)

    return (
      <div key={`reviewer-${index}`} className={styles.reviewerForm}>
        <div className={styles.reviewerHeader}>
          <h4>Reviewer {index + 1}</h4>
          {!readOnly && (
            <OutlineButton
              text='Remove'
              type='danger'
              onClick={() => this.removeReviewer(index)}
            />
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className={styles.validationErrors}>
            {validationErrors.map((error, i) => (
              <div key={i} className={styles.validationError}>{error}</div>
            ))}
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Reviewer Type:</label>
            {readOnly ? (
              <span>{reviewer.isAIReviewer ? 'AI Reviewer' : 'Member Reviewer'}</span>
            ) : (
              <select
                value={reviewer.isAIReviewer ? 'ai' : 'member'}
                onChange={(e) => {
                  const isAI = e.target.value === 'ai'
                  const { challenge, onUpdateReviewers } = this.props
                  const currentReviewers = challenge.reviewers || []
                  const updatedReviewers = currentReviewers.slice()

                  // Update both fields atomically to ensure XOR constraint is satisfied
                  // Maintain correct field order as expected by API schema
                  const currentReviewer = updatedReviewers[index]
                  updatedReviewers[index] = {
                    scorecardId: currentReviewer.scorecardId,
                    isMemberReview: !isAI,
                    memberReviewerCount: currentReviewer.memberReviewerCount,
                    phaseId: currentReviewer.phaseId,
                    basePayment: currentReviewer.basePayment,
                    incrementalPayment: currentReviewer.incrementalPayment,
                    type: currentReviewer.type,
                    isAIReviewer: isAI
                  }

                  onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
                }}
              >
                <option value='member'>Member Reviewer</option>
                <option value='ai'>AI Reviewer</option>
              </select>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Scorecard:</label>
            {readOnly ? (
              <span>
                {(() => {
                  const scorecard = scorecards.find(s => s.id === reviewer.scorecardId)
                  return scorecard ? `${scorecard.name} - ${scorecard.type} (${scorecard.challengeTrack}) v${scorecard.version}` : 'Not selected'
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
                    {scorecard.name} - {scorecard.type} ({scorecard.challengeTrack}) v{scorecard.version}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Phase:</label>
            {readOnly ? (
              <span>
                {(() => {
                  const phase = challenge.phases && challenge.phases.find(p => p.id === reviewer.phaseId)
                  return phase ? (phase.name || `Phase ${phase.phaseId || phase.id}`) : 'Not selected'
                })()}
              </span>
            ) : (
              <select
                value={reviewer.phaseId}
                onChange={(e) => this.updateReviewer(index, 'phaseId', e.target.value)}
              >
                <option value=''>Select Phase</option>
                {challenge.phases && challenge.phases
                  .filter(phase =>
                    phase.name &&
                    phase.name.toLowerCase().includes('review')
                  )
                  .map(phase => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name || `Phase ${phase.phaseId || phase.id}`}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        {!reviewer.isAIReviewer && (
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
                  onChange={(e) => this.updateReviewer(index, 'memberReviewerCount', parseInt(e.target.value))}
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Base Payment ($):</label>
              {readOnly ? (
                <span>${reviewer.basePayment || 0}</span>
              ) : (
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={reviewer.basePayment || 0}
                  onChange={(e) => this.updateReviewer(index, 'basePayment', parseFloat(e.target.value))}
                />
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

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Review Type:</label>
            {readOnly ? (
              <span>
                {(() => {
                  const typeMap = {
                    [REVIEW_OPPORTUNITY_TYPES.REGULAR_REVIEW]: 'Regular Review',
                    [REVIEW_OPPORTUNITY_TYPES.COMPONENT_DEV_REVIEW]: 'Component Dev Review',
                    [REVIEW_OPPORTUNITY_TYPES.SPEC_REVIEW]: 'Spec Review',
                    [REVIEW_OPPORTUNITY_TYPES.ITERATIVE_REVIEW]: 'Iterative Review',
                    [REVIEW_OPPORTUNITY_TYPES.SCENARIOS_REVIEW]: 'Scenarios Review'
                  }
                  return typeMap[reviewer.type] || 'Regular Review'
                })()}
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
      </div>
    )
  }

  render () {
    const { challenge, metadata, isLoading, readOnly = false } = this.props
    const { error } = this.state
    const { scorecards = [], defaultReviewers = [] } = metadata
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

    // Only show error if there's a real error, not just missing data
    if (error && !scorecards.length && !defaultReviewers.length) {
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
            {!readOnly && (
              <div className={styles.description}>
                Configure how this challenge will be reviewed. You can add multiple reviewers including AI and member reviewers.
              </div>
            )}

            {!readOnly && reviewers.length === 0 && (
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

            {readOnly && reviewers.length === 0 && (
              <div className={styles.noReviewers}>
                <p>No reviewers configured for this challenge.</p>
              </div>
            )}

            {reviewers.map((reviewer, index) =>
              this.renderReviewerForm(reviewer, index)
            )}

            {reviewers.length > 0 && (
              <div className={styles.summary}>
                <h4>Review Summary</h4>
                <div className={styles.summaryRow}>
                  <span>Total Member Reviewers:</span>
                  <span>{reviewers.filter(r => !r.isAIReviewer).reduce((sum, r) => sum + (r.memberReviewerCount || 0), 0)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total AI Reviewers:</span>
                  <span>{reviewers.filter(r => r.isAIReviewer).length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total Review Cost:</span>
                  <span>${reviewers.filter(r => !r.isAIReviewer).reduce((sum, r) => {
                    const base = r.basePayment || 0
                    const count = r.memberReviewerCount || 1
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
    defaultReviewers: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  readOnly: PropTypes.bool,
  loadScorecards: PropTypes.func.isRequired,
  loadDefaultReviewers: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  metadata: state.challenges.metadata,
  isLoading: state.challenges.isLoading
})

const mapDispatchToProps = {
  loadScorecards,
  loadDefaultReviewers
}

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeReviewerField)
