import _ from 'lodash'
import qs from 'qs'
import { axiosInstance } from './axiosWithAuth'
import { updateChallengePhaseBeforeSendRequest, convertChallengePhaseFromSecondsToHours, normalizeChallengeDataFromAPI } from '../util/date'
import { GROUPS_DROPDOWN_PER_PAGE, UPDATE_SKILLS_V5_API_URL } from '../config/constants'
const {
  CHALLENGE_API_URL,
  CHALLENGE_API_VERSION,
  CHALLENGE_DEFAULT_REVIEWERS_URL,
  CHALLENGE_TYPES_URL,
  CHALLENGE_TRACKS_URL,
  CHALLENGE_TIMELINE_TEMPLATES_URL,
  CHALLENGE_PHASES_URL,
  CHALLENGE_TIMELINES_URL,
  SUBMISSIONS_API_URL,
  REVIEW_TYPE_API_URL,
  SCORECARDS_API_URL,
  WORKFLOWS_API_URL,
  GROUPS_API_URL,
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
  const response = await axiosInstance.get(`${CHALLENGE_TIMELINES_URL}?isDefault=true&page=1&perPage=100`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge phases
 * @returns {Promise<*>}
 */
export async function fetchChallengePhases () {
  const response = await axiosInstance.get(`${CHALLENGE_PHASES_URL}?page=1&perPage=100`)
  convertChallengePhaseFromSecondsToHours(response.data)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge details
 * @param projectId Challenge id
 * @returns {Promise<*>}
 */
export async function fetchChallenge (challengeId) {
  const response = await axiosInstance.get(`${CHALLENGE_API_URL}/${challengeId}`, {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  })
  return normalizeChallengeDataFromAPI(_.get(response, 'data'))
}

/**
 * Api request for creating new challenge
 * @param challenge challenge data
 * @returns {Promise<*>} challenge data
 */
export function createChallenge (challenge) {
  return axiosInstance.post(CHALLENGE_API_URL, updateChallengePhaseBeforeSendRequest(challenge), {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  }).then(response => {
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
  return axiosInstance.put(`${CHALLENGE_API_URL}/${challengeId}`, updateChallengePhaseBeforeSendRequest(challenge), {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  }).then(response => {
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
  return axiosInstance.post(`${CHALLENGE_API_URL}/${challengeId}/attachments`, attachments, {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  })
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
  return axiosInstance.delete(`${CHALLENGE_API_URL}/${challengeId}/attachments/${attachmentId}`, {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  })
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
  if (query.status) {
    if (_.isArray(query.status)) {
      query.status = query.status.map(statusValue => _.isString(statusValue) ? statusValue.toUpperCase() : statusValue)
    } else if (_.isString(query.status)) {
      query.status = query.status.toUpperCase()
    }
  }
  return axiosInstance.get(`${CHALLENGE_API_URL}?${qs.stringify(query, { encode: false })}`, {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  }).then(response => {
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
  return axiosInstance.patch(`${CHALLENGE_API_URL}/${challengeId}`, updateChallengePhaseBeforeSendRequest(params), {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  }).then(rs => {
    return normalizeChallengeDataFromAPI(_.get(rs, 'data'))
  })
}

/*
* Deletes the challenge with the provided id.
* @param challengeId
*/
export function deleteChallenge (challengeId) {
  return axiosInstance.delete(`${CHALLENGE_API_URL}/${challengeId}`, {
    headers: {
      'app-version': CHALLENGE_API_VERSION
    }
  })
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
  let page = 0
  let totalPage = 1
  let resouces = []
  while (page < totalPage) {
    page += 1
    const response = await axiosInstance.get(`${RESOURCES_API_URL}?challengeId=${challengeId}&page=${page}&perPage=5000`)
    resouces = [...resouces, ..._.get(response, 'data', [])]
    totalPage = parseInt(response.headers['x-total-pages'])
  }
  return resouces
}

/**
* Api request for fetching submissions
* @param challengeId Challenge id
* @returns {Promise<*>}
*/
export async function fetchSubmissions (challengeId, pageObj) {
  const { page, perPage } = pageObj
  const response = await axiosInstance.get(`${SUBMISSIONS_API_URL}?challengeId=${challengeId}&perPage=${perPage}&page=${page}`)
  const responseData = _.get(response, 'data', {})
  const meta = _.get(responseData, 'meta', {})
  return {
    data: _.get(responseData, 'data', []),
    headers: _.get(response, 'headers', {}),
    totalCount: _.get(meta, 'totalCount'),
    page: _.get(meta, 'page', page),
    perPage: _.get(meta, 'perPage', perPage)
  }
}

export async function getReviewTypes () {
  const response = await axiosInstance.get(`${REVIEW_TYPE_API_URL}?perPage=500&page=1`)
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

/**
 * Api request for updating challenge skill
 * @param {Object} skills data
 * @returns {Promise<*>}
 */
export async function updateChallengeSkillsApi (challengeId, skills) {
  const resp = await axiosInstance.post(`${UPDATE_SKILLS_V5_API_URL}/${challengeId}`, skills)
  return _.get(resp, 'data', {})
}

/**
 * Api request for fetching scorecards
 * @param {Object} filters filters for scorecards
 * @returns {Promise<*>}
 */
export async function fetchScorecards (filters = {}) {
  const query = {
    perPage: 100,
    page: 1,
    ...filters
  }
  const response = await axiosInstance.get(`${SCORECARDS_API_URL}?${qs.stringify(query, { encode: false })}`)
  return _.get(response, 'data', {})
}

/**
 * Api request for fetching default reviewers
 * @param {Object} filters filters for default reviewers
 * @returns {Promise<*>}
 */
export async function fetchDefaultReviewers (filters = {}) {
  const { typeId, trackId } = filters
  const query = qs.stringify({ typeId, trackId }, { encode: false })
  const baseUrl = CHALLENGE_DEFAULT_REVIEWERS_URL || `${CHALLENGE_API_URL.replace(/\/challenges$/, '')}/challenge/default-reviewers`
  const response = await axiosInstance.get(`${baseUrl}?${query}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching workflows
 * @returns {Promise<*>}
 */
export async function fetchWorkflows () {
  const response = await axiosInstance.get(`${WORKFLOWS_API_URL}`)
  return _.get(response, 'data', {})
}
