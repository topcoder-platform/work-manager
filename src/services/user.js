import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
const { MEMBER_API_URL, MEMBER_API_V3_URL } = process.env

/**
 * Api request for fetching user profile
 * @returns {Promise<*>}
 */
export async function fetchProfile (handle) {
  const response = await axiosInstance.get(`${MEMBER_API_V3_URL}/${handle}`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for fetching user profile v5
 * @returns {Promise<*>}
 */
export async function fetchProfileV5 (handle) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}/${handle}`)
  const data = _.get(response, 'data')
  return data.length ? data[0] : undefined
}

/**
 * Api request for fetching user profile
 * @returns {Promise<*>}
 */
export async function searchProfiles (fields, query, limit) {
  const response = await axiosInstance.get(`${MEMBER_API_V3_URL}/_search`, {
    params: {
      fields,
      query,
      limit
    }
  })
  return _.get(response, 'data.result.content')
}

/**
 * Api request for fetching user profile by the list of userIds
 * @returns {Promise<*>}
 */
export async function searchProfilesByUserIds (userIds, fields = 'userId,handle,firstName,lastName,email', limit) {
  const response = await axiosInstance.get(`${MEMBER_API_V3_URL}/_search`, {
    params: {
      query: `${_.map(userIds, id => `userId:${id}`).join(encodeURIComponent(' OR '))}`,
      fields,
      limit
    }
  })
  return _.get(response, 'data.result.content')
}

/**
 * Api request for finding (suggesting) users by the part of the handle
 * @returns {Promise<*>}
 */
export async function suggestProfiles (partialHandle) {
  const response = await axiosInstance.get(`${MEMBER_API_V3_URL}/_suggest/${encodeURIComponent(partialHandle)}`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for finding (suggesting) users by the part of the handle
 * @returns {Promise<*>}
 */
export async function suggestProfilesV5 (partialHandle) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}/autocomplete?term=${encodeURIComponent(partialHandle)}`)
  return _.get(response, 'data')
}
