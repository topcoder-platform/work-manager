/**
 * Mock AI Review Service for testing
 * 
 * This module provides mock responses for AI review templates and configs.
 * Used for development and testing without making actual API calls.
 */

// Import mock data
import templatesData from '../../mock-data/ai-review-templates.json'
import configData from '../../mock-data/ai-review-config.json'

/**
 * Simulates a delay for API calls
 */
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Mock: Fetch all AI review templates with optional filters
 */
export const mockFetchAIReviewTemplates = async (filters = {}) => {
  await mockDelay()
  
  let templates = [...templatesData.templates]
  
  // Apply filters
  if (filters.challengeTrack) {
    templates = templates.filter(t => t.challengeTrack === filters.challengeTrack)
  }
  
  if (filters.challengeType) {
    templates = templates.filter(t => t.challengeType === filters.challengeType)
  }
  
  return templates
}

/**
 * Mock: Fetch a specific template by ID
 */
export const mockFetchAIReviewTemplate = async (templateId) => {
  await mockDelay()
  
  const template = templatesData.templates.find(t => t.id === templateId)
  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }
  
  return template
}

/**
 * Mock: Fetch template by track and type
 */
export const mockFetchTemplateByTrackAndType = async (challengeTrack, challengeType) => {
  await mockDelay()
  
  const template = templatesData.templates.find(
    t => t.challengeTrack === challengeTrack && t.challengeType === challengeType
  )
  
  return template || null
}

/**
 * Mock: Create a new template
 */
export const mockCreateAIReviewTemplate = async (templateData) => {
  await mockDelay()
  
  // Validate required fields
  if (!templateData.challengeTrack || !templateData.challengeType) {
    throw new Error('challengeTrack and challengeType are required')
  }
  
  if (templateData.minPassingThreshold === undefined) {
    throw new Error('minPassingThreshold is required')
  }
  
  // Validate workflow IDs
  if (templateData.workflows && templateData.workflows.length > 0) {
    const workflowIds = templateData.workflows.map(w => w.workflowId)
    if (workflowIds.some(id => !id || id.trim() === '')) {
      throw new Error('All workflows must have valid IDs')
    }
  }
  
  const newTemplate = {
    id: `template_${Date.now()}`,
    ...templateData,
    createdAt: new Date().toISOString(),
    createdBy: 'current_user',
    updatedAt: new Date().toISOString(),
    updatedBy: 'current_user'
  }
  
  templatesData.templates.push(newTemplate)
  return newTemplate
}

/**
 * Mock: Update a template
 */
export const mockUpdateAIReviewTemplate = async (templateId, templateData) => {
  await mockDelay()
  
  const index = templatesData.templates.findIndex(t => t.id === templateId)
  if (index === -1) {
    throw new Error(`Template not found: ${templateId}`)
  }
  
  // Validate workflow IDs if being updated
  if (templateData.workflows && templateData.workflows.length > 0) {
    const workflowIds = templateData.workflows.map(w => w.workflowId)
    if (workflowIds.some(id => !id || id.trim() === '')) {
      throw new Error('All workflows must have valid IDs')
    }
  }
  
  const updatedTemplate = {
    ...templatesData.templates[index],
    ...templateData,
    id: templateId, // Ensure ID doesn't change
    createdAt: templatesData.templates[index].createdAt, // Preserve creation date
    createdBy: templatesData.templates[index].createdBy, // Preserve creator
    updatedAt: new Date().toISOString(),
    updatedBy: 'current_user'
  }
  
  templatesData.templates[index] = updatedTemplate
  return updatedTemplate
}

/**
 * Mock: Delete a template
 */
export const mockDeleteAIReviewTemplate = async (templateId) => {
  await mockDelay()
  
  const index = templatesData.templates.findIndex(t => t.id === templateId)
  if (index === -1) {
    throw new Error(`Template not found: ${templateId}`)
  }
  
  templatesData.templates.splice(index, 1)
}

/**
 * Mock: Fetch AI review config for a challenge
 */
export const mockFetchAIReviewConfig = async (challengeId) => {
  await mockDelay()
  
  if (configData.challengeId === challengeId) {
    return configData
  }
  
  return null
}

/**
 * Mock: Create AI review config from template
 */
export const mockCreateAIReviewConfigFromTemplate = async (challengeId, templateId) => {
  await mockDelay()
  
  const template = await mockFetchAIReviewTemplate(templateId)
  
  const newConfig = {
    id: `config_${Date.now()}`,
    challengeId,
    minPassingThreshold: template.minPassingThreshold,
    autoFinalize: template.autoFinalize,
    mode: template.mode,
    formula: template.formula,
    workflows: template.workflows.map(w => ({
      id: `config_wf_${Date.now()}_${Math.random()}`,
      configId: `config_${Date.now()}`,
      workflowId: w.workflowId,
      weightPercent: w.weightPercent,
      isGating: w.isGating,
      createdAt: new Date().toISOString(),
      createdBy: 'current_user'
    })),
    createdAt: new Date().toISOString(),
    createdBy: 'current_user',
    updatedAt: new Date().toISOString(),
    updatedBy: 'current_user'
  }
  
  return newConfig
}
