import _ from 'lodash'
import {
  fetchChallengeTypes,
  fetchGroups,
  fetchTimelineTemplates,
  fetchChallengePhases,
  createAttachments as createAttachmentsAPI,
  removeAttachment as removeAttachmentAPI,
  fetchChallenge,
  fetchChallenges,
  fetchChallengeTerms,
  fetchResources,
  fetchResourceRoles,
  fetchChallengeTimelines,
  fetchChallengeTracks,
  fetchGroupDetail,
  updateChallenge,
  patchChallenge,
  deleteChallenge as deleteChallengeAPI,
  createChallenge as createChallengeAPI,
  createResource as createResourceAPI,
  deleteResource as deleteResourceAPI,
  updateChallengeSkillsApi,
  fetchDefaultReviewers,
  fetchScorecards,
  fetchWorkflows
} from '../services/challenges'
import { searchProfilesByUserIds } from '../services/user'
import {
  LOAD_CHALLENGE_DETAILS,
  LOAD_CHALLENGE_METADATA_SUCCESS,
  LOAD_CHALLENGES_FAILURE,
  LOAD_CHALLENGES_PENDING,
  LOAD_CHALLENGES_SUCCESS,
  CREATE_ATTACHMENT_FAILURE,
  CREATE_ATTACHMENT_PENDING,
  CREATE_ATTACHMENT_SUCCESS,
  REMOVE_ATTACHMENT_FAILURE,
  REMOVE_ATTACHMENT_PENDING,
  REMOVE_ATTACHMENT_SUCCESS,
  CREATE_CHALLENGE_RESOURCE_PENDING,
  CREATE_CHALLENGE_RESOURCE_SUCCESS,
  CREATE_CHALLENGE_RESOURCE_FAILURE,
  DELETE_CHALLENGE_RESOURCE,
  PAGE_SIZE,
  UPDATE_CHALLENGE_DETAILS_PENDING,
  UPDATE_CHALLENGE_DETAILS_SUCCESS,
  UPDATE_CHALLENGE_DETAILS_FAILURE,
  CREATE_CHALLENGE_PENDING,
  CREATE_CHALLENGE_SUCCESS,
  CREATE_CHALLENGE_FAILURE,
  DELETE_CHALLENGE_PENDING,
  DELETE_CHALLENGE_SUCCESS,
  DELETE_CHALLENGE_FAILURE,
  CHALLENGE_STATUS,
  LOAD_CHALLENGE_RESOURCES_SUCCESS,
  LOAD_CHALLENGE_RESOURCES_PENDING,
  LOAD_CHALLENGE_RESOURCES_FAILURE,
  UPDATE_CHALLENGES_SKILLS_SUCCESS
} from '../config/constants'
import { loadProject } from './projects'
import { removeChallengeFromPhaseProduct, saveChallengeAsPhaseProduct } from '../services/projects'
import { checkAdmin, checkManager } from '../util/tc'

/**
 * Member challenges related redux actions
 */

/**
 * Loads active challenges of project by page
 *
 * @param {number} page
 * @param {string} projectId
 * @param {string} status
 * @param {boolean} dashboard is in dashboard or not
 * @param {string} filterChallengeName
 * @param {bool} selfService
 * @param {string} userHandle this will be null for admin user(we will return all datas for admin user)
 * @param {number} userId this will be null for admin user(we will return all datas for admin user)
 * @param {string} filterChallengeType
 * @param {object} filterDate
 * @param {string} filterSortBy
 * @param {string} filterSortOrder
 * @param {number} perPage
 * @returns redux action
 */
export function loadChallengesByPage (
  page,
  projectId,
  status,
  dashboard,
  filterChallengeName = null,
  selfService = false,
  userHandle = null,
  userId = 0,
  filterChallengeType = {},
  filterDate = {},
  filterSortBy = null,
  filterSortOrder = null,
  perPage = PAGE_SIZE
) {
  return (dispatch, getState) => {
    if (_.isObject(projectId)) {
      dispatch({
        type: LOAD_CHALLENGES_PENDING,
        challenges: [],
        status,
        filterProjectOption: projectId,
        filterChallengeName,
        filterChallengeType,
        filterDate,
        filterSortBy,
        filterSortOrder,
        perPage,
        page
      })
    } else {
      dispatch({
        type: LOAD_CHALLENGES_PENDING,
        challenges: [],
        status,
        projectId,
        filterChallengeName,
        filterChallengeType,
        filterDate,
        filterSortBy,
        filterSortOrder,
        perPage,
        page
      })
    }

    const filters = {
      sortBy: 'startDate',
      sortOrder: 'desc'
    }
    if (_.isObject(filterChallengeType) && filterChallengeType.value) {
      filters['type'] = filterChallengeType.value
    }
    if (_.isObject(filterDate) && filterDate.startDateStart) {
      filters['startDateStart'] = filterDate.startDateStart
    }
    if (_.isObject(filterDate) && filterDate.startDateEnd) {
      filters['startDateEnd'] = filterDate.startDateEnd
    }
    if (_.isObject(filterDate) && filterDate.endDateStart) {
      filters['endDateStart'] = filterDate.endDateStart
    }
    if (_.isObject(filterDate) && filterDate.endDateEnd) {
      filters['endDateEnd'] = filterDate.endDateEnd
    }
    if (filterSortBy) {
      filters['sortBy'] = filterSortBy
    }
    if (filterSortOrder) {
      filters['sortOrder'] = filterSortOrder
    }
    if (!_.isEmpty(filterChallengeName)) {
      filters['name'] = filterChallengeName
    }
    if (_.isInteger(projectId) && projectId > 0) {
      filters['projectId'] = projectId
    } else if (_.isObject(projectId) && projectId.value > 0) {
      filters['projectId'] = projectId.value
    } else if (
      !checkAdmin(getState().auth.token) &&
      !checkManager(getState().auth.token) &&
      userId
    ) {
      // Note that we only add the memberId field if *no* project ID is given,
      // so that the list of *all challenges shows only those that the member is on
      filters['memberId'] = userId
    }

    if (status !== 'all') {
      filters['status'] = !status ? undefined : status
    }

    if (!dashboard && !filters['status'] && !(_.isInteger(projectId) && projectId > 0)) {
      filters['status'] = 'ACTIVE'
    }
    if (selfService) {
      filters.selfService = true
      const filtersStatus = filters.status ? filters.status.toUpperCase() : filters.status
      if (
        userHandle &&
        filtersStatus !== CHALLENGE_STATUS.DRAFT &&
        filtersStatus !== CHALLENGE_STATUS.NEW
      ) {
        filters.selfServiceCopilot = userHandle
      }
    }

    return fetchChallenges(filters, {
      page,
      perPage
      // memberId: getState().auth.user ? getState().auth.user.userId : null
    }).then((res) => {
      dispatch({
        type: LOAD_CHALLENGES_SUCCESS,
        challenges: res.data,
        totalChallenges: parseInt(_.get(res, 'headers.x-total', '0'))
      })
    }).catch(() => dispatch({
      type: LOAD_CHALLENGES_FAILURE,
      challenges: []
    }))
  }
}

/**
 * Loads active challenges of project
 */
export function loadChallenges (
  projectId,
  status,
  filterChallengeName = null,
  filterChallengeType = null,
  filterSortBy,
  filterSortOrder
) {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD_CHALLENGES_PENDING,
      challenges: [],
      projectId: projectId ? `${projectId}` : '',
      status,
      filterChallengeName,
      filterChallengeType,
      filterSortBy,
      filterSortOrder
    })

    const filters = {}
    if (!_.isEmpty(filterChallengeName)) {
      filters['name'] = filterChallengeName
    }
    if (_.isInteger(projectId) && projectId > 0) {
      filters['projectId'] = projectId
    }
    if (!_.isEmpty(status)) {
      filters['status'] = status === '' ? undefined : _.startCase(status.toLowerCase())
    } else if (!(_.isInteger(projectId) && projectId > 0)) {
      filters['status'] = 'ACTIVE'
    }

    let fetchedChallenges = []

    function getChallengesByPage (filters, page) {
      if (!_.isEmpty(projectId) && getState().challenges.projectId !== `${projectId}`) return
      dispatch({
        type: LOAD_CHALLENGES_PENDING
      })
      return fetchChallenges(filters, {
        page,
        perPage: PAGE_SIZE,
        memberId: getState().auth.user ? getState().auth.user.userId : null
      }).then((res) => {
        if (res.data.length > 0) {
          fetchedChallenges = [
            ...fetchedChallenges,
            ...res.data
          ]
          dispatch({
            type: LOAD_CHALLENGES_SUCCESS,
            challenges: fetchedChallenges
          })
          // recurse until no further challenges are found
          if (_.get(res, 'headers.x-total-pages', 0) > page) {
            return getChallengesByPage(filters, page + 1)
          }
        } else {
          dispatch({
            type: LOAD_CHALLENGES_SUCCESS,
            challenges: fetchedChallenges
          })
        }
      }).catch(() => dispatch({
        type: LOAD_CHALLENGES_FAILURE,
        challenges: []
      }))
    }
    let page = 1
    getChallengesByPage(filters, page)
  }
}

/**
 * Loads Challenge details
 */
export function loadChallengeDetails (projectId, challengeId) {
  return (dispatch, getState) => {
    if (challengeId) {
      return dispatch({
        type: LOAD_CHALLENGE_DETAILS,
        payload: fetchChallenge(challengeId).then((challenge) => {
          // TODO remove this unncessary check, or better utilize the the case when given project id
          // does not match with challenge's project id
          if (challenge.projectId == projectId) { // eslint-disable-line
            dispatch(loadProject(projectId))
          }
          return challenge
        })
      })
    }
  }
}

/**
 * Loads group details
 */
export function loadGroupDetails (groupIds) {
  const promiseAll = groupIds.map(id => fetchGroupDetail(id))
  return Promise.all(promiseAll)
}

/**
 * Update challenge details
 *
 * @param {String} challengeId      challenge id
 * @param {Object} challengeDetails challenge data
 * @param {String} projectId        project id
 * @returns {Promise<{ type: string, challengeDetails: object }>} action object
 */
export function updateChallengeDetails (challengeId, challengeDetails, projectId) {
  return async (dispatch) => {
    dispatch({
      type: UPDATE_CHALLENGE_DETAILS_PENDING
    })

    const milestoneId = challengeDetails.milestoneId
    // Check if milestone is deleted or updated
    const hasMilestone = _.has(challengeDetails, 'milestoneId')

    if (hasMilestone) {
      delete challengeDetails.milestoneId
    }
    if (challengeDetails.status === 'Completed') {
      // Cannot update prizeSets for challenges with status: Completed!
      delete challengeDetails.prizeSets
    }
    return updateChallenge(challengeId, challengeDetails).then(async challenge => {
      if (hasMilestone) {
        if (milestoneId && milestoneId !== -1) {
          await saveChallengeAsPhaseProduct(projectId, milestoneId, challengeId)
          challenge.milestoneId = milestoneId
        } else {
          await removeChallengeFromPhaseProduct(projectId, challengeId)
          challenge.milestoneId = milestoneId
        }
      }
      return challenge
    }).then((challenge) => {
      return dispatch({
        type: UPDATE_CHALLENGE_DETAILS_SUCCESS,
        challengeDetails: challenge
      })
    }).catch((error) => {
      dispatch({
        type: UPDATE_CHALLENGE_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    })
  }
}

/**
 * Create a new challenge
 *
 * @param {Object} challengeDetails challenge data
 * @param {String} projectId        project id
 *
 * @returns {Promise<{ type: string, challengeDetails: object }>} action object
 */
export function createChallenge (challengeDetails, projectId) {
  console.log(challengeDetails)
  return async (dispatch) => {
    dispatch({
      type: CREATE_CHALLENGE_PENDING
    })
    const milestoneId = challengeDetails.milestoneId
    if (milestoneId) {
      delete challengeDetails.milestoneId
    }
    return createChallengeAPI(challengeDetails)
      .then(async challenge => {
        if (milestoneId && milestoneId !== -1) {
          await saveChallengeAsPhaseProduct(projectId, milestoneId, challenge.id, true)
          challenge.milestoneId = milestoneId
        }
        return challenge
      })
      .then((challenge) => {
        return dispatch({
          type: CREATE_CHALLENGE_SUCCESS,
          challengeDetails: challenge
        })
      }).catch((e) => {
        dispatch({
          type: CREATE_CHALLENGE_FAILURE,
          error: e
        })
      })
  }
}

/**
 * Partially update challenge details
 *
 * The difference from `updateChallengeDetails` that this method internally uses `PATCH` API method instead of `PUT`.
 *
 * @param {String} challengeId             challenge id
 * @param {Object} partialChallengeDetails partial challenge data
 * @param {String} projectId               project id
 * @returns {Promise<{ type: string, challengeDetails: object }>} action object
 */
export function partiallyUpdateChallengeDetails (challengeId, partialChallengeDetails, projectId) {
  return async (dispatch) => {
    dispatch({
      type: UPDATE_CHALLENGE_DETAILS_PENDING
    })
    const milestoneId = partialChallengeDetails.milestoneId
    // Check if milestone is deleted or updated
    const hasMilestone = _.has(partialChallengeDetails, 'milestoneId')
    if (hasMilestone) {
      delete partialChallengeDetails.milestoneId
    }
    return patchChallenge(challengeId, partialChallengeDetails).then(async challenge => {
      if (hasMilestone) {
        if (milestoneId && milestoneId !== -1) {
          await saveChallengeAsPhaseProduct(projectId, milestoneId, challenge.id)
          challenge.milestoneId = milestoneId
        } else {
          await removeChallengeFromPhaseProduct(projectId, challengeId)
          challenge.milestoneId = milestoneId
        }
      }
      return challenge
    }).then((challenge) => {
      return dispatch({
        type: UPDATE_CHALLENGE_DETAILS_SUCCESS,
        challengeDetails: challenge
      })
    }).catch((error) => {
      dispatch({
        type: UPDATE_CHALLENGE_DETAILS_FAILURE
      })
      throw error
    })
  }
}

export function deleteChallenge (challengeId, projectId) {
  return async (dispatch) => {
    dispatch({
      type: DELETE_CHALLENGE_PENDING
    })
    return deleteChallengeAPI(challengeId).then(async challenge => {
      await removeChallengeFromPhaseProduct(projectId, challengeId)
      return challenge
    }).then((challenge) => {
      return dispatch({
        type: DELETE_CHALLENGE_SUCCESS,
        challengeDetails: challenge
      })
    }).catch((error) => {
      dispatch({
        type: DELETE_CHALLENGE_FAILURE
      })
      throw error
    })
  }
}

export function loadTimelineTemplates () {
  return async (dispatch) => {
    const timelineTemplates = await fetchTimelineTemplates()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'timelineTemplates',
      metadataValue: timelineTemplates
    })
  }
}

export function loadChallengePhases () {
  return async (dispatch) => {
    const challengePhases = await fetchChallengePhases()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'challengePhases',
      metadataValue: challengePhases.filter(c => c.isOpen)
    })
  }
}

export function loadChallengeTypes () {
  return async (dispatch) => {
    const challengeTypes = await fetchChallengeTypes()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'challengeTypes',
      metadataValue: challengeTypes
    })
  }
}

export function loadChallengeTracks () {
  return async (dispatch) => {
    const challengeTracks = await fetchChallengeTracks()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'challengeTracks',
      metadataValue: challengeTracks
    })
  }
}

export function loadChallengeTimelines () {
  return async (dispatch) => {
    const challengeTimelines = await fetchChallengeTimelines()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'challengeTimelines',
      metadataValue: challengeTimelines
    })
  }
}

export function loadGroups () {
  return async (dispatch, getState) => {
    const groups = await fetchGroups({
      membershipType: 'user',
      memberId: getState().auth.user ? getState().auth.user.userId : null
    })
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'groups',
      metadataValue: groups
    })
  }
}

export function createAttachments (challengeId, files) {
  return async (dispatch) => {
    dispatch({
      type: CREATE_ATTACHMENT_PENDING,
      challengeId,
      files
    })

    try {
      const attachment = await createAttachmentsAPI(challengeId, files)
      dispatch({
        type: CREATE_ATTACHMENT_SUCCESS,
        attachments: attachment.data
      })
    } catch (error) {
      dispatch({
        type: CREATE_ATTACHMENT_FAILURE,
        files
      })
    }
  }
}

export function removeAttachment (challengeId, attachmentId) {
  return async (dispatch) => {
    dispatch({
      type: REMOVE_ATTACHMENT_PENDING,
      challengeId,
      attachmentId
    })

    try {
      await removeAttachmentAPI(challengeId, attachmentId)
      dispatch({
        type: REMOVE_ATTACHMENT_SUCCESS,
        challengeId,
        attachmentId
      })
    } catch (error) {
      dispatch({
        type: REMOVE_ATTACHMENT_FAILURE,
        challengeId,
        attachmentId
      })
    }
  }
}

export function loadChallengeTerms () {
  return async (dispatch) => {
    const challengeTerms = await fetchChallengeTerms()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'challengeTerms',
      metadataValue: challengeTerms
    })
  }
}

export function loadResources (challengeId) {
  return async (dispatch, getState) => {
    if (challengeId) {
      let challengeResources = []
      try {
        dispatch({
          type: LOAD_CHALLENGE_RESOURCES_PENDING
        })
        challengeResources = await fetchResources(challengeId)
        const memberIds = challengeResources.map(resource => resource.memberId)
        const memberInfos = await searchProfilesByUserIds(memberIds)
        _.forEach(challengeResources, (cr) => {
          const memerInfo = _.find(memberInfos, { userId: parseInt(cr.memberId) })
          cr.email = memerInfo ? memerInfo.email : ''
        })
        dispatch({
          type: LOAD_CHALLENGE_RESOURCES_SUCCESS,
          payload: challengeResources
        })
      } catch (error) {
        dispatch({
          type: LOAD_CHALLENGE_RESOURCES_FAILURE
        })
      }
    }
  }
}

export function loadResourceRoles () {
  return async (dispatch) => {
    const resourceRoles = await fetchResourceRoles()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'resourceRoles',
      metadataValue: resourceRoles
    })
  }
}

/**
 * Deletes a resource for the given challenge in given role
 * @param {UUID} challengeId id of the challenge for which resource is to be deleted
 * @param {UUID} roleId id of the role, the resource is in
 * @param {String} memberHandle handle of the resource
 */
export function deleteResource (challengeId, roleId, memberHandle) {
  const resource = {
    challengeId,
    roleId,
    memberHandle
  }
  return (dispatch, getState) => {
    return dispatch({
      type: DELETE_CHALLENGE_RESOURCE,
      payload: deleteResourceAPI(resource)
    })
  }
}

/**
 * Creates a resource for the given challenge in given role
 * @param {UUID} challengeId id of the challenge for which resource is to be created
 * @param {UUID} roleId id of the role, the resource should be in
 * @param {String} memberHandle handle of the resource
 * @param {String} email email of member
 * @param {String} userId id of member
 */
export function createResource (challengeId, roleId, memberHandle, email, userId) {
  const resource = {
    challengeId,
    roleId,
    memberHandle
  }
  return async (dispatch, getState) => {
    dispatch({
      type: CREATE_CHALLENGE_RESOURCE_PENDING
    })

    let newResource
    try {
      newResource = await createResourceAPI(resource)
    } catch (error) {
      const errorMessage = _.get(error, 'response.data.message', 'Create resource fail.')
      dispatch({
        type: CREATE_CHALLENGE_RESOURCE_FAILURE
      })
      return {
        success: false,
        errorMessage
      }
    }

    let userEmail = email
    if (!userEmail && userId) {
      try {
        const memberInfos = await searchProfilesByUserIds([userId])
        if (memberInfos.length > 0) {
          userEmail = memberInfos[0].email
        }
      } catch (error) {
      }
    }
    dispatch({
      type: CREATE_CHALLENGE_RESOURCE_SUCCESS,
      payload: {
        ...newResource,
        email: userEmail
      }
    })
  }
}

/**
 * Replaces the given resource in given role with new resource for the provided challenge
 * @param {UUID} challengeId id of the challenge for which resource is to be  replaced
 * @param {UUID} roleId id of the role, the resource is in
 * @param {String} newMember handle of the new resource
 * @param {String} oldMember handle of the existing resource
 */
export function replaceResourceInRole (challengeId, roleId, newMember, oldMember) {
  return async (dispatch) => {
    if (newMember === oldMember) {
      return
    }
    if (oldMember) {
      try {
        await dispatch(deleteResource(challengeId, roleId, oldMember))
      } catch (error) {
        const errorMessage = _.get(error, 'response.data.message')
        // ignore error where the resource does not exist already
        if (errorMessage.indexOf('doesn\'t have resource with roleId') === -1) {
          return Promise.reject(new Error('Unable to delete resource'))
        }
      }
    }
    if (newMember) {
      await dispatch(createResource(challengeId, roleId, newMember))
    }
  }
}

/**
 * Update Challenge skill
 * @param {UUID} challengeId id of the challenge for which resource is to be  replaced
 * @param {Array} skills array of skill
 */
export function updateChallengeSkills (challengeId, skills) {
  return async (dispatch) => {
    try {
      if (!skills) {
        return
      }
      await updateChallengeSkillsApi(
        challengeId,
        {
          skillIds: skills.map(skill => skill.id)
        }
      )
      dispatch({
        type: UPDATE_CHALLENGES_SKILLS_SUCCESS,
        payload: skills
      })
    } catch (error) {
      return _.get(error, 'response.data.message', 'Can not save skill')
    }
  }
}

/**
 * Load scorecards
 * @param {Object} filters filters for scorecards
 */
export function loadScorecards (filters = {}) {
  return async (dispatch) => {
    try {
      const scorecards = await fetchScorecards(filters)
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadataKey: 'scorecards',
        metadataValue: scorecards.scoreCards || []
      })
    } catch (error) {
      console.error('Error loading scorecards:', error)
      // Return empty array on error to maintain consistency
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadataKey: 'scorecards',
        metadataValue: []
      })
    }
  }
}

/**
 * Load default reviewers
 * @param {Object} filters filters for default reviewers
 */
export function loadDefaultReviewers (filters = {}) {
  return async (dispatch) => {
    try {
      const defaultReviewers = await fetchDefaultReviewers(filters)
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadataKey: 'defaultReviewers',
        metadataValue: defaultReviewers
      })
    } catch (error) {
      console.error('Error loading default reviewers:', error)
      // Return empty array on error to maintain consistency
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadataKey: 'defaultReviewers',
        metadataValue: []
      })
    }
  }
}

/**
 * Load workflows
 */
export function loadWorkflows () {
  return async (dispatch) => {
    try {
      const workflows = await fetchWorkflows()
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadataKey: 'workflows',
        metadataValue: workflows || []
      })
    } catch (error) {
      console.error('Error loading workflows:', error)
      // Return empty array on error to maintain consistency
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadataKey: 'workflows',
        metadataValue: []
      })
    }
  }
}
