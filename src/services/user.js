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
  const chunkSize = 50
  let userInfos = []
  const uniqueUserIds = _.uniq(userIds)
  for (let i = 0; i < uniqueUserIds.length; i += chunkSize) {
    const chunkUserIds = uniqueUserIds.slice(i, i + chunkSize)
    const userInfosTmp = await searchProfiles(
      fields,
      {
        userIds: chunkUserIds
      },
      limit
    )
    userInfos = [...userInfos, ...userInfosTmp]
  }

  return userInfos
}

/**
 * Api request for finding (suggesting) users by the part of the handle
 * @returns {Promise<*>}
 */
export async function suggestProfiles (partialHandle) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}/autocomplete?term=${encodeURIComponent(partialHandle)}`)
  return _.get(response, 'data')
}

/**
 * Api request for downloading a member profile pdf
 * @returns {Promise<Blob>}
 */
export async function downloadMemberProfile (handle) {
  const encodedHandle = encodeURIComponent(handle)
  const response = await axiosInstance.get(`${MEMBER_API_URL}/${encodedHandle}/profileDownload`, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf'
    }
  })
  return _.get(response, 'data')
}
