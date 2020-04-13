import _ from 'lodash'
import qs from 'qs'
import { axiosInstance } from './axiosWithAuth'
import FormData from 'form-data'
const {
  CHALLENGE_API_URL,
  CHALLENGE_TYPES_URL,
  CHALLENGE_TIMELINE_TEMPLATES_URL,
  CHALLENGE_PHASES_URL,
  GROUPS_API_URL,
  PLATFORMS_V4_API_URL,
  TECHNOLOGIES_V4_API_URL
} = process.env

/**
 * Api request for fetching challenge types
 * @returns {Promise<*>}
 */
export async function fetchChallengeTypes () {
  const response = await axiosInstance.get(`${CHALLENGE_TYPES_URL}?isActive=true`)
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
 * @returns {Promise<*>}
 */
export async function fetchGroups () {
  const response = await axiosInstance.get(GROUPS_API_URL)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching timeline templates
 * @returns {Promise<*>}
 */
export async function fetchTimelineTemplates () {
  const response = await axiosInstance.get(CHALLENGE_TIMELINE_TEMPLATES_URL)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge phases
 * @returns {Promise<*>}
 */
export async function fetchChallengePhases () {
  const response = await axiosInstance.get(CHALLENGE_PHASES_URL)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge details
 * @param projectId Challenge id
 * @returns {Promise<*>}
 */
export async function fetchChallenge (challengeId) {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/${challengeId}`)
  return _.get(response, 'data')
}

/**
 * Api request for creating new challenge
 * @param challenge challenge data
 * @returns {Promise<*>}
 */
export function createChallenge (challenge) {
  // TODO: Delete the following line when the API is update to remove the legacyId. This is a temporary fix
  let newChallenge = _.assign(challenge, { legacyId: 3000500 })
  return axiosInstance.post(CHALLENGE_API_URL, newChallenge)
}

/**
 * Api request for updating challenge
 * @param challenge challenge data
 * @param challengeId Challenge id
 * @returns {Promise<*>}
 */
export function updateChallenge (challenge, challengeId) {
  return axiosInstance.put(`${CHALLENGE_API_URL}/${challengeId}`, challenge)
}

export function uploadAttachment (challengeId, file) {
  const data = new FormData()
  data.append('attachment', file)
  return axiosInstance.post(`${CHALLENGE_API_URL}/${challengeId}/attachments`, data)
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
  return axiosInstance.get(`${CHALLENGE_API_URL}?${qs.stringify(query, { encode: false })}`)
}

/**
 * Partially update the challenge with the provided id. Only the fields that are provided in the body will be changed.
 * @param challengeId
 * @param params
 */
export function patchChallenge (challengeId, params) {
  return axiosInstance.patch(`${CHALLENGE_API_URL}/${challengeId}`, params)
}
