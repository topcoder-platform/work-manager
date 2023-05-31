import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
const { MEMBER_API_URL } = process.env

/**
 * Api request for fetching user profile
 * @returns {Promise<*>}
 */
export async function fetchProfile (handle) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}/${handle}`)
  return _.get(response, 'data')
}

/**
 * Api request for searching profiles
 * @returns {Promise<*>}
 */
export async function searchProfiles (fields, queryObject = {}, limit) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}`, {
    params: {
      fields,
      ...queryObject,
      perPage: limit,
      page: 1
    }
  })
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching user profile by the list of userIds
 * @returns {Promise<*>}
 */
export async function searchProfilesByUserIds (userIds, fields = 'userId,handle,firstName,lastName,email', limit) {
  return searchProfiles(
    fields,
    {
      userIds
    },
    limit
  )
}

/**
 * Api request for finding (suggesting) users by the part of the handle
 * @returns {Promise<*>}
 */
export async function suggestProfiles (partialHandle) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}/autocomplete?term=${encodeURIComponent(partialHandle)}`)
  return _.get(response, 'data')
}
