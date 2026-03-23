import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { REVIEW_APP_URL, REVIEW_OPPORTUNITY_TYPE_LABELS } from '../../../../config/constants'
import { isAIReviewer } from '../AiReviewerTab/utils'
import calculateReviewCost from './calcReviewCost'
import { fetchAIReviewConfigByChallenge } from '../../../../services/aiReviewConfigs'
import { getResourceRoleByName, getRoleNameForReviewer } from '../../../../util/tc'
import styles from './ReviewSummary.module.scss'

const ReviewSummary = ({
  challenge,
  metadata = {},
  challengeResources = [],
  readOnly = false
}) => {
  const [aiConfiguration, setAiConfiguration] = useState(null)
  const [, setIsLoadingAIConfig] = useState(false)

  useEffect(() => {
    if (challenge && challenge.id) {
      setIsLoadingAIConfig(true)
      fetchAIReviewConfigByChallenge(challenge.id)
        .then(config => {
          setAiConfiguration(config)
          setIsLoadingAIConfig(false)
        })
        .catch(error => {
          console.error('Error fetching AI review config:', error)
          setIsLoadingAIConfig(false)
        })
    }
  }, [challenge && challenge.id])

  if (!challenge) return null

  const { scorecards = [], workflows = [] } = metadata

  // Filter human and AI reviewers
  const allReviewers = challenge.reviewers || []
  const humanReviewers = allReviewers.filter(r => !isAIReviewer(r))
  const aiReviewers = allReviewers.filter(r => isAIReviewer(r))

  // Calculate review cost based on human reviewers (delegated to util)

  // Get scorecard name from ID
  const getScorecardName = (scorecardId) => {
    if (!scorecardId) return 'Not selected'
    const scorecard = scorecards.find(s => s.id === scorecardId)
    return scorecard ? scorecard.name : 'Unknown Scorecard'
  }

  // Get phase name
  const getPhaseName = (phaseId) => {
    if (!phaseId || !challenge.phases) return '-'
    const phase = challenge.phases.find(p => (p.id === phaseId || p.phaseId === phaseId))
    return phase ? phase.name : '-'
  }

  const getAssignedMembersForReviewer = useCallback((reviewer) => {
    const reviewerCount = parseInt(reviewer.memberReviewerCount) || 1
    const roleName = getRoleNameForReviewer(reviewer, challenge.phases)
    const role = getResourceRoleByName(metadata.resourceRoles || [], roleName)
    const resourceRoleId = role && role.id

    if (!resourceRoleId) return ''

    const matchingResources = challengeResources
      .filter(resource => resource.roleId === resourceRoleId)
      .slice(0, reviewerCount)

    return matchingResources
      .map(resource => resource.memberHandle)
      .filter(Boolean)
      .join(', ')
  }, [challenge, metadata, challengeResources])

  // Check if AI review is configured
  const hasAIConfigWorkflows = aiConfiguration && aiConfiguration.workflows && (aiConfiguration.workflows.length > 0)
  const hasLegacyAIReviewers = aiReviewers.length > 0
  const hasAIConfiguration = hasAIConfigWorkflows || hasLegacyAIReviewers

  // Check if AI mode is gating or only
  const isAIOnlyMode = aiConfiguration && aiConfiguration.mode === 'AI_ONLY'
  const isAIGatingMode = aiConfiguration && aiConfiguration.mode === 'AI_GATING'

  // Check if AI is gating reviewer (has gating workflows)
  const isAIGating = aiConfiguration && aiConfiguration.workflows && aiConfiguration.workflows.some(w => w.isGating)

  const legacyAIWorkflows = aiReviewers.map(reviewer => {
    const workflow = workflows.find(w => w.id === reviewer.aiWorkflowId)
    return {
      workflowName: workflow && workflow.name
        ? workflow.name
        : (reviewer.aiWorkflowId || 'Legacy AI Reviewer'),
      weightPercent: '-',
      isGating: false,
      workflow: {
        scorecard: workflow ? {
          name: workflow.scorecard.name,
          id: workflow.scorecard.id
        } : {}
      }
    }
  })

  const totalHumanReviewerCount = humanReviewers.reduce((sum, r) => sum + (parseInt(r.memberReviewerCount) || 1), 0)

  const reviewCost = calculateReviewCost(humanReviewers, challenge)

  return (
    <div className={styles.reviewSummaryContainer}>
      <h3 className={styles.title}>Review Configuration Summary</h3>

      {/* Human and AI Review Overview */}
      <div className={styles.overviewSection}>
        {/* Human Review Card */}
        <div className={styles.reviewCard}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>👥</span>
            <span className={styles.cardTitle}>Human Review</span>
          </div>
          <div className={styles.cardContent}>
            {humanReviewers.length === 0 ? (
              <p className={styles.empty}>No human reviewers configured</p>
            ) : (
              <>
                <div className={styles.row}>
                  <span className={styles.label}>Reviewers:</span>
                  <span className={styles.value}>{totalHumanReviewerCount}</span>
                </div>

                <div className={styles.humanTableSection}>
                  <table className={styles.humanTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Phase</th>
                        <th>Scorecard</th>
                        <th>Review Type</th>
                        <th>Count</th>
                        <th>Public Opportunity</th>
                        <th>Assigned Members</th>
                      </tr>
                    </thead>
                    <tbody>
                      {humanReviewers.map((reviewer, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{getPhaseName(reviewer.phaseId)}</td>
                          <td>{getScorecardName(reviewer.scorecardId)}</td>
                          <td>{REVIEW_OPPORTUNITY_TYPE_LABELS[reviewer.type] || 'Regular'}</td>
                          <td>{parseInt(reviewer.memberReviewerCount) || 1}</td>
                          <td>
                            <span className={reviewer.shouldOpenOpportunity ? styles.badgeYes : styles.badgeNo}>
                              {reviewer.shouldOpenOpportunity ? '✅ Yes' : '❌ No'}
                            </span>
                          </td>
                          <td>
                            {getAssignedMembersForReviewer(reviewer) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* AI Review Card */}
        <div className={styles.reviewCard}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🤖</span>
            <span className={styles.cardTitle}>AI Review</span>
          </div>
          <div className={styles.cardContent}>
            {!hasAIConfiguration ? (
              <p className={styles.empty}>No AI review configured</p>
            ) : (
              <>
                {hasAIConfigWorkflows && (
                  <div className={styles.row}>
                    <span className={styles.label}>Mode:</span>
                    <span className={styles.value}>{aiConfiguration && aiConfiguration.mode}</span>
                  </div>
                )}

                {aiConfiguration && aiConfiguration.minPassingThreshold !== undefined && (
                  <div className={styles.row}>
                    <span className={styles.label}>Threshold:</span>
                    <span className={styles.value}>{aiConfiguration.minPassingThreshold}%</span>
                  </div>
                )}

                {aiConfiguration && aiConfiguration.autoFinalize !== undefined && (
                  <div className={styles.row}>
                    <span className={styles.label}>Auto-Finalize:</span>
                    <span className={styles.value}>{aiConfiguration.autoFinalize ? '✅ On' : '❌ Off'}</span>
                  </div>
                )}

                {((aiConfiguration && aiConfiguration.workflows && aiConfiguration.workflows.length > 0) || legacyAIWorkflows.length > 0) && (
                  <div className={styles.workflowsSection}>
                    <span className={styles.label}>Workflows:</span>
                    <table className={styles.workflowsTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Weight</th>
                          <th>Scorecard</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(hasAIConfigWorkflows ? aiConfiguration.workflows : legacyAIWorkflows).map((workflow, idx) => (
                          <tr key={idx}>
                            <td>{workflow.workflowName || (workflow.workflow && workflow.workflow.name) || workflow.workflowId || '-'}</td>
                            <td>{workflow.weightPercent === '-' ? '-' : `${workflow.weightPercent}%`}</td>
                            <td>
                              {workflow.workflow && workflow.workflow.scorecard && workflow.workflow.scorecard.id ? (
                                <a href={`${REVIEW_APP_URL}/scorecard/${workflow.workflow.scorecard.id}`} target='_blank' rel='noopener noreferrer'>
                                  {workflow.workflow.scorecard.name}
                                </a>
                              ) : '-'}
                            </td>
                            <td className={styles.typeCell}>
                              {workflow.isGating ? (
                                <span className={styles.gate}>⚡ GATE</span>
                              ) : (
                                <span className={styles.review}>{hasAIConfigWorkflows ? '📝' : '📝'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Flow Diagram */}
      {(humanReviewers.length > 0 || hasAIConfigWorkflows) && (
        <div className={styles.flowSection}>
          <h4 className={styles.flowTitle}>Review Flow</h4>
          <div className={cn(styles.flowDiagram, {
            [styles.withAIGating]: isAIGatingMode && isAIGating,
            [styles.withAIOnly]: isAIOnlyMode,
            [styles.withAI]: isAIGatingMode && !isAIGating,
            [styles.humanOnly]: !hasAIConfiguration
          })}>
            {/* Step 1: Submission */}
            <div className={styles.flowBox} style={{ gridColumn: 1, gridRow: 1 }}>
              <div>📥</div>
              <div>Submission</div>
              <div>Received</div>
            </div>

            {/* Arrow 1 */}
            {hasAIConfigWorkflows && (
              <div className={styles.arrow} style={{ gridColumn: 2, gridRow: 1 }}>→</div>
            )}
            {!hasAIConfigWorkflows && humanReviewers.length > 0 && (
              <div className={styles.arrow} style={{ gridColumn: 2, gridRow: 1 }}>→</div>
            )}

            {/* Step 2: AI Review / AI Gate (if configured) */}
            {hasAIConfigWorkflows && (
              <div className={styles.flowBox} style={{ gridColumn: 3, gridRow: 1 }}>
                <div>🤖</div>
                <div>{isAIOnlyMode ? 'AI Review' : 'AI Gate'}</div>
                <div className={styles.flowDescription}>
                  score ≥ {aiConfiguration.minPassingThreshold || 75}%
                </div>
                {isAIGatingMode && (
                  <div className={styles.flowDescription}>pass / lock</div>
                )}
              </div>
            )}

            {/* Arrow 2 (to human or end) - only for AI_GATING with human reviewers */}
            {isAIGatingMode && humanReviewers.length > 0 && (
              <div className={styles.arrow} style={{ gridColumn: 4, gridRow: 1 }}>→</div>
            )}

            {/* Step 3: Human Review (only for AI_GATING mode) */}
            {isAIGatingMode && humanReviewers.length > 0 && (
              <div className={styles.flowBox} style={{ gridColumn: 5, gridRow: 1 }}>
                <div>👥</div>
                <div>Human Review</div>
                <div className={styles.flowDescription}>
                  {totalHumanReviewerCount} reviewers
                </div>
              </div>
            )}

            {/* Step 3: Human Review (for human-only flow) */}
            {!hasAIConfigWorkflows && humanReviewers.length > 0 && (
              <div className={styles.flowBox} style={{ gridColumn: 3, gridRow: 1 }}>
                <div>👥</div>
                <div>Human Review</div>
                <div className={styles.flowDescription}>
                  {totalHumanReviewerCount} reviewers
                </div>
              </div>
            )}

            {/* Failure Path: Arrow down from AI Gate (only for AI_GATING with gating workflows) */}
            {hasAIConfigWorkflows && isAIGatingMode && (
              <div className={cn(styles.arrow, styles.failureArrow)} style={{ gridColumn: 3, gridRow: 2 }}>
                ↓
                {/* Failure Label */}
                <div className={styles.failLabel} style={{ gridColumn: 3, gridRow: '2.5', alignSelf: 'center' }}>
                  &lt; {aiConfiguration.minPassingThreshold || 75}%
                </div>
                ↓
              </div>
            )}

            {/* Failure Path: Locked Step (only for AI_GATING with gating workflows) */}
            {hasAIConfigWorkflows && isAIGatingMode && (
              <div className={styles.flowBox} style={{ gridColumn: 3, gridRow: 3, backgroundColor: '#f5f5f5' }}>
                <div>🔒</div>
                <div>Locked</div>
                <div className={styles.flowDescription}>No human</div>
                <div className={styles.flowDescription}>review needed</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estimated Cost */}
      {humanReviewers.length > 0 && (
        <div className={styles.costSection}>
          <div className={styles.costRow}>
            <span className={styles.costLabel}>Estimated Review Cost:</span>
            <span className={styles.costValue}>${reviewCost}</span>
          </div>
        </div>
      )}
    </div>
  )
}

ReviewSummary.propTypes = {
  challenge: PropTypes.object.isRequired,
  metadata: PropTypes.shape({
    scorecards: PropTypes.array,
    workflows: PropTypes.array,
    resourceRoles: PropTypes.array,
    challengeTracks: PropTypes.array
  }),
  challengeResources: PropTypes.array,
  readOnly: PropTypes.bool
}

ReviewSummary.defaultProps = {
  metadata: {},
  challengeResources: [],
  readOnly: false
}

export default ReviewSummary
