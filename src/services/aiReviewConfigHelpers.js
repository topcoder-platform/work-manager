/**
 * AI Review Config Integration Utilities
 * 
 * Helper functions for managing AI review configs in React components.
 */

/**
 * Hook-like function to manage AI review configs
 */
export const createConfigManager = (useDevConfig = false) => {
  const service = useDevConfig 
    ? require('./mocks/aiReviewConfigs.mock')
    : require('./aiReviewConfigs')

  return {
    create: (data) => service.mockCreateAIReviewConfig
      ? service.mockCreateAIReviewConfig(data)
      : service.createAIReviewConfig(data),
      
    fetchByChallenge: (challengeId) => service.mockFetchAIReviewConfigByChallenge
      ? service.mockFetchAIReviewConfigByChallenge(challengeId)
      : service.fetchAIReviewConfigByChallenge(challengeId),
      
    update: (id, data) => service.mockUpdateAIReviewConfig
      ? service.mockUpdateAIReviewConfig(id, data)
      : service.updateAIReviewConfig(id, data),
      
    delete: (id) => service.mockDeleteAIReviewConfig
      ? service.mockDeleteAIReviewConfig(id)
      : service.deleteAIReviewConfig(id)
  }
}

/**
 * Validate config data before submission
 * 
 * @param {Object} configData - The config data to validate
 * @returns {Object} - { isValid: boolean, errors: Array<string> }
 */
export const validateConfigData = (configData) => {
  const errors = []

  // Required fields
  if (!configData.challengeId || configData.challengeId.trim() === '') {
    errors.push('Challenge ID is required')
  }

  if (configData.minPassingThreshold === undefined || configData.minPassingThreshold === null) {
    errors.push('Min Passing Threshold is required')
  } else if (configData.minPassingThreshold < 0 || configData.minPassingThreshold > 100) {
    errors.push('Min Passing Threshold must be between 0 and 100')
  }

  // Validate mode
  if (!configData.mode || !['AI_GATING', 'AI_ONLY'].includes(configData.mode)) {
    errors.push('Valid Review Mode (AI_GATING or AI_ONLY) is required')
  }

  // Validate workflows
  if (!configData.workflows || configData.workflows.length === 0) {
    errors.push('At least one workflow is required')
  } else {
    // Check workflow IDs
    const invalidWorkflows = configData.workflows.filter(
      w => !w.workflowId || w.workflowId.trim() === ''
    )
    if (invalidWorkflows.length > 0) {
      errors.push(`${invalidWorkflows.length} workflow(s) are missing Workflow ID`)
    }

    // Check weights
    const totalWeight = configData.workflows.reduce((sum, w) => sum + (w.weightPercent || 0), 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push(`Workflow weights must sum to 100% (currently ${totalWeight.toFixed(2)}%)`)
    }

    // Check for gating workflows if in AI_GATING mode
    if (configData.mode === 'AI_GATING') {
      const gatingWorkflows = configData.workflows.filter(w => w.isGating)
      if (gatingWorkflows.length === 0) {
        console.warn('No gating workflows found for AI_GATING mode - all submissions will pass through')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Compare two configs and show differences
 * 
 * @param {Object} original - Original config
 * @param {Object} updated - Updated config
 * @returns {Object} - Differences found
 */
export const compareConfigs = (original, updated) => {
  const differences = {
    settings: {},
    workflows: { added: [], removed: [], modified: [] }
  }

  // Compare settings
  const settingFields = ['minPassingThreshold', 'mode', 'autoFinalize']
  settingFields.forEach(field => {
    if (original[field] !== updated[field]) {
      differences.settings[field] = {
        from: original[field],
        to: updated[field]
      }
    }
  })

  // Compare workflows
  if (original.workflows && updated.workflows) {
    const updatedWorkflowIds = new Set(updated.workflows.map(w => w.workflowId))
    original.workflows.forEach(w => {
      if (!updatedWorkflowIds.has(w.workflowId)) {
        differences.workflows.removed.push(w)
      }
    })

    const originalWorkflowMap = new Map(original.workflows.map(w => [w.workflowId, w]))
    updated.workflows.forEach(w => {
      const origW = originalWorkflowMap.get(w.workflowId)
      if (!origW) {
        differences.workflows.added.push(w)
      } else if (
        origW.weightPercent !== w.weightPercent || 
        origW.isGating !== w.isGating
      ) {
        differences.workflows.modified.push({
          workflowId: w.workflowId,
          changes: {
            weightPercent: { from: origW.weightPercent, to: w.weightPercent },
            isGating: { from: origW.isGating, to: w.isGating }
          }
        })
      }
    })
  }

  return differences
}

/**
 * Check if config has changed between original and updated versions
 * 
 * @param {Object} original - Original config
 * @param {Object} updated - Updated config
 * @returns {boolean} - True if any changes detected, false otherwise
 */
export const configHasChanges = (original, updated) => {
  const differences = compareConfigs(original, updated)
  
  const hasSettingChanges = Object.keys(differences.settings).length > 0
  const hasWorkflowChanges = 
    differences.workflows.added.length > 0 ||
    differences.workflows.removed.length > 0 ||
    differences.workflows.modified.length > 0
  
  return hasSettingChanges || hasWorkflowChanges
}
