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
    fetchAll: (filters) => service.mockFetchAIReviewTemplates 
      ? service.mockFetchAIReviewTemplates(filters)
      : service.fetchAIReviewTemplates(filters),
  }
}