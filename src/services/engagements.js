import qs from 'qs'
import { axiosInstance } from './axiosWithAuth'

const { ENGAGEMENTS_API_URL } = process.env

/**
 * Api request for fetching engagements
 * @param {Object} filters
 * @param {Object} params
 * @returns {Promise<*>}
 */
export function fetchEngagements (filters = {}, params = {}) {
  const query = {
    ...filters,
    ...params
  }
  const queryString = qs.stringify(query, { encode: false })
  const querySuffix = queryString ? `?${queryString}` : ''
  return axiosInstance.get(`${ENGAGEMENTS_API_URL}${querySuffix}`)
}

/**
 * Api request for fetching engagement details
 * @param {String|Number} engagementId
 * @returns {Promise<*>}
 */
export function fetchEngagement (engagementId) {
  return axiosInstance.get(`${ENGAGEMENTS_API_URL}/${engagementId}`)
}

/**
 * Api request for creating engagement
 * @param {Object} engagement
 * @returns {Promise<*>}
 */
export function createEngagement (engagement) {
  return axiosInstance.post(ENGAGEMENTS_API_URL, engagement)
}

/**
 * Api request for updating engagement
 * @param {String|Number} engagementId
 * @param {Object} engagement
 * @returns {Promise<*>}
 */
export function updateEngagement (engagementId, engagement) {
  return axiosInstance.put(`${ENGAGEMENTS_API_URL}/${engagementId}`, engagement)
}

/**
 * Api request for partially updating engagement
 * @param {String|Number} engagementId
 * @param {Object} params
 * @returns {Promise<*>}
 */
export function patchEngagement (engagementId, params) {
  return axiosInstance.patch(`${ENGAGEMENTS_API_URL}/${engagementId}`, params)
}

/**
 * Api request for deleting engagement
 * @param {String|Number} engagementId
 * @returns {Promise<*>}
 */
export function deleteEngagement (engagementId) {
  return axiosInstance.delete(`${ENGAGEMENTS_API_URL}/${engagementId}`)
}

/**
 * Api request for fetching applications for an engagement
 * @param {String|Number} engagementId
 * @param {Object} filters
 * @param {Object} params
 * @returns {Promise<*>}
 */
export function fetchApplications (engagementId, filters = {}, params = {}) {
  const query = {
    ...filters,
    ...params
  }
  const queryString = qs.stringify(query, { encode: false })
  const querySuffix = queryString ? `?${queryString}` : ''
  return axiosInstance.get(`${ENGAGEMENTS_API_URL}/${engagementId}/applications${querySuffix}`)
}

/**
 * Api request for fetching application details
 * @param {String|Number} engagementId
 * @param {String|Number} applicationId
 * @returns {Promise<*>}
 */
export function fetchApplication (engagementId, applicationId) {
  return axiosInstance.get(`${ENGAGEMENTS_API_URL}/${engagementId}/applications/${applicationId}`)
}

/**
 * Api request for updating application status
 * @param {String|Number} engagementId
 * @param {String|Number} applicationId
 * @param {String} status
 * @returns {Promise<*>}
 */
export function updateApplicationStatus (engagementId, applicationId, status) {
  return axiosInstance.patch(`${ENGAGEMENTS_API_URL}/${engagementId}/applications/${applicationId}`, { status })
}
