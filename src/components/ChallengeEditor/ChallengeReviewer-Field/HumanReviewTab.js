import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { OutlineButton } from '../../Buttons'
import { REVIEW_OPPORTUNITY_TYPE_LABELS, REVIEW_OPPORTUNITY_TYPES, VALIDATION_VALUE_TYPE, DES_TRACK_ID } from '../../../config/constants'
import styles from './ChallengeReviewer-Field.module.scss'
import { validateValue } from '../../../util/input-check'
import AssignedMemberField from '../AssignedMember-Field'
import { isEqual } from 'lodash'
import { getResourceRoleByName } from '../../../util/tc'

class HumanReviewTab extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      assignedMembers: {}
    }

    this.addReviewer = this.addReviewer.bind(this)
    this.removeReviewer = this.removeReviewer.bind(this)
    this.updateReviewer = this.updateReviewer.bind(this)
    this.renderReviewerForm = this.renderReviewerForm.bind(this)
    this.handleApplyDefault = this.handleApplyDefault.bind(this)
    this.getMissingRequiredPhases = this.getMissingRequiredPhases.bind(this)
    this.getRoleNameForReviewer = this.getRoleNameForReviewer.bind(this)
    this.onAssignmentChange = this.onAssignmentChange.bind(this)
    this.syncAssignmentsOnCountChange = this.syncAssignmentsOnCountChange.bind(this)
    this.handlePhaseChangeWithReassign = this.handlePhaseChangeWithReassign.bind(this)
    this.handleToggleShouldOpen = this.handleToggleShouldOpen.bind(this)
    this.updateAssignedMembers = this.updateAssignedMembers.bind(this)
    this.doUpdateAssignedMembers = true
  }

  componentDidMount () {
    const { metadata, challenge, challengeResources } = this.props
    if (challenge && challenge.id && challengeResources) {
      this.updateAssignedMembers(challengeResources, challenge, metadata)
    }
  }

  componentDidUpdate (prevProps) {
    const { challenge: prevChallenge } = prevProps
    const { metadata, challenge, challengeResources } = this.props

    const reviewersChanged = (() => {
      if (!prevChallenge || !challenge) return false
      const prev = (prevChallenge.reviewers || []).filter(r => !this.isAIReviewer(r))
      const curr = (challenge.reviewers || []).filter(r => !this.isAIReviewer(r))
      if (prev.length !== curr.length) return true
      return prev.some((p, i) => {
        const { scorecardId: prevScorecardId, ...prevRest } = p
        const currentReviewer = curr[i] || {}
        const { scorecardId: currScorecardId, ...currRest } = currentReviewer
        if (JSON.stringify(currRest) !== JSON.stringify(prevRest)) {
          return true
        }
      })
    })()

    if (challenge && this.doUpdateAssignedMembers && reviewersChanged) {
      this.updateAssignedMembers(challengeResources, challenge, metadata, prevChallenge)
    }
  }

  isAIReviewer (reviewer) {
    return reviewer && (
      (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
      (reviewer.isMemberReview === false)
    )
  }

  isPublicOpportunityOpen (reviewer) {
    return reviewer && reviewer.shouldOpenOpportunity === true
  }

  getMissingRequiredPhases () {
    const { challenge } = this.props
    const requiredPhases = []
    const memberReviewers = (challenge.reviewers || []).filter(r => !this.isAIReviewer(r))

    if (challenge && challenge.phases) {
      for (const phase of challenge.phases) {
        const phaseName = (phase.name || '').toLowerCase()
        const hasReviewPhase = phaseName.includes('review')
        if (hasReviewPhase) {
          const hasReviewer = memberReviewers.some(r => (r.phaseId === phase.id || r.phaseId === phase.phaseId))
          if (!hasReviewer) {
            requiredPhases.push(phase.name || phase.phaseId || phase.id)
          }
        }
      }
    }

    return requiredPhases
  }

  getRoleNameForReviewer (reviewer) {
    const { challenge } = this.props
    const phase = (challenge.phases || []).find(p => (p.id === reviewer.phaseId) || (p.phaseId === reviewer.phaseId))
    const phaseName = (phase && phase.name) ? phase.name.toLowerCase() : ''

    const normalizedPhaseName = phaseName.replace(/[-\s]/g, '')

    if (phaseName.includes('iterative review') || normalizedPhaseName === 'iterativereview') return 'Iterative Reviewer'
    if (normalizedPhaseName === 'approval') return 'Approver'
    if (normalizedPhaseName === 'checkpointscreening') return 'Checkpoint Screener'
    if (normalizedPhaseName === 'checkpointreview') return 'Checkpoint Reviewer'
    if (normalizedPhaseName === 'screening') return 'Screener'
    return 'Reviewer'
  }

  async onAssignmentChange (reviewerIndex, slotIndex, option) {
    const { challenge, metadata = {}, replaceResourceInRole } = this.props
    // reviewerIndex is the filtered human reviewer index
    const humanReviewers = (challenge.reviewers || []).filter(r => !this.isAIReviewer(r))
    const reviewer = humanReviewers[reviewerIndex]
    if (!reviewer || this.isAIReviewer(reviewer)) return

    const currentAssignedMembers = this.state.assignedMembers[reviewerIndex] || []
    const roleName = this.getRoleNameForReviewer(reviewer)
    const role = getResourceRoleByName(metadata.resourceRoles || [], roleName)
    const newAssigned = [...currentAssignedMembers]
    newAssigned[slotIndex] = option && {
      handle: option.label,
      userId: option.value,
      roleId: role.id
    }

    const newAssignedMembers = { ...this.state.assignedMembers }
    newAssignedMembers[reviewerIndex] = newAssigned
    this.setState({ assignedMembers: newAssignedMembers })

    if (option) {
      await this.createOrReplaceResource(
        option,
        reviewer,
        role.id,
        currentAssignedMembers[slotIndex],
        challenge
      )
    } else if (currentAssignedMembers[slotIndex]) {
      const oldOption = currentAssignedMembers[slotIndex]
      await replaceResourceInRole(
        challenge.id,
        oldOption.roleId,
        null,
        oldOption.handle
      )
    }
  }

  async createOrReplaceResource (option, reviewer, roleId, oldOption, challenge) {
    const { replaceResourceInRole, createResource } = this.props

    if (oldOption) {
      await replaceResourceInRole(
        challenge.id,
        oldOption.roleId,
        option.label,
        oldOption.handle
      )
    } else {
      await createResource(challenge.id, roleId, option.label)
    }
  }

  async syncAssignmentsOnCountChange (reviewerIndex, newCount) {
    const currentAssigned = this.state.assignedMembers[reviewerIndex] || []
    const diff = newCount - currentAssigned.length

    if (diff > 0) {
      // Add empty slots
      const newAssigned = [...currentAssigned, ...Array(diff).fill(null)]
      const newAssignedMembers = { ...this.state.assignedMembers }
      newAssignedMembers[reviewerIndex] = newAssigned
      this.setState({ assignedMembers: newAssignedMembers })
    } else if (diff < 0) {
      // Remove slots (delete resources)
      const { deleteResource } = this.props
      const removedMembers = currentAssigned.slice(newCount)
      const newAssigned = currentAssigned.slice(0, newCount)

      for (const member of removedMembers) {
        if (member && member.resourceId) {
          await deleteResource(member.resourceId)
        }
      }

      const newAssignedMembers = { ...this.state.assignedMembers }
      newAssignedMembers[reviewerIndex] = newAssigned
      this.setState({ assignedMembers: newAssignedMembers })
    }
  }

  async handlePhaseChangeWithReassign (reviewerIndex, newPhaseId) {
    this.updateReviewer(reviewerIndex, 'phaseId', newPhaseId)
    // Reassignment would happen here if needed
  }

  async handleToggleShouldOpen (reviewerIndex, nextValue) {
    this.updateReviewer(reviewerIndex, 'shouldOpenOpportunity', nextValue)
  }

  updateAssignedMembers (challengeResources, challenge, metadata, prevChallenge = null) {
    const memberReviewers = (challenge.reviewers || []).filter(r => !this.isAIReviewer(r))
    const newAssignedMembers = {}

    memberReviewers.forEach((reviewer, reviewerIndex) => {
      const roleName = this.getRoleNameForReviewer(reviewer)
      const role = getResourceRoleByName(metadata.resourceRoles || [], roleName)
      const resourceRoleId = role && role.id

      const matchingResources = challengeResources
        ? challengeResources.filter(resource => resource.roleId === resourceRoleId)
        : []

      newAssignedMembers[reviewerIndex] = Array(parseInt(reviewer.memberReviewerCount) || 1)
        .fill(null)
        .map((_, i) => {
          const matchingResource = matchingResources[i]
          if (matchingResource) {
            return {
              handle: matchingResource.memberHandle,
              userId: matchingResource.memberId,
              roleId: matchingResource.roleId,
              resourceId: matchingResource.id
            }
          }
          return null
        })
    })

    this.doUpdateAssignedMembers = true
    if (!isEqual(newAssignedMembers, this.state.assignedMembers)) {
      this.setState({ assignedMembers: newAssignedMembers })
    }
  }

  addReviewer () {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []

    const { metadata = {} } = this.props
    const { defaultReviewers = [] } = metadata

    const defaultReviewer = defaultReviewers && defaultReviewers.length > 0 ? defaultReviewers[0] : null

    const reviewPhases = challenge.phases && challenge.phases.filter(phase =>
      phase.name && phase.name.toLowerCase().includes('review')
    )
    const firstReviewPhase = reviewPhases && reviewPhases.length > 0 ? reviewPhases[0] : null

    const fallbackPhase = !firstReviewPhase && challenge.phases && challenge.phases.length > 0
      ? challenge.phases[0]
      : null

    let defaultPhaseId = ''
    if (defaultReviewer && defaultReviewer.phaseId) {
      defaultPhaseId = defaultReviewer.phaseId
    } else if (firstReviewPhase) {
      defaultPhaseId = firstReviewPhase.phaseId || firstReviewPhase.id
    } else if (fallbackPhase) {
      defaultPhaseId = fallbackPhase.phaseId || fallbackPhase.id
    }

    const newReviewer = {
      scorecardId: (defaultReviewer && defaultReviewer.scorecardId) || '',
      isMemberReview: true,
      phaseId: defaultPhaseId,
      fixedAmount: (defaultReviewer && defaultReviewer.fixedAmount) || 0,
      baseCoefficient: (defaultReviewer && defaultReviewer.baseCoefficient) || '0.13',
      incrementalCoefficient: (defaultReviewer && defaultReviewer.incrementalCoefficient) || 0.05,
      type: (defaultReviewer && defaultReviewer.opportunityType) || REVIEW_OPPORTUNITY_TYPES.REGULAR_REVIEW,
      shouldOpenOpportunity: false,
      memberReviewerCount: (defaultReviewer && defaultReviewer.memberReviewerCount) || 1
    }

    if (this.state.error) {
      this.setState({ error: null })
    }

    const updatedReviewers = currentReviewers.concat([newReviewer])
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  removeReviewer (index) {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []

    // Map the human reviewer index to the actual index in the full reviewers array
    const humanReviewers = currentReviewers.filter(r => !this.isAIReviewer(r))
    const reviewerToRemove = humanReviewers[index]
    const actualIndex = currentReviewers.indexOf(reviewerToRemove)

    if (actualIndex !== -1) {
      const updatedReviewers = currentReviewers.filter((_, i) => i !== actualIndex)
      onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
    }
  }

  updateReviewer (index, field, value) {
    const { challenge, onUpdateReviewers } = this.props
    const currentReviewers = challenge.reviewers || []
    const updatedReviewers = currentReviewers.slice()
    const fieldUpdate = { [field]: value }

    // Map the human reviewer index to the actual index in the full reviewers array
    const humanReviewers = currentReviewers.filter(r => !this.isAIReviewer(r))
    const reviewerToUpdate = humanReviewers[index]
    const actualIndex = currentReviewers.indexOf(reviewerToUpdate)

    if (actualIndex === -1) return

    if (field === 'phaseId') {
      const defaultReviewer = this.findDefaultReviewer(value) || updatedReviewers[actualIndex]
      Object.assign(fieldUpdate, {
        fixedAmount: defaultReviewer.fixedAmount,
        baseCoefficient: defaultReviewer.baseCoefficient,
        incrementalCoefficient: defaultReviewer.incrementalCoefficient
      })
    }

    if (field === 'memberReviewerCount') {
      const newCount = parseInt(value) || 1
      this.syncAssignmentsOnCountChange(index, Math.max(1, newCount))
    }

    updatedReviewers[actualIndex] = Object.assign({}, updatedReviewers[actualIndex], fieldUpdate)
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  findDefaultReviewer (phaseId) {
    const { challenge, metadata = {} } = this.props
    const { defaultReviewers = [] } = metadata

    if (!challenge || !challenge.trackId || !challenge.typeId) {
      return null
    }

    return phaseId ? defaultReviewers.find(dr => dr.phaseId === phaseId) : defaultReviewers[0]
  }

  validateReviewer (reviewer) {
    const errors = {}

    if (!reviewer.scorecardId) {
      errors.scorecardId = 'Scorecard is required'
    }

    const memberCount = parseInt(reviewer.memberReviewerCount) || 1
    if (memberCount < 1 || !Number.isInteger(memberCount)) {
      errors.memberReviewerCount = 'Number of reviewers must be a positive integer'
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
    const { scorecards = [] } = metadata
    const validationErrors = challenge.submitTriggered ? this.validateReviewer(reviewer) : {}
    const selectedPhase = challenge.phases.find(p => p.phaseId === reviewer.phaseId)
    const isDesignChallenge = challenge && challenge.trackId === DES_TRACK_ID
    const normalize = (value) => (value || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\bphase\b$/, '')
      .replace(/[-_\s]/g, '')

    const filteredScorecards = scorecards.filter(item => {
      if (!selectedPhase || !selectedPhase.name || !item || !item.type) {
        return false
      }

      const normalizedType = normalize(item.type)
      const normalizedPhaseName = normalize(selectedPhase.name)

      if (!normalizedType || !normalizedPhaseName) {
        return false
      }

      return normalizedType === normalizedPhaseName
    })

    return (
      <div key={`reviewer-${index}`} className={styles.reviewerForm}>
        <div className={styles.reviewerHeader}>
          <h4>Reviewer {index + 1}</h4>
          {!readOnly && (
            <OutlineButton
              minWidth
              text='Remove'
              type='danger'
              onClick={() => this.removeReviewer(index)}
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
                onChange={(e) => this.handlePhaseChangeWithReassign(index, e.target.value)}
              >
                <option value=''>Select Phase</option>
                {(challenge.phases || [])
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

                    const assignedPhaseIds = new Set(
                      (challenge.reviewers || [])
                        .filter((r, i) => i !== index && (r.isMemberReview !== false))
                        .map(r => r.phaseId)
                        .filter(id => id !== undefined && id !== null)
                    )

                    if (!!reviewer.isMemberReview && assignedPhaseIds.has(phase.phaseId || phase.id) && !isCurrentlySelected) {
                      return false
                    }

                    return (
                      isReviewPhase ||
                      isScreeningPhase ||
                      isApprovalPhase ||
                      isPostMortemPhase ||
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
        </div>

        <div className={styles.formRow}>
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
                {filteredScorecards.map(scorecard => (
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
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Review Type:</label>
            {readOnly ? (
              <span>
                {REVIEW_OPPORTUNITY_TYPE_LABELS[reviewer.type] || 'Regular Review'}
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
          {!isDesignChallenge && (
            <div className={cn(styles.formGroup, styles.mtop)}>
              <label>
                <input
                  type='checkbox'
                  disabled={readOnly}
                  checked={this.isPublicOpportunityOpen(reviewer)}
                  onChange={(e) => {
                    const next = !!e.target.checked
                    this.handleToggleShouldOpen(index, next)
                    this.updateReviewer(index, 'shouldOpenOpportunity', next)
                  }}
                  style={{ marginRight: '8px' }}
                />
                Open public review opportunity
              </label>
            </div>
          )}
        </div>

        {!this.isAIReviewer(reviewer) && (isDesignChallenge || !this.isPublicOpportunityOpen(reviewer)) && (
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Assign member(s):</label>
              {Array.from({ length: parseInt(reviewer.memberReviewerCount || 1) }, (_, i) => {
                const assigned = (this.state.assignedMembers[index] || [])[i] || null
                return (
                  <div key={`assign-${index}-${i}`} style={{ marginBottom: '10px' }}>
                    <AssignedMemberField
                      challenge={challenge}
                      readOnly={readOnly}
                      showAssignToMe={false}
                      label={`Member ${i + 1}`}
                      assignedMemberDetails={assigned}
                      onChange={(option) => this.onAssignmentChange(index, i, option)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  getFirstPlacePrizeValue (challenge) {
    const prizeSets = challenge.prizeSets || []
    const placementPrizeSet = prizeSets.find(p => p.type === 'PLACEMENT')
    if (placementPrizeSet && placementPrizeSet.prizes && placementPrizeSet.prizes.length > 0) {
      return parseFloat(placementPrizeSet.prizes[0].value) || 0
    }
    return 0
  }

  render () {
    const { challenge, isLoading, readOnly = false } = this.props
    const { error } = this.state
    const reviewers = (challenge.reviewers || []).filter(r => !this.isAIReviewer(r))
    const firstPlacePrize = this.getFirstPlacePrizeValue(challenge)
    const estimatedSubmissionsCount = 2

    const reviewersCost = reviewers
      .reduce((sum, r) => {
        const fixedAmount = parseFloat(r.fixedAmount || 0)
        const baseCoefficient = parseFloat(r.baseCoefficient || 0)
        const incrementalCoefficient = parseFloat(r.incrementalCoefficient || 0)
        const reviewerCost = fixedAmount + (baseCoefficient + incrementalCoefficient * estimatedSubmissionsCount) * firstPlacePrize

        const count = parseInt(r.memberReviewerCount) || 1
        return sum + reviewerCost * count
      }, 0)
      .toFixed(2)

    if (isLoading) {
      return <div className={styles.loading}>Loading...</div>
    }

    return (
      <div className={styles.tabContent}>
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
            Configure member reviewers for this challenge. Set up scorecards and assign team members.
          </div>
        )}

        {!readOnly && reviewers.length === 0 && (
          <div className={styles.noReviewers}>
            <p>No member reviewers configured. Click "Add Member Reviewer" to get started.</p>
            {this.findDefaultReviewer() && (
              <div className={styles.defaultReviewerNote}>
                <p><strong>Note:</strong> Default reviewer configuration is available for this track and type combination.</p>
                <button
                  className={styles.applyDefaultBtn}
                  onClick={this.handleApplyDefault}
                >
                  Apply Default Configuration
                </button>
              </div>
            )}
          </div>
        )}

        {readOnly && reviewers.length === 0 && (
          <div className={styles.noReviewers}>
            <p>No member reviewers configured for this challenge.</p>
          </div>
        )}

        {reviewers.length > 0 && reviewers.map((reviewer, index) =>
          this.renderReviewerForm(reviewer, index)
        )}

        {reviewers.length > 0 && (
          <div className={styles.summary}>
            <h4>Review Summary</h4>
            <div className={styles.summaryRow}>
              <span>Total Member Reviewers:</span>
              <span>{reviewers.reduce((sum, r) => sum + (parseInt(r.memberReviewerCount) || 1), 0)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated Review Cost:</span>
              <span>
                ${reviewersCost}
              </span>
            </div>
          </div>
        )}

        {!readOnly && (
          <div className={styles.addButton}>
            <button
              className={styles.addReviewerBtn}
              onClick={this.addReviewer}
            >
              Add Member Reviewer
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

HumanReviewTab.propTypes = {
  challenge: PropTypes.object.isRequired,
  onUpdateReviewers: PropTypes.func.isRequired,
  metadata: PropTypes.shape({
    scorecards: PropTypes.array,
    defaultReviewers: PropTypes.array,
    resourceRoles: PropTypes.array,
    challengeTracks: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  readOnly: PropTypes.bool,
  replaceResourceInRole: PropTypes.func.isRequired,
  createResource: PropTypes.func.isRequired,
  deleteResource: PropTypes.func.isRequired,
  challengeResources: PropTypes.array.isRequired
}

export default HumanReviewTab
