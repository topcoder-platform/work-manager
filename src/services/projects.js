import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import * as queryString from 'query-string'
import {
  GENERIC_PROJECT_MILESTONE_PRODUCT_NAME,
  GENERIC_PROJECT_MILESTONE_PRODUCT_TYPE, PHASE_PRODUCT_CHALLENGE_ID_FIELD,
  PHASE_PRODUCT_TEMPLATE_ID
} from '../config/constants'
const { PROJECT_API_URL } = process.env

/**
 * Get billing account based on project id
 *
 * @param {String} projectId Id of the project
 *
 * @returns {Promise<Object>} Billing account data
 */
export async function fetchBillingAccount (projectId) {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/${projectId}/billingAccount`)
  return _.get(response, 'data')
}

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export async function fetchMemberProjects (filters) {
  const params = {
    ...filters
  }

  const response = await axiosInstance.get(`${PROJECT_API_URL}?${queryString.stringify(params)}`)
  return _.get(response, 'data')
}

/**
 * Api request for fetching project by id
 * @param id Project id
 * @returns {Promise<*>}
 */
export async function fetchProjectById (id) {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/${id}`)
  return _.get(response, 'data')
}

/**
 * Api request for fetching project phases
 * @param id Project id
 * @returns {Promise<*>}
 */
export async function fetchProjectPhases (id) {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/${id}/phases`, {
    params: {
      fields: 'id,name,products,status'
    }
  })
  return _.get(response, 'data')
}

/**
 * updates the role for the member for the given project id
 * @param projectId project id
 * @param memberRecordId the id for the member record to update
 * @param newRole the new role
 * @returns {Promise<*>}
 */
export async function updateProjectMemberRole (projectId, memberRecordId, newRole) {
  const response = await axiosInstance.patch(`${PROJECT_API_URL}/${projectId}/members/${memberRecordId}`, {
    role: newRole
  })
  return _.get(response, 'data')
}

/**
 * adds the given user to the given project with the specified role
 * @param projectId project id
 * @param userId user id
 * @param role
 * @returns {Promise<*>}
 */
export async function addUserToProject (projectId, userId, role) {
  const response = await axiosInstance.post(`${PROJECT_API_URL}/${projectId}/members`, {
    userId,
    role
  })
  return _.get(response, 'data')
}

/**
 * removes the given member record from the project
 * @param projectId project id
 * @param memberRecordId member record id
 * @returns {Promise<*>}
 */
export async function removeUserFromProject (projectId, memberRecordId) {
  const response = await axiosInstance.delete(`${PROJECT_API_URL}/${projectId}/members/${memberRecordId}`)
  return response
}

/**
 * Save challengeId as Phase product detail
 * @param projectId Project id
 * @param phaseId phase id
 * @param challengeId challengeId
 * @param isNewChallenge indicated if it's for newly created challenge
 * @returns {Promise<*>}
 */
export async function saveChallengeAsPhaseProduct (projectId, phaseId, challengeId, isNewChallenge = false) {
  // Remove from other phase, if it's called for update
  if (!isNewChallenge) {
    await removeChallengeFromPhaseProduct(projectId, challengeId)
  }
  const payload = {
    name: GENERIC_PROJECT_MILESTONE_PRODUCT_NAME,
    type: GENERIC_PROJECT_MILESTONE_PRODUCT_TYPE,
    templateId: PHASE_PRODUCT_TEMPLATE_ID,
    // The api requires actualPrice and estimatedPrice to be set as positive numbers
    // It doesn't update elasticsearch index if the values are null
    actualPrice: 1,
    estimatedPrice: 1
  }

  return axiosInstance.post(`${PROJECT_API_URL}/${projectId}/phases/${phaseId}/products`,
    _.set(payload, PHASE_PRODUCT_CHALLENGE_ID_FIELD, challengeId)
  )
}

/**
 * Removes challenge from phase product it belongs to
 * @param projectId Project id
 * @param challengeId challengeId
 * @returns {Promise<*>}
 */
export async function removeChallengeFromPhaseProduct (projectId, challengeId) {
  // first fetch products again to make sure we have the latest products
  const phases = await fetchProjectPhases(projectId)
  let selectedMilestoneProduct
  _.some(phases,
    phase => {
      const product = _.find(_.get(phase, 'products', []),
        product => _.get(product, PHASE_PRODUCT_CHALLENGE_ID_FIELD) === challengeId
      )
      if (product) {
        selectedMilestoneProduct = {
          phaseId: phase.id,
          productId: product.id
        }
        return true
      }
    })

  if (selectedMilestoneProduct) {
    // If its the only challenge in product and product doesn't contain any other detail just delete it
    return axiosInstance.delete(`${PROJECT_API_URL}/${projectId}/phases/${selectedMilestoneProduct.phaseId}/products/${selectedMilestoneProduct.productId}`)
  }
}

/**
 * Create project
 * @param project project
 * @returns {Promise<*>}
 */
export async function createProjectApi (project) {
  const response = await axiosInstance.post(`${PROJECT_API_URL}`, project)
  return _.get(response, 'data')
}

/**
 * Update project
 * @param projectId project id
 * @param project project
 * @returns {Promise<*>}
 */
export async function updateProjectApi (projectId, project) {
  const response = await axiosInstance.patch(`${PROJECT_API_URL}/${projectId}`, project)
  return _.get(response, 'data')
}

/**
 * Get project types
 * @returns {Promise<*>}
 */
export async function getProjectTypes () {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/metadata/projectTypes`)
  return _.get(response, 'data')
}
