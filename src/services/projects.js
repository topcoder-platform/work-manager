import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
/**
 * With V5 Projects API, we get all the user information such as handles
 * No need of MEMBER_API_V3_URL

import { MEMBER_API_V3_URL, PROJECT_API_URL } from '../config/constants'
 */
import { PROJECT_API_URL } from '../config/constants'

/**
 * Api request for fetching member's projects
 * @returns {Promise<*>}
 */
export async function fetchMemberProjects () {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/projects`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching project by id
 * @param id Project id
 * @returns {Promise<*>}
 */
export async function fetchProjectById (id) {
  const response = await axiosInstance.get(`${PROJECT_API_URL}/projects/${id}`)
  return _.get(response, 'data')
}

/**
 * Api request for fetching project members
 * @param ids ProjectMembers id array
 * @returns {Promise<*>}
 */
export async function fetchProjectMembers (id) {
  /**
    * The V4 Projects API was not returning member handles
    * The V5 Projects API does return all the information needed
    * No need to call /v4/members/_search to get all user information

  const query = encodeURI(_.map(ids, id => `userId:${id}`).join(' OR '))
  const fields = 'userId%2Chandle%2CphotoURL%2CfirstName%2ClastName'
  const response = await axiosInstance.get(
    `${MEMBER_API_V3_URL}/_search?fields=${fields}&query=${query}&limit=${ids.length}`)
    */
  const response = await axiosInstance.get(`${PROJECT_API_URL}/projects/${id}/members`)
  return _.get(response, 'data', [])
}
