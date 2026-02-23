/**
 * Mock AI Review Services
 * 
 * This module exports both real and mock implementations of the AI review services.
 * Use the 'real' implementations for production and the 'mock' for testing/development.
 */

// Real implementations (use axiosInstance for API calls)
export * from '../aiReviewTemplates'
export * from '../aiReviewConfigs'

// Mock implementations (use static data)
export * as mockTemplates from './aiReviewTemplates.mock'
export * as mockConfigs from './aiReviewConfigs.mock'
