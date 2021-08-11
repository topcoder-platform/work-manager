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
