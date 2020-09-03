import _ from 'lodash'
import qs from 'qs'
import { axiosInstance } from './axiosWithAuth'
import { updateChallengePhaseBeforeSendRequest, convertChallengePhaseFromSecondsToHours, normalizeChallengeDataFromAPI } from '../util/date'
import FormData from 'form-data'
const {
  CHALLENGE_API_URL,
  CHALLENGE_TYPES_URL,
  CHALLENGE_TRACKS_URL,
  CHALLENGE_TIMELINE_TEMPLATES_URL,
  CHALLENGE_PHASES_URL,
  CHALLENGE_TIMELINES_URL,
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
async function fetchChallengeTypes () {
  const response = await this.axios.get(`${CHALLENGE_TYPES_URL}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge tracks
 * @returns {Promise<*>}
 */
async function fetchChallengeTracks () {
  const response = await this.axios.get(`${CHALLENGE_TRACKS_URL}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge tags
 * @returns {Promise<*>}
 */
async function fetchChallengeTags () {
  const platforms = await this.axios.get(PLATFORMS_V4_API_URL)
  const technologies = await this.axios.get(TECHNOLOGIES_V4_API_URL)
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
async function fetchGroups (filters) {
  const response = await this.axios.get(`${GROUPS_API_URL}?${qs.stringify(filters, { encode: false })}`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching timeline templates
 * @returns {Promise<*>}
 */
async function fetchTimelineTemplates () {
  const response = await this.axios.get(`${CHALLENGE_TIMELINE_TEMPLATES_URL}?page=1&perPage=100`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge timelines
 * @returns {Promise<*>}
 */
async function fetchChallengeTimelines () {
  const response = await this.axios.get(`${CHALLENGE_TIMELINES_URL}?page=1&perPage=100`)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge phases
 * @returns {Promise<*>}
 */
async function fetchChallengePhases () {
  const response = await this.axios.get(`${CHALLENGE_PHASES_URL}?page=1&perPage=100`)
  convertChallengePhaseFromSecondsToHours(response.data)
  return _.get(response, 'data', [])
}

/**
 * Api request for fetching challenge details
 * @param projectId Challenge id
 * @returns {Promise<*>}
 */
async function fetchChallenge (challengeId) {
  const response = await this.axios.get(`${CHALLENGE_API_URL}/${challengeId}`)
  return normalizeChallengeDataFromAPI(_.get(response, 'data'))
}

/**
 * Api request for creating new challenge
 * @param challenge challenge data
 * @returns {Promise<*>}
 */
function createChallenge (challenge) {
  return this.axios.post(CHALLENGE_API_URL, updateChallengePhaseBeforeSendRequest(challenge)).then(rs => {
    convertChallengePhaseFromSecondsToHours(rs.data.phases)
    return rs
  })
}

/**
 * Api request for updating challenge
 * @param challenge challenge data
 * @param challengeId Challenge id
 * @returns {Promise<*>} challenge data
 */
export function updateChallenge (challenge, challengeId) {
  return this.axios.put(`${CHALLENGE_API_URL}/${challengeId}`, updateChallengePhaseBeforeSendRequest(challenge)).then(response => {
    return normalizeChallengeDataFromAPI(_.get(response, 'data'))
  })
}

function uploadAttachment (challengeId, file) {
  const data = new FormData()
  data.append('attachment', file)
  return this.axios.post(`${CHALLENGE_API_URL}/${challengeId}/attachments`, data)
}

/**
 * Fetch challenges from v5 API
 * @param filters
 * @param params
 */
function fetchChallenges (filters, params) {
  const query = {
    ...filters,
    ...params
  }
  return this.axios.get(`${CHALLENGE_API_URL}?${qs.stringify(query, { encode: false })}`)
}

/**
 * Partially update the challenge with the provided id. Only the fields that are provided in the body will be changed.
 * @param challengeId
 * @param params
 */
function patchChallenge (challengeId, params) {
  return this.axios.patch(`${CHALLENGE_API_URL}/${challengeId}`, updateChallengePhaseBeforeSendRequest(params)).then(rs => {
    convertChallengePhaseFromSecondsToHours(rs.data.phases)
    return rs
  })
}

/**
 * Api request for fetching challenge terms
 * @returns {Promise<*>}
 */
async function fetchChallengeTerms () {
  const query = { page: 1, perPage: 10 }
  const response = await this.axios.get(`${TERMS_API_URL}?${qs.stringify(query, { encode: false })}`)
  const responseData = _.get(response, 'data', [])
  const returnData = responseData.result.map(element => _.pick(element, ['id', 'title']))
  return returnData
}

/**
 * Api request for creating new resource
 * @param challenge challenge data
 * @returns {Promise<*>}
 */
function createResource (resource) {
  return this.axios.post(RESOURCES_API_URL, resource)
}

/**
 * Api request for fetching challenge resources
 * @param challengeId Challenge id
 * @returns {Promise<*>}
 */
async function fetchResources (challengeId) {
  const response = await this.axios.get(`${RESOURCES_API_URL}?challengeId=${challengeId}`)
  return _.get(response, 'data', [])
}

/**
* Api request for fetching resource roles
* @returns {Promise<*>}
*/
async function fetchResourceRoles () {
  const response = await this.axios.get(RESOURCE_ROLES_API_URL)
  return _.get(response, 'data', [])
}

/**
 * Api request for deleting a resource
 * @param {object} resource to delete
 * @returns {Promise<*>}
 */
function deleteResource (resource) {
  return this.axios.delete(RESOURCES_API_URL, { data: resource })
}

async function fetchMetadata () {
  const response = await this.axios.get('/api/metadata')
  return _.get(response, 'data', [])
}

function Challenges () {
  this.axios = axiosInstance

  this.init = function (axiosInstance) {
    this.axios = axiosInstance
  }

  this.fetchChallengeTypes = fetchChallengeTypes.bind(this)
  this.fetchChallengeTracks = fetchChallengeTracks.bind(this)
  this.fetchChallengeTags = fetchChallengeTags.bind(this)
  this.fetchGroups = fetchGroups.bind(this)
  this.fetchTimelineTemplates = fetchTimelineTemplates.bind(this)
  this.fetchChallengeTimelines = fetchChallengeTimelines.bind(this)
  this.fetchChallengePhases = fetchChallengePhases.bind(this)
  this.fetchChallenge = fetchChallenge.bind(this)
  this.createChallenge = createChallenge.bind(this)
  this.updateChallenge = updateChallenge.bind(this)
  this.fetchChallenges = fetchChallenges.bind(this)
  this.uploadAttachment = uploadAttachment.bind(this)
  this.patchChallenge = patchChallenge.bind(this)
  this.fetchChallengeTerms = fetchChallengeTerms.bind(this)
  this.createResource = createResource.bind(this)
  this.fetchResources = fetchResources.bind(this)
  this.fetchResourceRoles = fetchResourceRoles.bind(this)
  this.deleteResource = deleteResource.bind(this)
  this.fetchMetadata = fetchMetadata.bind(this)
  this.updateChallenge = updateChallenge.bind(this)
  return this
}

export const service = new Challenges()
