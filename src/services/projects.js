import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import * as queryString from 'query-string'
import {
  ATTACHMENT_TYPE_FILE,
  FILE_PICKER_SUBMISSION_CONTAINER_NAME,
  GENERIC_PROJECT_MILESTONE_PRODUCT_NAME,
  GENERIC_PROJECT_MILESTONE_PRODUCT_TYPE,
  PHASE_PRODUCT_CHALLENGE_ID_FIELD,
  PHASE_PRODUCT_TEMPLATE_ID,
  PROJECTS_API_URL
} from '../config/constants'
import { paginationHeaders } from '../util/pagination'
import { createProjectMemberInvite } from './projectMemberInvites'

/**
 * Get billing accounts based on project id
 *
 * @param {String} projectId Id of the project
 *
 * @returns {Promise<Object>} Billing accounts data
 */
export async function fetchBillingAccounts (projectId) {
  const response = await axiosInstance.get(`${PROJECTS_API_URL}/${projectId}/billingAccounts`)
  return _.get(response, 'data')
}

/**
 * Get billing account based on project id
 *
 * @param {String} projectId Id of the project
 *
 * @returns {Promise<Object>} Billing account data
 */
export async function fetchBillingAccount (projectId) {
  const response = await axiosInstance.get(`${PROJECTS_API_URL}/${projectId}/billingAccount`)
  return _.get(response, 'data')
}

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export function fetchMemberProjects (filters) {
  const params = {
    ...filters
  }

  for (let param in params) {
    if (params[param] && Array.isArray(params[param])) {
      params[`${param}[$in]`] = params[param]
      params[param] = undefined
    }
  }

  return axiosInstance.get(`${PROJECTS_API_URL}?${queryString.stringify(params)}`).then(response => {
    return { projects: _.get(response, 'data'), pagination: paginationHeaders(response) }
  })
}

/**
 * Api request for fetching project by id
 * @param id Project id
 * @returns {Promise<*>}
 */
export async function fetchProjectById (id) {
  const response = await axiosInstance.get(`${PROJECTS_API_URL}/${id}`)
  return _.get(response, 'data')
}

/**
 * Api request for fetching project phases
 * @param id Project id
 * @returns {Promise<*>}
 */
export async function fetchProjectPhases (id) {
  const response = await axiosInstance.get(`${PROJECTS_API_URL}/${id}/phases`, {
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
  const response = await axiosInstance.patch(`${PROJECTS_API_URL}/${projectId}/members/${memberRecordId}`, {
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
  const response = await axiosInstance.post(`${PROJECTS_API_URL}/${projectId}/members`, {
    userId,
    role
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
export async function inviteUserToProject (projectId, email, role) {
  return createProjectMemberInvite(projectId, {
    emails: [email],
    role: role
  })
}

/**
 * removes the given member record from the project
 * @param projectId project id
 * @param memberRecordId member record id
 * @returns {Promise<*>}
 */
export async function removeUserFromProject (projectId, memberRecordId) {
  const response = await axiosInstance.delete(`${PROJECTS_API_URL}/${projectId}/members/${memberRecordId}`)
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

  return axiosInstance.post(`${PROJECTS_API_URL}/${projectId}/phases/${phaseId}/products`,
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
    return axiosInstance.delete(`${PROJECTS_API_URL}/${projectId}/phases/${selectedMilestoneProduct.phaseId}/products/${selectedMilestoneProduct.productId}`)
  }
}

/**
 * Create project
 * @param project project
 * @returns {Promise<*>}
 */
export async function createProjectApi (project) {
  const response = await axiosInstance.post(`${PROJECTS_API_URL}`, project)
  return _.get(response, 'data')
}

/**
 * Update project
 * @param projectId project id
 * @param project project
 * @returns {Promise<*>}
 */
export async function updateProjectApi (projectId, project) {
  const response = await axiosInstance.patch(`${PROJECTS_API_URL}/${projectId}`, project)
  return _.get(response, 'data')
}

/**
 * Get project types
 * @returns {Promise<*>}
 */
export async function getProjectTypes () {
  const response = await axiosInstance.get(`${PROJECTS_API_URL}/metadata/projectTypes`)
  return _.get(response, 'data')
}

/**
 * Get project attachment
 * @param projectId project id
 * @param attachmentId attachment id
 * @returns {Promise<*>}
 */
export async function getProjectAttachment (projectId, attachmentId) {
  const response = await axiosInstance.get(
    `${PROJECTS_API_URL}/${projectId}/attachments/${attachmentId}`
  )
  return _.get(response, 'data')
}

/**
 * Add attachment to project
 * @param projectId project id
 * @param data attachment data
 * @returns {Promise<*>}
 */
export async function addProjectAttachmentApi (projectId, data) {
  if (data.type === ATTACHMENT_TYPE_FILE) {
    // add s3 bucket prop
    data.s3Bucket = FILE_PICKER_SUBMISSION_CONTAINER_NAME
  }

  // The api takes only arrays
  if (!data.tags) {
    data.tags = []
  }

  const response = await axiosInstance.post(
    `${PROJECTS_API_URL}/${projectId}/attachments`,
    data
  )
  return _.get(response, 'data')
}

/**
 * Update project attachment
 * @param projectId project id
 * @param attachmentId attachment id
 * @param attachment attachment data
 * @returns {Promise<*>}
 */
export async function updateProjectAttachmentApi (
  projectId,
  attachmentId,
  attachment
) {
  let data = {
    ...attachment
  }
  if (data && (!data.allowedUsers || data.allowedUsers.length === 0)) {
    data.allowedUsers = null
  }

  // The api takes only arrays
  if (data && !data.tags) {
    data.tags = []
  }

  const response = await axiosInstance.patch(
    `${PROJECTS_API_URL}/${projectId}/attachments/${attachmentId}`,
    data
  )
  return _.get(response, 'data')
}

/**
 * Remove project attachment
 * @param projectId project id
 * @param attachmentId attachment id
 */
export async function removeProjectAttachmentApi (projectId, attachmentId) {
  await axiosInstance.delete(
    `${PROJECTS_API_URL}/${projectId}/attachments/${attachmentId}`
  )
}
