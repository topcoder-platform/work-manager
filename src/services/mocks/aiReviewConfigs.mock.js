/**
 * Mock AI Review Configs Service for testing
 * 
 * This module provides mock responses for AI review configs.
 * Used for development and testing without making actual API calls.
 */

import configData from '../../mock-data/ai-review-config.json'

/**
 * Simulates a delay for API calls
 */
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory store for configs (persists during current session)
let configsStore = {
  [configData.challengeId]: JSON.parse(JSON.stringify(configData))
}

/**
 * Mock: Create a new AI review config
 */
export const mockCreateAIReviewConfig = async (configData) => {
  await mockDelay()

  // Validate required fields
  if (!configData.challengeId) {
    throw new Error('Challenge ID is required')
  }

  if (configData.minPassingThreshold === undefined || configData.minPassingThreshold === null) {
    throw new Error('minPassingThreshold is required')
  }

  if (!configData.mode || !['AI_GATING', 'AI_ONLY'].includes(configData.mode)) {
    throw new Error('Valid mode (AI_GATING or AI_ONLY) is required')
  }

  if (!configData.workflows || configData.workflows.length === 0) {
    throw new Error('At least one workflow is required')
  }

  // Validate workflow IDs
  const invalidWorkflows = configData.workflows.filter(w => !w.workflowId || w.workflowId.trim() === '')
  if (invalidWorkflows.length > 0) {
    throw new Error('All workflows must have valid workflow IDs')
  }

  // Check if config already exists for this challenge
  if (configsStore[configData.challengeId]) {
    throw new Error(`Config already exists for challenge ${configData.challengeId}. Use update instead.`)
  }

  const newConfig = {
    id: `config_${Date.now()}`,
    ...configData,
    workflows: configData.workflows.map((w, idx) => ({
      id: `config_wf_${Date.now()}_${idx}`,
      configId: `config_${Date.now()}`,
      workflowId: w.workflowId,
      weightPercent: w.weightPercent,
      isGating: w.isGating || false,
      createdAt: new Date().toISOString(),
      createdBy: 'current_user'
    })),
    createdAt: new Date().toISOString(),
    createdBy: 'current_user',
    updatedAt: new Date().toISOString(),
    updatedBy: 'current_user'
  }

  configsStore[configData.challengeId] = newConfig
  return newConfig
}

/**
 * Mock: Fetch config by challenge ID
 */
export const mockFetchAIReviewConfigByChallenge = async (challengeId) => {
  await mockDelay()

  if (!challengeId || challengeId.trim() === '') {
    throw new Error('Challenge ID is required')
  }

  const config = configsStore[challengeId]
  return config || null
}

/**
 * Mock: Update a config
 */
export const mockUpdateAIReviewConfig = async (configId, configUpdateData) => {
  await mockDelay()

  if (!configId || configId.trim() === '') {
    throw new Error('Config ID is required')
  }

  // Validate workflow IDs if being updated
  if (configUpdateData.workflows && configUpdateData.workflows.length > 0) {
    const invalidWorkflows = configUpdateData.workflows.filter(w => !w.workflowId || w.workflowId.trim() === '')
    if (invalidWorkflows.length > 0) {
      throw new Error('All workflows must have valid workflow IDs')
    }
  }

  // Find config by ID
  let foundConfig = null
  let challengeIdKey = null

  for (const [cId, config] of Object.entries(configsStore)) {
    if (config.id === configId) {
      foundConfig = config
      challengeIdKey = cId
      break
    }
  }

  if (!foundConfig) {
    throw new Error(`Config not found: ${configId}`)
  }

  const updatedConfig = {
    ...foundConfig,
    ...configUpdateData,
    id: configId, // Ensure ID doesn't change
    challengeId: foundConfig.challengeId, // Ensure challenge ID doesn't change
    createdAt: foundConfig.createdAt, // Preserve creation date
    createdBy: foundConfig.createdBy, // Preserve creator
    updatedAt: new Date().toISOString(),
    updatedBy: 'current_user'
  }

  // If workflows are being updated, transform them
  if (configUpdateData.workflows) {
    updatedConfig.workflows = configUpdateData.workflows.map((w, idx) => {
      // Preserve existing workflow ID if not being changed
      const existingWorkflow = foundConfig.workflows.find(ew => ew.workflowId === w.workflowId)
      return {
        id: existingWorkflow?.id || `config_wf_${Date.now()}_${idx}`,
        configId: configId,
        workflowId: w.workflowId,
        weightPercent: w.weightPercent,
        isGating: w.isGating || false,
        createdAt: existingWorkflow?.createdAt || new Date().toISOString(),
        createdBy: existingWorkflow?.createdBy || 'current_user'
      }
    })
  }

  configsStore[challengeIdKey] = updatedConfig
  return updatedConfig
}

/**
 * Mock: Delete a config
 */
export const mockDeleteAIReviewConfig = async (configId) => {
  await mockDelay()

  if (!configId || configId.trim() === '') {
    throw new Error('Config ID is required')
  }

  let found = false

  for (const [cId, config] of Object.entries(configsStore)) {
    if (config.id === configId) {
      delete configsStore[cId]
      found = true
      break
    }
  }

  if (!found) {
    throw new Error(`Config not found: ${configId}`)
  }
}

/**
 * Mock: Get all configs (utility function for testing)
 */
export const mockGetAllConfigs = async () => {
  await mockDelay(100)
  return Object.values(configsStore)
}

/**
 * Mock: Clear all configs (utility function for tests cleanup)
 */
export const mockClearAllConfigs = () => {
  configsStore = {}
}

/**
 * Mock: Reset to initial state
 */
export const mockResetConfigs = () => {
  configsStore = {
    [configData.challengeId]: JSON.parse(JSON.stringify(configData))
  }
}
