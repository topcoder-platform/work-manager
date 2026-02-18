import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'

const { AI_REVIEW_CONFIGS_API_URL } = process.env

/**
 * Create a new AI review config for a challenge
 * @param {Object} configData - The config data (challengeId, minPassingThreshold, mode, workflows, etc.)
 * @returns {Promise<Object>}
 */
export async function createAIReviewConfig (configData) {
  try {
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

    const response = await axiosInstance.post(
      `${AI_REVIEW_CONFIGS_API_URL}/ai-review/configs`,
      configData
    )
    return _.get(response, 'data', {})
  } catch (error) {
    console.error('Error creating AI review config:', error.message)
    throw error
  }
}

/**
 * Fetch AI review config for a specific challenge
 * @param {String} challengeId - The ID of the challenge
 * @returns {Promise<Object>}
 */
export async function fetchAIReviewConfigByChallenge (challengeId) {
  try {
    if (!challengeId || challengeId.trim() === '') {
      throw new Error('Challenge ID is required')
    }

    const response = await axiosInstance.get(
      `${AI_REVIEW_CONFIGS_API_URL}/ai-review/configs/${challengeId}`
    )
    return _.get(response, 'data', null)
  } catch (error) {
    // 404 is expected when no config exists yet
    if (error.response && error.response.status === 404) {
      return null
    }
    console.error(`Error fetching AI review config for challenge ${challengeId}:`, error.message)
    throw error
  }
}

/**
 * Update an existing AI review config
 * @param {String} configId - The ID of the config to update
 * @param {Object} configData - The updated config data
 * @returns {Promise<Object>}
 */
export async function updateAIReviewConfig (configId, configData) {
  try {
    if (!configId || configId.trim() === '') {
      throw new Error('Config ID is required')
    }

    // Validate workflow IDs if being updated
    if (configData.workflows && configData.workflows.length > 0) {
      const invalidWorkflows = configData.workflows.filter(w => !w.workflowId || w.workflowId.trim() === '')
      if (invalidWorkflows.length > 0) {
        throw new Error('All workflows must have valid workflow IDs')
      }
    }

    const response = await axiosInstance.put(
      `${AI_REVIEW_CONFIGS_API_URL}/ai-review/configs/${configId}`,
      configData
    )
    return _.get(response, 'data', {})
  } catch (error) {
    console.error(`Error updating AI review config ${configId}:`, error.message)
    throw error
  }
}

/**
 * Delete an AI review config
 * @param {String} configId - The ID of the config to delete
 * @returns {Promise<void>}
 */
export async function deleteAIReviewConfig (configId) {
  try {
    if (!configId || configId.trim() === '') {
      throw new Error('Config ID is required')
    }

    await axiosInstance.delete(
      `${AI_REVIEW_CONFIGS_API_URL}/ai-review/configs/${configId}`
    )
  } catch (error) {
    console.error(`Error deleting AI review config ${configId}:`, error.message)
    throw error
  }
}
