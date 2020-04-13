import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
const { PROJECT_API_URL } = process.env

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export async function fetchMemberProjects () {
  const response = await axiosInstance.get(`${PROJECT_API_URL}`)
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
