import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import { MEMBER_API_URL, CHALLENGE_API_URL, PROJECT_API_URL, API_V3_URL } from '../config/constants'

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
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challengeTypes?isActive=true`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge types
 * @returns {Promise<*>}
 */
export async function fetchChallengeTags () {
  const response = await axiosInstance.get(`${API_V3_URL}/tags/?domain=SKILLS&status=APPROVED`)
  return _.get(response, 'data.result.content', [])
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
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/timelineTemplates`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge phases
 * @returns {Promise<*>}
 */
export async function fetchChallengePhases () {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challengePhases`)
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
