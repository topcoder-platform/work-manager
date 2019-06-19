import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import { MEMBER_API_V3_URL, PROJECT_API_URL } from '../config/constants'

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export async function fetchMemberProjects () {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/projects?limit=1000`)
  return _.get(response, 'data.result.content')
}

export async function fetchProjectById (id) {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/projects/${id}`)
  return _.get(response, 'data.result.content')
}
export async function fetchProjectMembers (ids) {
  const query = encodeURI(_.map(ids, id => `userId:${id}`).join(' OR '))
  const fields = 'userId%2Chandle%2CphotoURL%2CfirstName%2ClastName'
  const response = await axiosInstance.get(
    `${MEMBER_API_V3_URL}/_search?fields=${fields}&query=${query}&limit=${ids.length}`)
  return _.get(response, 'data.result.content')
}
