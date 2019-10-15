import _ from 'lodash'
import qs from 'qs'
import { axiosInstance } from './axiosWithAuth'
import FormData from 'form-data'
import { MEMBER_API_URL, CHALLENGE_API_URL, PROJECT_API_URL, API_V3_URL, API_V4_URL } from '../config/constants'

/**
 * Api request for fetching member's active challenges
 * @returns {Promise<*>}
 */
export async function fetchMemberChallenges (handle) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}/${handle}/challenges?filter=status=ACTIVE`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for fetching member's challenge (it includes member roles)
 * @param {String} handle
 * @param challengeId
 * @returns {Promise<*>}
 */
export async function fetchMemberChallenge (handle, challengeId) {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/members/${handle}/challenges?filter=id=${challengeId}`)
  return _.get(response, 'data.result.content[0]')
}

/**
 * Api request for fetching challenge types
 * @returns {Promise<*>}
 */
export async function fetchChallengeTypes () {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challengetypes?isActive=true`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge tags
 * @returns {Promise<*>}
 */
export async function fetchChallengeTags () {
  const platforms = await axiosInstance.get(`${API_V4_URL}/platforms`)
  const technologies = await axiosInstance.get(`${API_V4_URL}/technologies`)
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
  const response = await axiosInstance.get(`${API_V3_URL}/groups`)
  return _.get(response, 'data.result.content', [])
}

/**
 * Api request for fetching timeline templates
 * @returns {Promise<*>}
 */
export async function fetchTimelineTemplates () {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/timelinetemplates`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge phases
 * @returns {Promise<*>}
 */
export async function fetchChallengePhases () {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challengephases`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge details
 * @param projectId Challenge id
 * @returns {Promise<*>}
 */
export async function fetchChallenge (challengeId) {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challenges/${challengeId}`)
  return _.get(response, 'data')
}

/**
 * Api request for fetching project's challenges
 * @param projectId Project id
 * @param status Challenge status
 * @returns {Promise<*>}
 */
export async function fetchProjectChallenges (projectId, status) {
  let filters = []
  if (_.isEmpty(projectId)) {
    status = 'ACTIVE'
  } else {
    filters.push(`projectId=${projectId}`)
  }
  if (!_.isEmpty(status)) {
    filters.push(`status=${status}`)
  }
  const response = await axiosInstance.get(`${PROJECT_API_URL}/challenges${filters.length > 0 ? `?filter=${encodeURIComponent(filters.join('&'))}` : ''}`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for creating new challenge
 * @param challenge challenge data
 * @returns {Promise<*>}
 */
export function createChallenge (challenge) {
  return axiosInstance.post(`${CHALLENGE_API_URL}/challenges`, challenge)
}

/**
 * Api request for updating challenge
 * @param challenge challenge data
 * @param challengeId Challenge id
 * @returns {Promise<*>}
 */
export function updateChallenge (challenge, challengeId) {
  return axiosInstance.put(`${CHALLENGE_API_URL}/challenges/${challengeId}`, challenge)
}

export function uploadAttachment (challengeId, file) {
  const data = new FormData()
  data.append('attachment', file)
  return axiosInstance.post(`${CHALLENGE_API_URL}/challenges/${challengeId}/attachments`, data)
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
  return axiosInstance.get(`${CHALLENGE_API_URL}/challenges?${qs.stringify(query, { encode: false })}`)
}

/**
 * Partially update the challenge with the provided id. Only the fields that are provided in the body will be changed.
 * @param challengeId
 * @param params
 */
export function patchChallenge (challengeId, params) {
  return axiosInstance.patch(`${CHALLENGE_API_URL}/challenges/${challengeId}`, params)
}
