import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import { MEMBER_API_V3_URL } from '../config/constants'

/**
 * Api request for fetching user profile
 * @returns {Promise<*>}
 */
export async function fetchProfile (handle) {
  const response = await axiosInstance.get(`${MEMBER_API_V3_URL}/${handle}`)
  return _.get(response, 'data.result.content')
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
