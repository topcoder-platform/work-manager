import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { REVIEW_OPPORTUNITY_TYPE_LABELS } from '../../../../config/constants'
import { isAIReviewer } from '../AiReviewerTab/utils'
import { fetchAIReviewConfigByChallenge } from '../../../../services/aiReviewConfigs'
import styles from './ReviewSummary.module.scss'

const ReviewSummary = ({
  challenge,
  metadata = {},
  readOnly = false
}) => {
  const [aiConfiguration, setAiConfiguration] = useState(null)
  const [isLoadingAIConfig, setIsLoadingAIConfig] = useState(false)

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
  }, [challenge?.id])

  if (!challenge) return null

  const { scorecards = [] } = metadata

  // Filter human and AI reviewers
  const allReviewers = challenge.reviewers || []
  const humanReviewers = allReviewers.filter(r => !isAIReviewer(r))

  // Calculate review cost based on human reviewers
  const calculateReviewCost = () => {
    return humanReviewers
      .reduce((sum, r) => {
        const memberCount = parseInt(r.memberReviewerCount) || 1
        const baseAmount = parseFloat(r.fixedAmount) || 0
        const prizeAmount = challenge.prizeSets && challenge.prizeSets[0]
          ? parseFloat(challenge.prizeSets[0].prizes?.[0]?.value) || 0
          : 0

        const estimatedSubmissions = 2
        const baseCoefficient = parseFloat(r.baseCoefficient) || 0.13
        const incrementalCoefficient = parseFloat(r.incrementalCoefficient) || 0.05

        const calculatedCost = memberCount * (
          baseAmount + (prizeAmount * baseCoefficient) +
          (prizeAmount * estimatedSubmissions * incrementalCoefficient)
        )

        return sum + calculatedCost
      }, 0)
      .toFixed(2)
  }

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

  // Check if AI review is configured
  const hasAIConfiguration = aiConfiguration && (aiConfiguration.workflows?.length > 0)

  // Check if AI mode is gating or only
  const isAIOnlyMode = aiConfiguration && aiConfiguration.mode === 'AI_ONLY'
  const isAIGatingMode = aiConfiguration && aiConfiguration.mode === 'AI_GATING'

  // Check if AI is gating reviewer (has gating workflows)
  const isAIGating = aiConfiguration && aiConfiguration.workflows?.some(w => w.isGating)

  const reviewCost = calculateReviewCost()

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
                  <span className={styles.value}>{humanReviewers.reduce((sum, r) => sum + (parseInt(r.memberReviewerCount) || 1), 0)}</span>
                </div>

                {humanReviewers.length > 0 && (
                  <>
                    <div className={styles.row}>
                      <span className={styles.label}>Scorecard:</span>
                      <span className={styles.value}>
                        {humanReviewers.map((r, idx) => (
                          <div key={idx}>{getScorecardName(r.scorecardId)}</div>
                        ))}
                      </span>
                    </div>

                    <div className={styles.row}>
                      <span className={styles.label}>Phase:</span>
                      <span className={styles.value}>
                        {humanReviewers.map((r, idx) => (
                          <div key={idx}>{getPhaseName(r.phaseId)}</div>
                        ))}
                      </span>
                    </div>

                    <div className={styles.row}>
                      <span className={styles.label}>Review Type:</span>
                      <span className={styles.value}>
                        {humanReviewers.map((r, idx) => (
                          <div key={idx}>{REVIEW_OPPORTUNITY_TYPE_LABELS[r.type] || 'Regular'}</div>
                        ))}
                      </span>
                    </div>

                    <div className={styles.row}>
                      <span className={styles.label}>Public Opportunity:</span>
                      <span className={styles.value}>
                        {humanReviewers.map((r, idx) => (
                          <div key={idx} className={styles.badgeRow}>
                            <span className={r.shouldOpenOpportunity ? styles.badgeYes : styles.badgeNo}>
                              {r.shouldOpenOpportunity ? '✅ Yes' : '❌ No'}
                            </span>
                          </div>
                        ))}
                      </span>
                    </div>
                  </>
                )}
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
                <div className={styles.row}>
                  <span className={styles.label}>Mode:</span>
                  <span className={styles.value}>{aiConfiguration.mode || 'Not set'}</span>
                </div>

                {aiConfiguration.minPassingThreshold !== undefined && (
                  <div className={styles.row}>
                    <span className={styles.label}>Threshold:</span>
                    <span className={styles.value}>{aiConfiguration.minPassingThreshold}%</span>
                  </div>
                )}

                {aiConfiguration.autoFinalize !== undefined && (
                  <div className={styles.row}>
                    <span className={styles.label}>Auto-Finalize:</span>
                    <span className={styles.value}>{aiConfiguration.autoFinalize ? '✅ On' : '❌ Off'}</span>
                  </div>
                )}

                {aiConfiguration.workflows && aiConfiguration.workflows.length > 0 && (
                  <div className={styles.workflowsSection}>
                    <span className={styles.label}>Workflows:</span>
                    <table className={styles.workflowsTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Weight</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiConfiguration.workflows.map((workflow, idx) => (
                          <tr key={idx}>
                            <td>{workflow.workflow.name || workflow.workflowId || '-'}</td>
                            <td>{workflow.weightPercent}%</td>
                            <td className={styles.typeCell}>
                              {workflow.isGating ? (
                                <span className={styles.gate}>⚡ GATE</span>
                              ) : (
                                <span className={styles.review}>📝</span>
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
      {(humanReviewers.length > 0 || hasAIConfiguration) && (
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
            {hasAIConfiguration && (
              <div className={styles.arrow} style={{ gridColumn: 2, gridRow: 1 }}>→</div>
            )}
            {!hasAIConfiguration && humanReviewers.length > 0 && (
              <div className={styles.arrow} style={{ gridColumn: 2, gridRow: 1 }}>→</div>
            )}

            {/* Step 2: AI Review / AI Gate (if configured) */}
            {hasAIConfiguration && (
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
                  {humanReviewers.reduce((sum, r) => sum + (parseInt(r.memberReviewerCount) || 1), 0)} reviewers
                </div>
              </div>
            )}

            {/* Step 3: Human Review (for human-only flow) */}
            {!hasAIConfiguration && humanReviewers.length > 0 && (
              <div className={styles.flowBox} style={{ gridColumn: 3, gridRow: 1 }}>
                <div>👥</div>
                <div>Human Review</div>
                <div className={styles.flowDescription}>
                  {humanReviewers.reduce((sum, r) => sum + (parseInt(r.memberReviewerCount) || 1), 0)} reviewers
                </div>
              </div>
            )}

            {/* Failure Path: Arrow down from AI Gate (only for AI_GATING with gating workflows) */}
            {hasAIConfiguration && isAIGating && (
              <div className={cn(styles.arrow, styles.failureArrow)} style={{ gridColumn: 3, gridRow: 2 }}>
                ↓
                {/* Failure Label */}
                {hasAIConfiguration && isAIGating && (
                  <div className={styles.failLabel} style={{ gridColumn: 3, gridRow: '2.5', alignSelf: 'center' }}>
                    &lt; {aiConfiguration.minPassingThreshold || 75}%
                  </div>
                )}
                ↓
              </div>
            )}

            {/* Failure Path: Locked Step (only for AI_GATING with gating workflows) */}
            {isAIGatingMode && isAIGating && (
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
    challengeTracks: PropTypes.array
  }),
  readOnly: PropTypes.bool
}

ReviewSummary.defaultProps = {
  metadata: {},
  readOnly: false
}

export default ReviewSummary
