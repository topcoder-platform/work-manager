import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'

const { MEMBER_API_URL, GROUPS_API_URL } = process.env

/**
 * Api request for bulk searching members
 * @param {Array<string>} identifiers
 * @returns {Promise<*>}
 */
export function bulkSearchMembers (identifiers) {
  return axiosInstance
    .post(`${MEMBER_API_URL}/bulk-search`, { identifiers })
    .then((response) => _.get(response, 'data'))
}

/**
 * Api request for bulk creating a group
 * @param {Object} groupData
 * @returns {Promise<*>}
 */
export function bulkCreateGroup (groupData) {
  return axiosInstance
    .post(`${GROUPS_API_URL}/bulk-create`, groupData)
    .then((response) => _.get(response, 'data'))
}
