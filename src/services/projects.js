import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import * as queryString from 'query-string'
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
