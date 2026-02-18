import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { OutlineButton } from '../../Buttons'
import AIWorkflowCard from './AIWorkflowCard'
import { createTemplateManager } from '../../../services/aiReviewTemplateHelpers'
import { createConfigManager } from '../../../services/aiReviewConfigHelpers'
import styles from './AIReviewTab.module.scss'

const AIReviewTab = ({ challenge, onUpdateReviewers, metadata = {}, isLoading, readOnly = false }) => {
  const [error, setError] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [aiReviewConfigs, setAiReviewConfigs] = useState([])
  const [configurationMode, setConfigurationMode] = useState(null)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [configuration, setConfiguration] = useState({
    mode: 'AI_GATING',
    minPassingThreshold: 75,
    autoFinalize: false,
    workflows: []
  })

  const templateManager = useMemo(() => createTemplateManager(true), [])
  const configManager = useMemo(() => createConfigManager(true), [])

  /**
   * Checks if we're in the initial state:
   * - AI workflows are assigned (from DefaultChallengeReviewer)
   * - But no aiReviewConfig has been created yet
   */
  const isAIReviewer = (reviewer) => {
    return reviewer && (
      (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
      (reviewer.isMemberReview === false)
    )
  }

  const isInitialState = () => {
    const aiReviewers = (challenge.reviewers || []).filter(r => isAIReviewer(r))
    // Initial state: has AI reviewers but no aiReviewConfig
    // TODO: Update this check based on actual aiReviewConfig property once defined
    return aiReviewers.length > 0 && !configurationMode
  }

  /**
   * Load templates based on challenge track and type
   */
  const loadTemplates = async () => {
    setTemplatesLoading(true)
    setError(null)

    try {
      const fetchedTemplates = await templateManager.fetchAll({
        challengeTrack: challenge.track.name,
        challengeType: challenge.type.name,
      })

      setTemplates(fetchedTemplates || [])
      setTemplatesLoading(false)
    } catch (error) {
      console.error('Error loading templates:', error)
      setError('Failed to load templates')
      setTemplatesLoading(false)
    }
  }

  /**
   * Get workflows assigned to this challenge
   */
  const getAssignedWorkflows = () => {
    const { workflows = [] } = metadata
    const aiReviewers = (challenge.reviewers || []).filter(r => isAIReviewer(r))
    
    return aiReviewers.map(reviewer => {
      const workflow = workflows.find(w => w.id === reviewer.aiWorkflowId)
      return {
        reviewer,
        workflow,
        scorecardId: reviewer.scorecardId
      }
    })
  }

  const handleTemplateSelection = () => {
    setConfigurationMode('template')
    // Load templates after setting the mode
    loadTemplates()
  }

  const handleManualConfiguration = () => {
    setConfigurationMode('manual')
  }

  const handleSwitchConfigurationMode = (newMode) => {
    setConfigurationMode(newMode)
    setSelectedTemplate(null)
    setConfiguration({
      mode: 'AI_GATING',
      minPassingThreshold: 75,
      autoFinalize: false,
      workflows: []
    })
    
    if (newMode === 'template') {
      loadTemplates()
    }
  }

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId)

    if (template) {
      setSelectedTemplate(template)
      applyTemplateToConfiguration(template)
    }
  }

  const applyTemplateToConfiguration = (template) => {
    if (!template) return

    const newConfiguration = {
      mode: template.mode || 'AI_GATING',
      minPassingThreshold: template.minPassingThreshold || 75,
      autoFinalize: template.autoFinalize || false,
      workflows: template.workflows || []
    }

    setConfiguration(newConfiguration)
  }

  const updateConfiguration = (field, value) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderTemplateConfiguration = () => {
    const { workflows: availableWorkflows = [] } = metadata

    return (
      <div className={styles.templateConfiguration}>
        {/* Configuration Source Selector */}
        <div className={styles.configurationSourceSelector}>
          <h4>Configuration Source:</h4>
          <div className={styles.sourceOptions}>
            <label className={styles.radioLabel}>
              <input
                type='radio'
                name='configSource'
                value='template'
                checked={true}
                disabled
              />
              <span>Template</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type='radio'
                name='configSource'
                value='manual'
                checked={false}
                disabled
              />
              <span>Manual</span>
            </label>
            {!readOnly && (
              <button
                className={styles.switchButton}
                onClick={() => handleSwitchConfigurationMode('manual')}
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {/* Template Selection Section */}
        <div className={styles.templateSection}>
          <h3>📋 AI Review Template</h3>

          <div className={styles.templateSelector}>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={readOnly || templatesLoading}
              className={styles.templateDropdown}
            >
              <option value=''>Select a template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className={styles.templateDescription}>
              <p>{selectedTemplate.description}</p>
            </div>
          )}
        </div>

        {/* Review Settings Section */}
        {selectedTemplate && (
          <div className={styles.reviewSettingsSection}>
            <h3>⚙️ Review Settings</h3>

            <div className={styles.settingsGrid}>
              {/* Review Mode */}
              <div className={styles.setting}>
                <label>Review Mode:</label>
                <select
                  value={configuration.mode}
                  onChange={(e) => updateConfiguration('mode', e.target.value)}
                  disabled={readOnly}
                  className={styles.modeDropdown}
                >
                  <option value='AI_GATING'>AI_GATING</option>
                  <option value='AI_ONLY'>AI_ONLY</option>
                </select>
                <p className={styles.modeInfo}>
                  {configuration.mode === 'AI_GATING'
                    ? 'AI gates low-quality submissions; humans review the rest.'
                    : 'AI makes the final decision on all submissions.'}
                </p>
              </div>

              {/* Auto-Finalize */}
              <div className={styles.setting}>
                <label>Auto-Finalize:</label>
                <label className={styles.checkboxLabel}>
                  <input
                    type='checkbox'
                    checked={configuration.autoFinalize}
                    onChange={(e) => updateConfiguration('autoFinalize', e.target.checked)}
                    disabled={readOnly || configuration.mode !== 'AI_ONLY'}
                  />
                  <span>{configuration.autoFinalize ? 'On' : 'Off'}</span>
                </label>
                <p className={styles.autoFinalizeInfo}>
                  Only available in AI_ONLY mode
                </p>
              </div>
            </div>

            {/* Min Passing Threshold Slider */}
            <div className={styles.thresholdSection}>
              <label>Min Passing Threshold:</label>
              <div className={styles.thresholdSlider}>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={configuration.minPassingThreshold}
                  onChange={(e) => updateConfiguration('minPassingThreshold', parseInt(e.target.value, 10))}
                  disabled={readOnly}
                  className={styles.slider}
                />
                <span className={styles.thresholdValue}>
                  {configuration.minPassingThreshold} %
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Workflows Section */}
        {selectedTemplate && configuration.workflows && configuration.workflows.length > 0 && (
          <div className={styles.workflowsSection}>
            <h3>AI Workflows <span className={styles.workflowsNote}>(from template)</span></h3>

            <div className={styles.workflowsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Workflow</th>
                    <th>Weight</th>
                    <th>Type</th>
                    <th>Challenge Match</th>
                  </tr>
                </thead>
                <tbody>
                  {configuration.workflows.map((workflow, index) => {
                    const isAssigned = (challenge.reviewers || []).some(r =>
                      isAIReviewer(r) && r.aiWorkflowId === workflow.workflowId
                    )
                    const workflowDetails = workflow.workflow || {}

                    return (
                      <tr key={index}>
                        <td>
                          <span className={styles.workflowIcon}>🤖</span>
                          <span className={styles.workflowName}>{workflowDetails.name}</span>
                          <div className={styles.workflowDescription}>
                            {workflowDetails.description}
                          </div>
                        </td>
                        <td className={styles.weight}>
                          {workflow.weightPercent}%
                        </td>
                        <td className={styles.type}>
                          {workflow.isGating ? (
                            <span className={styles.gatingBadge}>⚡GATE</span>
                          ) : (
                            <span className={styles.normalBadge}>✓ Review</span>
                          )}
                        </td>
                        <td className={styles.match}>
                          {isAssigned ? (
                            <span className={styles.assignedBadge}>✅ Assigned</span>
                          ) : (
                            <span className={styles.notAssignedBadge}>⚠️ Not assigned</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className={styles.workflowsInfo}>
              ✅ = Also assigned as AI Reviewer in this challenge<br />
              ⚠️ = Not assigned — will be auto-added on save
            </p>
          </div>
        )}

        {/* Summary Section */}
        {selectedTemplate && (
          <div className={styles.summarySection}>
            <h3>Summary</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>Mode</h4>
                <div className={styles.summaryValue}>{configuration.mode}</div>
              </div>
              <div className={styles.summaryCard}>
                <h4>Threshold</h4>
                <div className={styles.summaryValue}>{configuration.minPassingThreshold}%</div>
              </div>
              <div className={styles.summaryCard}>
                <h4>Workflows</h4>
                <div className={styles.summaryValue}>
                  {configuration.workflows.length} total
                  {configuration.workflows.some(w => w.isGating) && (
                    <div className={styles.summarySubtext}>
                      {configuration.workflows.filter(w => w.isGating).length} gating
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Configuration Button */}
        {!readOnly && selectedTemplate && (
          <div className={styles.removeConfigSection}>
            <button
              className={styles.removeConfigButton}
              onClick={() => {
                setConfigurationMode(null)
                setSelectedTemplate(null)
                setConfiguration({
                  mode: 'AI_GATING',
                  minPassingThreshold: 75,
                  autoFinalize: false,
                  workflows: []
                })
              }}
            >
              ✕ Remove AI Review Config
            </button>
          </div>
        )}

        {templatesLoading && (
          <div className={styles.loading}>Loading templates...</div>
        )}
      </div>
    )
  }

  const removeAIReviewer = (index) => {
    const currentReviewers = challenge.reviewers || []
    
    // Map the AI reviewer index to the actual index in the full reviewers array
    const aiReviewers = currentReviewers.filter(r => isAIReviewer(r))
    const reviewerToRemove = aiReviewers[index]
    const actualIndex = currentReviewers.indexOf(reviewerToRemove)
    
    if (actualIndex !== -1) {
      const updatedReviewers = currentReviewers.filter((_, i) => i !== actualIndex)
      onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
    }
  }

  const renderInitialState = () => {
    const assignedWorkflows = getAssignedWorkflows()

    return (
      <div className={styles.initialStateContainer}>
        <div className={styles.warningBox}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningContent}>
            <h3>AI workflows are assigned but no AI Review Config has been created</h3>
            <p>Workflows will run but scoring, gating, and thresholds are not defined.</p>
            <p><strong>Choose how to configure:</strong></p>
          </div>
        </div>

        <div className={styles.configurationOptions}>
          <div className={styles.optionCard}>
            <h4>📋 Use a Template</h4>
            <p>Pre-fill from a standard config for this track & type.</p>
            <button
              className={styles.optionButton}
              onClick={handleTemplateSelection}
            >
              Use Template
            </button>
          </div>

          <div className={styles.optionCard}>
            <h4>✏️ Configure Manually</h4>
            <p>Set up each workflow weight, mode, and threshold yourself.</p>
            <button
              className={styles.optionButton}
              onClick={handleManualConfiguration}
            >
              Configure Manually
            </button>
          </div>
        </div>

        <div className={styles.assignedWorkflowsSection}>
          <h3>Assigned AI Workflows</h3>
          <p>These AI workflows are assigned to this challenge from the default reviewer configuration.</p>

          <div className={styles.workflowsList}>
            {assignedWorkflows.map((item, index) => (
              <AIWorkflowCard
                key={`workflow-${index}`}
                workflow={item.workflow || { name: item.reviewer.aiWorkflowId }}
                scorecardId={item.scorecardId}
                description=''
                onRemove={() => removeAIReviewer(index)}
                readOnly={false}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const addAIReviewer = () => {
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

    if (error) {
      setError(null)
    }

    const updatedReviewers = currentReviewers.concat([newReviewer])
    onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
  }

  const updateAIReviewer = (index, field, value) => {
    const currentReviewers = challenge.reviewers || []
    const updatedReviewers = currentReviewers.slice()
    const fieldUpdate = { [field]: value }

    // Map the AI reviewer index to the actual index in the full reviewers array
    const aiReviewers = currentReviewers.filter(r => isAIReviewer(r))
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

  const validateAIReviewer = (reviewer) => {
    const errors = {}

    if (!reviewer.aiWorkflowId || reviewer.aiWorkflowId.trim() === '') {
      errors.aiWorkflowId = 'AI Workflow is required'
    }

    if (!reviewer.phaseId) {
      errors.phaseId = 'Phase is required'
    }

    return errors
  }

  const renderAIReviewerForm = (reviewer, index) => {
    const { workflows = [] } = metadata
    const validationErrors = challenge.submitTriggered ? validateAIReviewer(reviewer) : {}

    return (
      <div key={`ai-reviewer-${index}`} className={styles.reviewerForm}>
        <div className={styles.reviewerHeader}>
          <h4>AI Reviewer Configuration {index + 1}</h4>
          {!readOnly && (
            <OutlineButton
              minWidth
              text='Remove'
              type='danger'
              onClick={() => removeAIReviewer(index)}
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
                onChange={(e) => updateAIReviewer(index, 'phaseId', e.target.value)}
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
                onChange={(e) => updateAIReviewer(index, 'aiWorkflowId', e.target.value)}
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


  const aiReviewers = (challenge.reviewers || []).filter(r => isAIReviewer(r))

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  // Show template configuration if in template mode
  if (configurationMode === 'template') {
    return (
      <div className={styles.tabContent}>
        {renderTemplateConfiguration()}
      </div>
    )
  }

  // Show initial state if workflows are assigned but no configuration mode selected yet
  if (isInitialState()) {
    return (
      <div className={styles.tabContent}>
        {renderInitialState()}
      </div>
    )
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
        renderAIReviewerForm(reviewer, index)
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
            onClick={addAIReviewer}
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
