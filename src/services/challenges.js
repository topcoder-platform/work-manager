import _ from 'lodash'
import { axiosInstance } from './axiosWithAuth'
import { MEMBER_API_URL, CHALLENGE_API_URL } from '../config/constants'

/**
 * Api request for fetching member's active challenges
 * @returns {Promise<*>}
 */
export async function fetchMemberChallenges (handle) {
  const response = await axiosInstance.get(`${MEMBER_API_URL}/${handle}/challenges?filter=status=ACTIVE`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for fetching challenge details
 * @param challengeId
 * @returns {Promise<*>}
 */
export async function fetchChallengeDetails (challengeId) {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challenges/${challengeId}`)
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
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challenge-types`)
  return _.get(response, 'data.result.content')
}

/**
 * Api request for fetching project's challenges
 * @param projectId Project id
 * @param status Challenge status
 * @returns {Promise<*>}
 */
export async function fetchProjectChallenges (projectId, status) {
  let filters = []
  if (!_.isEmpty(status)) {
    filters.push(`status=${status}`)
  }
  filters.push(`projectId=${projectId}`)
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/challenges${filters.length > 0 ? `?filter=${encodeURIComponent(filters.join('&'))}` : ''}`)
  return _.get(response, 'data.result.content')
}
