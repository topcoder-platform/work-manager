import _ from 'lodash'
import qs from 'qs'
import { axiosInstance } from './axiosWithAuth'
import { updateChallengePhaseBeforeSendRequest, normalizeChallengeDataFromAPI } from '../util/date'
import { GROUPS_DROPDOWN_PER_PAGE } from '../config/constants'
const {
  CHALLENGE_API_URL,
  CHALLENGE_TYPES_URL,
  CHALLENGE_TRACKS_URL,
  CHALLENGE_TIMELINE_TEMPLATES_URL,
  CHALLENGE_PHASES_URL,
  CHALLENGE_TIMELINES_URL,
  SUBMISSIONS_API_URL,
  GROUPS_API_URL,
  PLATFORMS_V4_API_URL,
  TECHNOLOGIES_V4_API_URL,
  TERMS_API_URL,
  RESOURCES_API_URL,
  RESOURCE_ROLES_API_URL
} = process.env

/**
 * Api request for fetching challenge types
 * @returns {Promise<*>}
 */
export async function fetchChallengeTypes () {
  const response = await axiosInstance.get(`${CHALLENGE_TYPES_URL}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge tracks
 * @returns {Promise<*>}
 */
export async function fetchChallengeTracks () {
  const response = await axiosInstance.get(`${CHALLENGE_TRACKS_URL}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge tags
 * @returns {Promise<*>}
 */
export async function fetchChallengeTags () {
  const platforms = await axiosInstance.get(PLATFORMS_V4_API_URL)
  const technologies = await axiosInstance.get(TECHNOLOGIES_V4_API_URL)
  return [
    ..._.map(_.get(platforms, 'data.result.content', []), tag => _.pick(tag, 'name')),
    ..._.map(_.get(technologies, 'data.result.content', []), tag => _.pick(tag, 'name'))
  ]
}

/**
 * Api request for fetching Groups
 *
 * @param filters
 * @returns {Promise<*>}
 */
export async function fetchGroups (filters, params = '') {
  const finalFilters = filters && Object.keys(filters).length > 0
    ? {
      ...filters,
      perPage: GROUPS_DROPDOWN_PER_PAGE // make sure that we are retrieving all the groups
    }
    : {}
  const response = await axiosInstance.get(`${GROUPS_API_URL}${params}?${qs.stringify(finalFilters, { encode: false })}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching Group Detail
 *
 * @param groupId
 * @returns {Promise<*>}
 */
export async function fetchGroupDetail (id) {
  const response = await axiosInstance.get(`${GROUPS_API_URL}/${id}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching timeline templates
 * @returns {Promise<*>}
 */
export async function fetchTimelineTemplates () {
  const response = await axiosInstance.get(`${CHALLENGE_TIMELINE_TEMPLATES_URL}?page=1&perPage=100`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge timelines
 * @returns {Promise<*>}
 */
export async function fetchChallengeTimelines () {
  const response = await axiosInstance.get(`${CHALLENGE_TIMELINES_URL}?page=1&perPage=100`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge phases
 * @returns {Promise<*>}
 */
export async function fetchChallengePhases () {
  const response = await axiosInstance.get(`${CHALLENGE_PHASES_URL}?page=1&perPage=100`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge details
 * @param projectId Challenge id
 * @returns {Promise<*>}
 */
export async function fetchChallenge (challengeId) {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/${challengeId}`)
  return normalizeChallengeDataFromAPI(_.get(response, 'data'))
}

/**
 * Api request for creating new challenge
 * @param challenge challenge data
 * @returns {Promise<*>} challenge data
 */
export function createChallenge (challenge) {
  return axiosInstance.post(CHALLENGE_API_URL, updateChallengePhaseBeforeSendRequest(challenge)).then(response => {
    return normalizeChallengeDataFromAPI(_.get(response, 'data'))
  })
}

/**
 * Api request for updating challenge
 * @param challengeId Challenge id
 * @param challenge challenge data
 * @returns {Promise<*>} challenge data
 */
export function updateChallenge (challengeId, challenge) {
  return axiosInstance.put(`${CHALLENGE_API_URL}/${challengeId}`, updateChallengePhaseBeforeSendRequest(challenge)).then(response => {
    return normalizeChallengeDataFromAPI(_.get(response, 'data'))
  })
}

/**
 * Create attachments
 *
 * @param {String|Number} challengeId  challenge id
 * @param {Object[]}      attachments  list of attachments
 *
 * @returns {Promise<*>} attachments data
 */
export function createAttachments (challengeId, attachments) {
  return axiosInstance.post(`${CHALLENGE_API_URL}/${challengeId}/attachments`, attachments)
}

/**
 * Remove attachment
 *
 * @param {String|Number} challengeId  challenge id
 * @param {String|Number} attachmentId attachment id
 *
 * @returns {Promise<void>}
 */
export function removeAttachment (challengeId, attachmentId) {
  return axiosInstance.delete(`${CHALLENGE_API_URL}/${challengeId}/attachments/${attachmentId}`)
}

/**
 * Fetch challenges from v5 API
 * @param filters
 * @param params
 */
export function fetchChallenges (filters, params) {
  const query = {
    ...filters,
    ...params
  }
  return axiosInstance.get(`${CHALLENGE_API_URL}?${qs.stringify(query, { encode: false })}`).then(response => {
    // normalize challenge data in the list of challenges for consistency with data of a single challenge details page
    response.data = response.data.map(normalizeChallengeDataFromAPI)
    return response
  })
}

/**
 * Partially update the challenge with the provided id. Only the fields that are provided in the body will be changed.
 * @param challengeId
 * @param params
 */
export function patchChallenge (challengeId, params) {
  return axiosInstance.patch(`${CHALLENGE_API_URL}/${challengeId}`, updateChallengePhaseBeforeSendRequest(params)).then(rs => {
    return normalizeChallengeDataFromAPI(_.get(rs, 'data'))
  })
}

/*
* Deletes the challenge with the provided id.
* @param challengeId
*/
export function deleteChallenge (challengeId) {
  return axiosInstance.delete(`${CHALLENGE_API_URL}/${challengeId}`)
}

/**
 * Api request for fetching challenge terms
 * @returns {Promise<*>}
 */
export async function fetchChallengeTerms () {
  const query = { page: 1, perPage: 10 }
  const response = await axiosInstance.get(`${TERMS_API_URL}?${qs.stringify(query, { encode: false })}`)
  const responseData = _.get(response, 'data', [])
  const returnData = responseData.result.map(element => _.pick(element, ['id', 'title']))
  return returnData
}

/**
 * Api request for creating new resource
 * @param challenge challenge data
 * @returns {Promise<*>}
 */
export async function createResource (resource) {
  const resp = await axiosInstance.post(RESOURCES_API_URL, resource)
  return _.get(resp, 'data', {})
}

/**
 * Api request for fetching challenge resources
 * @param challengeId Challenge id
 * @returns {Promise<*>}
 */
export async function fetchResources (challengeId) {
  const response = await axiosInstance.get(`${RESOURCES_API_URL}?challengeId=${challengeId}`)
  return _.get(response, 'data', [])
}

/**
* Api request for fetching submissions
* @param challengeId Challenge id
* @returns {Promise<*>}
*/
export async function fetchSubmissions (challengeId) {
  const response = await axiosInstance.get(`${SUBMISSIONS_API_URL}?challengeId=${challengeId}&perPage=100`)
  return _.get(response, 'data', [])
}

/**
* Api request for fetching resource roles
* @returns {Promise<*>}
*/
export async function fetchResourceRoles () {
  const response = await axiosInstance.get(RESOURCE_ROLES_API_URL)
  return _.get(response, 'data', [])
}

/**
 * Api request for deleting a resource
 * @param {object} resource to delete
 * @returns {Promise<*>}
 */
export async function deleteResource (resource) {
  const resp = await axiosInstance.delete(RESOURCES_API_URL, { data: resource })
  return _.get(resp, 'data', {})
}
