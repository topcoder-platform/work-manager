import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { axiosInstance as axios } from '../../../services/axiosWithAuth'
import cn from 'classnames'
import { PrimaryButton, OutlineButton } from '../../Buttons'
import { REVIEW_OPPORTUNITY_TYPES } from '../../../config/constants'
import styles from './ChallengeReviewer-Field.module.scss'

class ChallengeReviewerField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      scorecards: [],
      defaultReviewers: [],
      isLoadingScorecards: false,
      isLoadingDefaults: false,
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

  async loadScorecards () {
    this.setState({ isLoadingScorecards: true, error: null })
    try {
      const { challenge } = this.props
      // Build query parameters for the scorecard API
      const params = {
        perPage: 100, // Get more scorecards to ensure we have enough
        page: 1
      }

      // Add challenge track if available
      if (challenge.trackId) {
        // Map track ID to track name for the API
        const trackMapping = {
          '1': 'DEVELOPMENT',
          '2': 'DESIGN',
          '3': 'DATA_SCIENCE',
          '4': 'QA'
        }
        const trackName = trackMapping[challenge.trackId] || 'DEVELOPMENT'
        params.challengeTrack = trackName
      }

      // Fetch scorecards from review-api-v6
      const response = await axios.get('https://api.topcoder-dev.com/v6/scorecards', {
        params
      })

      if (response.status === 200) {
        const data = response.data
        const scorecards = data.scoreCards || []
        this.setState({ scorecards })
      } else {
        throw new Error('Failed to load scorecards')
      }
    } catch (error) {
      console.error('Error loading scorecards:', error)
      // Use mock data for development/testing
      // const mockScorecards = [
      //   { id: 'scorecard-1', name: 'Standard Development Review' },
      //   { id: 'scorecard-2', name: 'Design Review' },
      //   { id: 'scorecard-3', name: 'Data Science Review' },
      //   { id: 'scorecard-4', name: 'QA Review' }
      // ]
      this.setState({ scorecards: [] })
    } finally {
      this.setState({ isLoadingScorecards: false })
    }
  }

  async loadDefaultReviewers () {
    this.setState({ isLoadingDefaults: true, error: null })
    try {
      const response = await axios.get('https://api.topcoder-dev.com/v6/challenge/default-reviewers')
      if (response.status === 200) {
        const data = response.data
        this.setState({ defaultReviewers: data })
      } else {
        throw new Error('Failed to load default reviewers')
      }
    } catch (error) {
      console.error('Error loading default reviewers:', error)
      // Use mock data for development/testing
      const mockDefaultReviewers = [
        {
          id: 'default-1',
          typeId: '1',
          trackId: '1',
          scorecardId: 'scorecard-1',
          isMemberReview: true,
          memberReviewerCount: 2,
          phaseId: 'aa5a3f78-79e0-4bf7-93ff-b11e8f5b398b',
          basePayment: 100,
          incrementalPayment: 50,
          opportunityType: 'REGULAR_REVIEW',
          isAIReviewer: false
        },
        {
          id: 'default-2',
          typeId: '2',
          trackId: '1',
          scorecardId: 'scorecard-1',
          isMemberReview: true,
          memberReviewerCount: 1,
          phaseId: '003a4b14-de5d-43fc-9e35-835dbeb6af1f',
          basePayment: 75,
          incrementalPayment: 25,
          opportunityType: 'REGULAR_REVIEW',
          isAIReviewer: false
        }
      ]
      this.setState({ defaultReviewers: mockDefaultReviewers })
    } finally {
      this.setState({ isLoadingDefaults: false })
    }
  }

  addReviewer () {
    const { challenge, onUpdateOthers } = this.props
    const currentReviewers = challenge.reviewers || []

    // Create a new default reviewer based on track and type
    const defaultReviewer = this.findDefaultReviewer()

    // Get the first available phase if phases exist
    const firstPhase = challenge.phases && challenge.phases.length > 0 ? challenge.phases[0] : null

    const newReviewer = {
      id: 'temp-' + Date.now(),
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
    onUpdateOthers({ field: 'reviewers', value: updatedReviewers })
  }

  removeReviewer (index) {
    const { challenge, onUpdateOthers } = this.props
    const currentReviewers = challenge.reviewers || []
    const updatedReviewers = currentReviewers.filter((_, i) => i !== index)
    onUpdateOthers({ field: 'reviewers', value: updatedReviewers })
  }

  updateReviewer (index, field, value) {
    const { challenge, onUpdateOthers } = this.props
    const currentReviewers = challenge.reviewers || []
    const updatedReviewers = currentReviewers.slice()
    const fieldUpdate = {}
    fieldUpdate[field] = value
    updatedReviewers[index] = Object.assign({}, updatedReviewers[index], fieldUpdate)
    onUpdateOthers({ field: 'reviewers', value: updatedReviewers })
  }

  findDefaultReviewer () {
    const { challenge } = this.props
    const { defaultReviewers } = this.state

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
    const { challenge } = this.props
    const { scorecards } = this.state
    const validationErrors = this.validateReviewer(reviewer)

    return (
      <div key={reviewer.id} className={styles.reviewerForm}>
        <div className={styles.reviewerHeader}>
          <h4>Reviewer {index + 1}</h4>
          <OutlineButton
            text='Remove'
            type='danger'
            onClick={() => this.removeReviewer(index)}
          />
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
            <select
              value={reviewer.isAIReviewer ? 'ai' : 'member'}
              onChange={(e) => {
                const isAI = e.target.value === 'ai'
                this.updateReviewer(index, 'isAIReviewer', isAI)
                this.updateReviewer(index, 'isMemberReview', !isAI)
              }}
            >
              <option value='member'>Member Reviewer</option>
              <option value='ai'>AI Reviewer</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Scorecard:</label>
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
          </div>

          <div className={styles.formGroup}>
            <label>Phase:</label>
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
          </div>
        </div>

        {!reviewer.isAIReviewer && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Number of Reviewers:</label>
              <input
                type='number'
                min='1'
                value={reviewer.memberReviewerCount || 1}
                onChange={(e) => this.updateReviewer(index, 'memberReviewerCount', parseInt(e.target.value))}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Base Payment ($):</label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={reviewer.basePayment || 0}
                onChange={(e) => this.updateReviewer(index, 'basePayment', parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Incremental Payment ($):</label>
              <input
                type='number'
                min='0'
                step='0.01'
                value={reviewer.incrementalPayment || 0}
                onChange={(e) => this.updateReviewer(index, 'incrementalPayment', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Review Type:</label>
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
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { challenge } = this.props
    const { isLoadingScorecards, isLoadingDefaults, error } = this.state
    const reviewers = challenge.reviewers || []

    if (isLoadingScorecards || isLoadingDefaults) {
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
    if (error && !this.state.scorecards.length && !this.state.defaultReviewers.length) {
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
            <div className={styles.description}>
              Configure how this challenge will be reviewed. You can add multiple reviewers including AI and member reviewers.
            </div>

            {reviewers.length === 0 && (
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
                    const incremental = r.incrementalPayment || 0
                    const count = r.memberReviewerCount || 1
                    return sum + base + (incremental * (count - 1))
                  }, 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className={styles.addButton}>
              <PrimaryButton
                text='Add Reviewer'
                type='info'
                onClick={this.addReviewer}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
}

ChallengeReviewerField.propTypes = {
  challenge: PropTypes.object.isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default ChallengeReviewerField
