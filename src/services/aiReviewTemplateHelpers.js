/**
 * AI Review Template Integration Utilities
 * 
 * Helper functions to integrate AI review templates into React components.
 */

import * as templateService from './aiReviewTemplates'

/**
 * Hook-like function to manage AI review templates
 * Can be adapted to a custom hook (useAIReviewTemplates)
 */
export const createTemplateManager = (useDevConfig = false) => {
  // In development, you can set useDevConfig = true to use mock data
  const service = useDevConfig 
    ? require('./mocks/aiReviewTemplates.mock')
    : templateService

  return {
    // CRUD operations
    fetchAll: (filters) => service.mockFetchAIReviewTemplates 
      ? service.mockFetchAIReviewTemplates(filters)
      : service.fetchAIReviewTemplates(filters),
      
    fetchById: (id) => service.mockFetchAIReviewTemplate
      ? service.mockFetchAIReviewTemplate(id)
      : service.fetchAIReviewTemplate(id),
      
    create: (data) => service.mockCreateAIReviewTemplate
      ? service.mockCreateAIReviewTemplate(data)
      : service.createAIReviewTemplate(data),
      
    update: (id, data) => service.mockUpdateAIReviewTemplate
      ? service.mockUpdateAIReviewTemplate(id, data)
      : service.updateAIReviewTemplate(id, data),
      
    delete: (id) => service.mockDeleteAIReviewTemplate
      ? service.mockDeleteAIReviewTemplate(id)
      : service.deleteAIReviewTemplate(id),
      
    fetchByTrackAndType: (track, type) => service.mockFetchTemplateByTrackAndType
      ? service.mockFetchTemplateByTrackAndType(track, type)
      : service.fetchTemplateByTrackAndType(track, type)
  }
}

/**
 * Transform a template to a challenge AI review config
 * 
 * @param {Object} template - The template to transform
 * @param {String} challengeId - The challenge ID
 * @returns {Object} - The resulting config
 */
export const transformTemplateToConfig = (template, challengeId) => {
  if (!template) {
    return null
  }

  return {
    id: `config_${Date.now()}`,
    challengeId,
    minPassingThreshold: template.minPassingThreshold,
    autoFinalize: template.autoFinalize,
    mode: template.mode,
    formula: template.formula,
    workflows: template.workflows.map(w => ({
      id: `config_wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      configId: `config_${Date.now()}`,
      workflowId: w.workflowId,
      weightPercent: w.weightPercent,
      isGating: w.isGating,
      createdAt: new Date().toISOString(),
      createdBy: 'current_user'
    })),
    createdAt: template.createdAt,
    createdBy: template.createdBy,
    updatedAt: new Date().toISOString(),
    updatedBy: 'current_user'
  }
}

/**
 * Format a template for display in UI
 * 
 * @param {Object} template - The template to format
 * @returns {Object} - Formatted template
 */
export const formatTemplateForDisplay = (template) => {
  if (!template) {
    return null
  }

  return {
    ...template,
    modeLabel: template.mode === 'AI_ONLY' ? 'AI Only Review' : 'AI Gating + Human Review',
    workflowCount: template.workflows ? template.workflows.length : 0,
    totalWeight: template.workflows 
      ? template.workflows.reduce((sum, w) => sum + (w.weightPercent || 0), 0)
      : 0,
    displayName: `${template.title} (${template.challengeTrack}/${template.challengeType})`
  }
}

/**
 * Validate template data before submission
 * 
 * @param {Object} templateData - The template data to validate
 * @returns {Object} - { isValid: boolean, errors: Array<string> }
 */
export const validateTemplateData = (templateData) => {
  const errors = []

  // Required fields
  if (!templateData.challengeTrack || templateData.challengeTrack.trim() === '') {
    errors.push('Challenge Track is required')
  }

  if (!templateData.challengeType || templateData.challengeType.trim() === '') {
    errors.push('Challenge Type is required')
  }

  if (!templateData.title || templateData.title.trim() === '') {
    errors.push('Title is required')
  }

  if (templateData.minPassingThreshold === undefined || templateData.minPassingThreshold === null) {
    errors.push('Min Passing Threshold is required')
  } else if (templateData.minPassingThreshold < 0 || templateData.minPassingThreshold > 100) {
    errors.push('Min Passing Threshold must be between 0 and 100')
  }

  // Validate mode
  if (![' AI_GATING', 'AI_ONLY'].includes(templateData.mode)) {
    errors.push('Invalid Review Mode selected')
  }

  // Validate workflows
  if (!templateData.workflows || templateData.workflows.length === 0) {
    errors.push('At least one workflow is required')
  } else {
    // Check workflow IDs
    const invalidWorkflows = templateData.workflows.filter(
      w => !w.workflowId || w.workflowId.trim() === ''
    )
    if (invalidWorkflows.length > 0) {
      errors.push(`${invalidWorkflows.length} workflow(s) are missing Workflow ID`)
    }

    // Check weights
    const totalWeight = templateData.workflows.reduce((sum, w) => sum + (w.weightPercent || 0), 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push(`Workflow weights must sum to 100% (currently ${totalWeight.toFixed(2)}%)`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Compare two templates and show differences
 * 
 * @param {Object} original - Original template
 * @param {Object} updated - Updated template
 * @returns {Object} - Differences found
 */
export const compareTemplates = (original, updated) => {
  const differences = {
    header: {},
    workflows: { added: [], removed: [], modified: [] },
    formula: null
  }

  // Compare header fields
  const headerFields = ['title', 'description', 'minPassingThreshold', 'mode', 'autoFinalize']
  headerFields.forEach(field => {
    if (original[field] !== updated[field]) {
      differences.header[field] = {
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

  // Compare formula
  if (JSON.stringify(original.formula) !== JSON.stringify(updated.formula)) {
    differences.formula = {
      from: original.formula,
      to: updated.formula
    }
  }

  return differences
}
