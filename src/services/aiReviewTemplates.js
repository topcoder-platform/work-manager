import _ from 'lodash'
import qs from 'qs'

import { API_V6 } from '../config/constants'

import { axiosInstance } from './axiosWithAuth'

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
    const response = await axiosInstance.get(`${API_V6}/ai-review/templates${queryString}`)
    return _.get(response, 'data', [])
  } catch (error) {
    console.error('Error fetching AI review templates:', error.message)
    throw error
  }
}
