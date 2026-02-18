import _ from 'lodash'
import qs from 'qs'
import { axiosInstance } from './axiosWithAuth'

const { AI_REVIEW_TEMPLATES_API_URL } = process.env

/**
 * Fetch all AI review templates with optional filters
 * @param {Object} filters - Filter options (challengeTrack, challengeType)
 * @returns {Promise<Array>}
 */
export async function fetchAIReviewTemplates (filters = {}) {
  try {
    const queryString = Object.keys(filters).length > 0
      ? `?${qs.stringify(filters, { encode: false })}`
      : ''
    const response = await axiosInstance.get(`${AI_REVIEW_TEMPLATES_API_URL}/ai-review/templates${queryString}`)
    return _.get(response, 'data', [])
  } catch (error) {
    console.error('Error fetching AI review templates:', error.message)
    throw error
  }
}

/**
 * Fetch a specific AI review template by ID
 * @param {String} templateId - The ID of the template to fetch
 * @returns {Promise<Object>}
 */
export async function fetchAIReviewTemplate (templateId) {
  try {
    const response = await axiosInstance.get(`${AI_REVIEW_TEMPLATES_API_URL}/ai-review/templates/${templateId}`)
    return _.get(response, 'data', {})
  } catch (error) {
    console.error(`Error fetching AI review template ${templateId}:`, error.message)
    throw error
  }
}

/**
 * Create a new AI review template
 * @param {Object} templateData - The template data
 * @returns {Promise<Object>}
 */
export async function createAIReviewTemplate (templateData) {
  try {
    // Validate required workflow IDs exist
    if (templateData.workflows && templateData.workflows.length > 0) {
      const workflowIds = templateData.workflows.map(w => w.workflowId)
      // Note: In a real scenario, you'd validate these IDs against the workflows API
      if (!Array.isArray(workflowIds) || workflowIds.some(id => !id || id.trim() === '')) {
        throw new Error('All workflows must have valid IDs')
      }
    }

    const response = await axiosInstance.post(
      `${AI_REVIEW_TEMPLATES_API_URL}/ai-review/templates`,
      templateData
    )
    return _.get(response, 'data', {})
  } catch (error) {
    console.error('Error creating AI review template:', error.message)
    throw error
  }
}

/**
 * Update an existing AI review template
 * @param {String} templateId - The ID of the template to update
 * @param {Object} templateData - The updated template data
 * @returns {Promise<Object>}
 */
export async function updateAIReviewTemplate (templateId, templateData) {
  try {
    // Validate required workflow IDs exist if workflows are being updated
    if (templateData.workflows && templateData.workflows.length > 0) {
      const workflowIds = templateData.workflows.map(w => w.workflowId)
      if (!Array.isArray(workflowIds) || workflowIds.some(id => !id || id.trim() === '')) {
        throw new Error('All workflows must have valid IDs')
      }
    }

    const response = await axiosInstance.put(
      `${AI_REVIEW_TEMPLATES_API_URL}/ai-review/templates/${templateId}`,
      templateData
    )
    return _.get(response, 'data', {})
  } catch (error) {
    console.error(`Error updating AI review template ${templateId}:`, error.message)
    throw error
  }
}

/**
 * Delete an AI review template
 * @param {String} templateId - The ID of the template to delete
 * @returns {Promise<void>}
 */
export async function deleteAIReviewTemplate (templateId) {
  try {
    await axiosInstance.delete(`${AI_REVIEW_TEMPLATES_API_URL}/ai-review/templates/${templateId}`)
  } catch (error) {
    console.error(`Error deleting AI review template ${templateId}:`, error.message)
    throw error
  }
}

/**
 * Fetch and filter AI review templates by challenge track and type
 * @param {String} challengeTrack - The challenge track
 * @param {String} challengeType - The challenge type
 * @returns {Promise<Object>}
 */
export async function fetchTemplateByTrackAndType (challengeTrack, challengeType) {
  try {
    const filters = {
      challengeTrack,
      challengeType
    }
    const templates = await fetchAIReviewTemplates(filters)
    // Return the first matching template or null if none found
    return templates.length > 0 ? templates[0] : null
  } catch (error) {
    console.error(`Error fetching template for ${challengeTrack}/${challengeType}:`, error.message)
    throw error
  }
}
