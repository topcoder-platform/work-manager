import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cn from 'classnames'
import { loadScorecards, loadDefaultReviewers, loadWorkflows, replaceResourceInRole, createResource, deleteResource } from '../../../actions/challenges'
import styles from './ChallengeReviewer-Field.module.scss'
import HumanReviewTab from './HumanReviewTab'
import { AiReviewTab } from './AiReviewerTab'
import ReviewSummary from './ReviewSummary'

// Keep track filters aligned with the scorecards API regardless of legacy values
const SCORECARD_TRACK_ALIASES = {
  DEVELOP: 'DEVELOPMENT',
  DEV: 'DEVELOPMENT',
  QA: 'QUALITY_ASSURANCE',
  QUALITY_ASSURANCE: 'QUALITY_ASSURANCE',
  QUALITYASSURANCE: 'QUALITY_ASSURANCE',
  DES: 'DESIGN',
  DESIGN: 'DESIGN',
  DS: 'DATA_SCIENCE',
  DATA_SCIENCE: 'DATA_SCIENCE',
  DATASCIENCE: 'DATA_SCIENCE'
}

const normalizeTrackForScorecards = (challenge, metadata) => {
  const normalize = (value) => {
    if (!value) return null
    const normalized = value.toString().trim().toUpperCase().replace(/\s+/g, '_')
    return SCORECARD_TRACK_ALIASES[normalized] || normalized
  }

  if (!challenge) return null

  if (challenge.trackId && metadata && Array.isArray(metadata.challengeTracks)) {
    const trackFromMetadata = metadata.challengeTracks.find(t => t.id === challenge.trackId)
    if (trackFromMetadata) {
      return normalize(trackFromMetadata.track || trackFromMetadata.name || trackFromMetadata.abbreviation)
    }
  }

  const { track } = challenge
  if (typeof track === 'string') {
    return normalize(track)
  }
  if (track && typeof track === 'object') {
    return normalize(track.track || track.name || track.abbreviation)
  }

  return null
}

class ChallengeReviewerField extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      activeTab: 'human' // 'human' or 'ai'
    }

    this.loadScorecards = this.loadScorecards.bind(this)
    this.loadDefaultReviewers = this.loadDefaultReviewers.bind(this)
    this.loadWorkflows = this.loadWorkflows.bind(this)
  }

  componentDidMount () {
    if (this.props.challenge.track || this.props.challenge.type) {
      this.loadScorecards()
    }
    this.loadDefaultReviewers()
    this.loadWorkflows()
  }

  componentDidUpdate (prevProps) {
    const { challenge } = this.props
    const prevChallenge = prevProps.challenge

    if (challenge && prevChallenge &&
        (challenge.type !== prevChallenge.type || challenge.track !== prevChallenge.track)) {
      if (challenge.track || challenge.type) {
        this.loadScorecards()
      }
    }

    if (challenge && prevChallenge &&
        (challenge.typeId !== prevChallenge.typeId || challenge.trackId !== prevChallenge.trackId)) {
      this.loadDefaultReviewers()
    }
  }

  loadScorecards () {
    const { challenge, loadScorecards, metadata } = this.props

    const filters = {
      status: 'ACTIVE'
    }

    // Add challenge track if available
    const normalizedTrack = normalizeTrackForScorecards(challenge, metadata)
    if (normalizedTrack) {
      filters.challengeTrack = normalizedTrack
    }

    // Add challenge type if available
    if (challenge.type) {
      if (typeof challenge.type === 'string') {
        filters.challengeType = challenge.type
      } else if (challenge.type.name) {
        filters.challengeType = challenge.type.name
      }
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

  isAIReviewer (reviewer) {
    return reviewer && (
      (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
      (reviewer.isMemberReview === false)
    )
  }

  render () {
    const { challenge, metadata = {}, isLoading, readOnly = false } = this.props
    const { error, activeTab } = this.state
    const { scorecards = [], defaultReviewers = [], workflows = [] } = metadata

    // Count reviewers by type
    const allReviewers = challenge.reviewers || []
    const humanReviewersCount = allReviewers.filter(r => !this.isAIReviewer(r)).length
    const aiReviewersCount = allReviewers.filter(r => this.isAIReviewer(r)).length

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
        {!readOnly && (
          <div className={styles.row}>
            <div className={cn(styles.field, styles.col1)}>
              <label>Review Configuration :</label>
            </div>
            <div className={cn(styles.field, styles.col2)}>
              <div className={styles.tabsContainer}>
                <div className={styles.tabsHeader}>
                  <button
                    className={cn(styles.tabButton, { [styles.active]: activeTab === 'human' })}
                    onClick={() => this.setState({ activeTab: 'human' })}
                  >
                  👥 Human Review ({humanReviewersCount})
                  </button>
                  <button
                    className={cn(styles.tabButton, { [styles.active]: activeTab === 'ai' })}
                    onClick={() => this.setState({ activeTab: 'ai' })}
                  >
                  🤖 AI Review ({aiReviewersCount})
                  </button>
                </div>

                <div className={cn(activeTab !== 'human' && styles.hidden)}>
                  <HumanReviewTab
                    challenge={challenge}
                    metadata={metadata}
                    isLoading={isLoading}
                    readOnly={readOnly}
                    onUpdateReviewers={(update) => this.props.onUpdateReviewers(update)}
                    replaceResourceInRole={this.props.replaceResourceInRole}
                    createResource={this.props.createResource}
                    deleteResource={this.props.deleteResource}
                    challengeResources={this.props.challengeResources}
                  />
                </div>

                <div className={cn(activeTab !== 'ai' && styles.hidden)}>
                  <AiReviewTab
                    challenge={challenge}
                    metadata={metadata}
                    isLoading={isLoading}
                    readOnly={readOnly}
                    onUpdateReviewers={(update) => this.props.onUpdateReviewers(update)}
                  />
                </div>
              </div>
              {error && !isLoading && (
                <div className={cn(styles.fieldError, styles.error)}>
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Summary Section */}
        {readOnly && (challenge.reviewers && challenge.reviewers.length > 0) && (
          <div className={styles.row}>
            <div className={cn(styles.field, styles.full)}>
              <ReviewSummary
                challenge={challenge}
                metadata={metadata}
              />
            </div>
          </div>
        )}
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
    resourceRoles: PropTypes.array,
    challengeTracks: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  readOnly: PropTypes.bool,
  loadScorecards: PropTypes.func.isRequired,
  loadDefaultReviewers: PropTypes.func.isRequired,
  loadWorkflows: PropTypes.func.isRequired,
  replaceResourceInRole: PropTypes.func.isRequired,
  createResource: PropTypes.func.isRequired,
  deleteResource: PropTypes.func.isRequired,
  challengeResources: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
  metadata: state.challenges.metadata || {},
  isLoading: state.challenges.isLoading,
  challengeResources: state.challenges.challengeResources
})

const mapDispatchToProps = {
  loadScorecards,
  loadDefaultReviewers,
  loadWorkflows,
  replaceResourceInRole,
  createResource,
  deleteResource
}

export default connect(mapStateToProps, mapDispatchToProps)(ChallengeReviewerField)
