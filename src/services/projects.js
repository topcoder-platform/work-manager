import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
const { MEMBER_API_V3_URL, PROJECT_API_URL } = process.env

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export async function fetchMemberProjects () {
  const response = await axiosInstance.get(`${PROJECT_API_URL}?limit=1000`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for fetching project by id
 * @param id Project id
 * @returns {Promise<*>}
 */
export async function fetchProjectById (id) {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/${id}`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for fetching project members
 * @param ids ProjectMembers id array
 * @returns {Promise<*>}
 */
export async function fetchProjectMembers (ids) {
  const query = encodeURI(_.map(ids, id => `userId:${id}`).join(' OR '))
  const fields = 'userId%2Chandle%2CphotoURL%2CfirstName%2ClastName'
  const response = await axiosInstance.get(
    `${MEMBER_API_V3_URL}/_search?fields=${fields}&query=${query}&limit=${ids.length}`)
  return _.get(response, 'data.result.content')
}
