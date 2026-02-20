import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { OutlineButton } from '../../../Buttons'
import { createAIReviewConfig, updateAIReviewConfig, fetchAIReviewConfigByChallenge } from '../../../../services/aiReviewConfigs'
import ConfirmationModal from '../../../Modal/ConfirmationModal'
import useConfigurationState from './hooks/useConfigurationState'
import useTemplateManager from './hooks/useTemplateManager'
import InitialStateView from './views/InitialStateView'
import TemplateConfigurationView from './views/TemplateConfigurationView'
import ManualConfigurationView from './views/ManualConfigurationView'
import styles from './AIReviewTab.module.scss'
import sharedStyles from '../shared.module.scss'

/**
 * AIReviewTab - Main component for managing AI review configuration
 * Orchestrates between different views: initial state, template, manual, and legacy
 */
const AIReviewTab = ({ challenge, onUpdateReviewers, metadata = {}, isLoading, readOnly = false }) => {
  const [error, setError] = useState(null)
  const [showSwitchToManualConfirm, setShowSwitchToManualConfirm] = useState(false)

  useEffect(() => {
    challenge.reviewers.forEach(r => {
      if (r.isMemberReview) {
        return;
      }
      r.aiReviewTemplateId = 'template_001';
    })
  }, [challenge]);

  const {
    configuration,
    configurationMode,
    setConfigurationMode,
    updateConfiguration,
    addWorkflow,
    updateWorkflow,
    removeWorkflow,
    resetConfiguration,
    applyTemplate
  } = useConfigurationState(challenge)

  const {
    templates,
    selectedTemplate,
    templatesLoading,
    error: templateError,
    loadTemplates,
    selectTemplate,
    clearSelection
  } = useTemplateManager()

  /**
   * Check if a reviewer is an AI reviewer
   */
  const isAIReviewer = (reviewer) => {
    return reviewer && (
      (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
      (reviewer.isMemberReview === false)
    )
  }

  /**
   * Check if we're in initial state (AI reviewers assigned but no config)
   */
  const isInitialState = () => {
    const aiReviewers = (challenge.reviewers || []).filter(r => isAIReviewer(r))
    return aiReviewers.length > 0 && !configurationMode
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

  /**
   * Handle template selection mode
   */
  const handleTemplateSelection = () => {
    setConfigurationMode('template')
    loadTemplates(challenge.track.name, challenge.type.name)
  }

  /**
   * Handle manual configuration mode
   */
  const handleManualConfiguration = () => {
    setConfigurationMode('manual')
  }

  /**
   * Handle switching between configuration modes
   */
  const handleSwitchConfigurationMode = (newMode) => {
    if (newMode === 'manual' && configurationMode === 'template') {
      setShowSwitchToManualConfirm(true)
      return
    }

    setConfigurationMode(newMode)
    clearSelection()

    if (newMode === 'template') {
      resetConfiguration()
      loadTemplates(challenge.track.name, challenge.type.name)
    }
  }

  /**
   * Confirm switch to manual mode
   */
  const confirmSwitchToManual = () => {
    setShowSwitchToManualConfirm(false)
    setConfigurationMode('manual')
    clearSelection()
  }

  /**
   * Handle template change
   */
  const handleTemplateChange = (templateId) => {
    const template = selectTemplate(templateId)
    if (template) {
      applyTemplate(template)
    }
  }

  /**
   * Handle remove configuration
   */
  const handleRemoveConfiguration = () => {
    setConfigurationMode(null)
    clearSelection()
    resetConfiguration()
  }

  /**
   * Handle save configuration
   */
  const handleSaveConfiguration = async () => {
    // Validate configuration before saving
    if (!configuration.workflows || configuration.workflows.length === 0) {
      setError('At least one AI workflow is required')
      return
    }

    // Check if any workflow has invalid settings
    const hasInvalidWorkflow = configuration.workflows.some(workflow => {
      return !workflow.workflowId
    })

    if (hasInvalidWorkflow) {
      setError('All workflows must have a name and ID')
      return
    }

    try {
      // Prepare configuration data for API
      const configData = {
        challengeId: challenge.id,
        minPassingThreshold: configuration.minPassingThreshold || 0,
        mode: configuration.mode || 'AI_ONLY',
        workflows: configuration.workflows
      }

      // Create or update the configuration via API
      let savedConfig = null
      const existingConfig = await fetchAIReviewConfigByChallenge(challenge.id)
      
      if (existingConfig && existingConfig.id) {
        // Update existing config
        savedConfig = await updateAIReviewConfig(existingConfig.id, configData)
      } else {
        // Create new config
        savedConfig = await createAIReviewConfig(configData)
      }

      // Ensure reviewers exist for each workflow in the configuration
      const currentReviewers = challenge.reviewers || []
      let updatedReviewers = [...currentReviewers]

      // Find the first available review phase
      const reviewPhases = challenge.phases && challenge.phases.filter(phase =>
        phase.name && (phase.name.toLowerCase().includes('review') || phase.name.toLowerCase().includes('submission'))
      )
      const defaultPhaseId = (reviewPhases && reviewPhases.length > 0) 
        ? (reviewPhases[0].phaseId || reviewPhases[0].id)
        : (challenge.phases && challenge.phases.length > 0)
          ? (challenge.phases[0].phaseId || challenge.phases[0].id)
          : ''

      // For each workflow in the configuration, ensure there's a corresponding reviewer
      configuration.workflows.forEach(workflow => {
        const workflowExists = updatedReviewers.some(reviewer =>
          isAIReviewer(reviewer) && reviewer.aiWorkflowId === workflow.workflowId
        )

        if (!workflowExists) {
          // Add a new AI reviewer for this workflow
          const newReviewer = {
            isMemberReview: false,
            phaseId: defaultPhaseId,
            aiWorkflowId: workflow.workflowId,
            scorecardId: workflow.scorecardId
          }
          updatedReviewers.push(newReviewer)
        }
      })

      // Update all AI reviewers with the saved configuration
      updatedReviewers = updatedReviewers.map(reviewer => {
        if (isAIReviewer(reviewer)) {
          return {
            ...reviewer,
            aiReviewConfiguration: savedConfig || configuration
          }
        }
        return reviewer
      })

      if (error) {
        setError(null)
      }

      // Update the challenge with the new reviewers and configuration
      onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
    } catch (err) {
      setError(`Failed to save AI review configuration: ${err.message}`)
      console.error('Error saving AI review configuration:', err)
    }
  }

  /**
   * Add an AI reviewer
   */
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

  /**
   * Update an AI reviewer
   */
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

  /**
   * Remove an AI reviewer
   */
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

  /**
   * Validate an AI reviewer
   */
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

  /**
   * Render AI reviewer form (legacy mode)
   */
  const renderAIReviewerForm = (reviewer, index) => {
    const { workflows = [] } = metadata
    const validationErrors = challenge.submitTriggered ? validateAIReviewer(reviewer) : {}

    return (
      <div key={`ai-reviewer-${index}`} className={sharedStyles.reviewerForm}>
        <div className={sharedStyles.reviewerHeader}>
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

        <div className={sharedStyles.formRow}>
          <div className={sharedStyles.formGroup}>
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
              <div className={sharedStyles.error}>
                {validationErrors.phaseId}
              </div>
            )}
          </div>
        </div>

        <div className={sharedStyles.formRow}>
          <div className={sharedStyles.formGroup}>
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
              <div className={sharedStyles.error}>
                {validationErrors.aiWorkflowId}
              </div>
            )}
          </div>
        </div>

        {readOnly && reviewer.scorecardId && (
          <div className={sharedStyles.formRow}>
            <div className={sharedStyles.formGroup}>
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

  // Get AI reviewers
  const aiReviewers = (challenge.reviewers || []).filter(r => isAIReviewer(r))

  // Show loading state
  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  // Show template configuration if in template mode
  if (configurationMode === 'template') {
    return (
      <div className={sharedStyles.tabContent}>
        <TemplateConfigurationView
          challenge={challenge}
          configuration={configuration}
          templates={templates}
          selectedTemplate={selectedTemplate}
          templatesLoading={templatesLoading}
          onTemplateChange={handleTemplateChange}
          onUpdateConfiguration={updateConfiguration}
          onSwitchMode={handleSwitchConfigurationMode}
          onRemoveConfig={handleRemoveConfiguration}
          readOnly={readOnly}
          isAIReviewer={isAIReviewer}
        />
        {showSwitchToManualConfirm && (
          <ConfirmationModal
            title='Switch to Manual Configuration?'
            message={(
              <div>
                <p>The template settings will be copied into editable fields.</p>
                <p>You can then modify workflows, weights, and settings individually.</p>
                <p>This will disconnect from the template. Future template updates will not apply.</p>
              </div>
            )}
            cancelText='Cancel'
            confirmText='Switch to Manual'
            onCancel={() => setShowSwitchToManualConfirm(false)}
            onConfirm={confirmSwitchToManual}
          />
        )}
      </div>
    )
  }

  // Show manual configuration if in manual mode
  if (configurationMode === 'manual') {
    return (
      <div className={sharedStyles.tabContent}>
        <ManualConfigurationView
          challenge={challenge}
          configuration={configuration}
          availableWorkflows={metadata.workflows || []}
          onUpdateConfiguration={updateConfiguration}
          onAddWorkflow={addWorkflow}
          onUpdateWorkflow={updateWorkflow}
          onRemoveWorkflow={removeWorkflow}
          onSwitchMode={handleSwitchConfigurationMode}
          onRemoveConfig={handleRemoveConfiguration}
          onSaveConfiguration={handleSaveConfiguration}
          readOnly={readOnly}
          isAIReviewer={isAIReviewer}
        />
      </div>
    )
  }

  // Show initial state if workflows are assigned but no configuration mode selected yet
  if (isInitialState()) {
    return (
      <div className={sharedStyles.tabContent}>
        <InitialStateView
          assignedWorkflows={getAssignedWorkflows()}
          onSelectTemplate={handleTemplateSelection}
          onSelectManual={handleManualConfiguration}
          onRemoveReviewer={removeAIReviewer}
          readOnly={readOnly}
        />
      </div>
    )
  }

  // Legacy mode - show traditional AI reviewer forms
  return (
    <div className={sharedStyles.tabContent}>
      {!readOnly && (
        <div className={sharedStyles.description}>
          Configure AI-powered review workflows for this challenge. Select AI templates and assign to phases.
        </div>
      )}

      {!readOnly && aiReviewers.length === 0 && (
        <div className={sharedStyles.noReviewers}>
          <p>No AI review workflows configured. Click "Add AI Reviewer" to get started.</p>
        </div>
      )}

      {readOnly && aiReviewers.length === 0 && (
        <div className={sharedStyles.noReviewers}>
          <p>No AI review workflows configured for this challenge.</p>
        </div>
      )}

      {aiReviewers.length > 0 && aiReviewers.map((reviewer, index) =>
        renderAIReviewerForm(reviewer, index)
      )}

      {aiReviewers.length > 0 && (
        <div className={sharedStyles.summary}>
          <h4>AI Review Summary</h4>
          <div className={sharedStyles.summaryRow}>
            <span>Total AI Workflows:</span>
            <span>{aiReviewers.length}</span>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className={sharedStyles.addButton}>
          <button
            className={sharedStyles.addReviewerBtn}
            onClick={addAIReviewer}
          >
            Add AI Reviewer
          </button>
        </div>
      )}

      {(error || templateError) && !isLoading && (
        <div className={cn(sharedStyles.fieldError, sharedStyles.error)}>
          {error || templateError}
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

AIReviewTab.defaultProps = {
  metadata: {},
  isLoading: false,
  readOnly: false
}

export default AIReviewTab
