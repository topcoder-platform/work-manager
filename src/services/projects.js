import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import * as queryString from 'query-string'
const { PROJECT_API_URL } = process.env

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export async function fetchMemberProjects () {
  const params = {
    'status': 'active',
    'sort': 'lastActivityAt'
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
