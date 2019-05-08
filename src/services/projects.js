import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import { PROJECT_API_URL } from '../config/constants'

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export async function fetchMemberProjects () {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/direct/projects/user`)
  return _.get(response, 'data.result.content')
}
