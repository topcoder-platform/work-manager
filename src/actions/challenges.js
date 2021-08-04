import _ from 'lodash'
import {
  fetchChallengeTypes,
  fetchChallengeTags,
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
  deleteResource as deleteResourceAPI
} from '../services/challenges'
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
  CREATE_CHALLENGE_RESOURCE,
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
  LOAD_CHALLENGE_RESOURCES
} from '../config/constants'
import { loadProject } from './projects'
import { removeChallengeFromPhaseProduct, saveChallengeAsPhaseProduct } from '../services/projects'

/**
 * Member challenges related redux actions
 */

/**
 * Loads active challenges of project by page
 */
export function loadChallengesByPage (page, projectId, status, filterChallengeName = null) {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD_CHALLENGES_PENDING,
      challenges: [],
      projectId: projectId,
      status,
      filterChallengeName,
      perPage: PAGE_SIZE,
      page
    })

    const filters = {
      sortBy: 'updated',
      sortOrder: 'desc'
    }
    if (!_.isEmpty(filterChallengeName)) {
      filters['name'] = filterChallengeName
    }
    if (_.isInteger(projectId) && projectId > 0) {
      filters['projectId'] = projectId
    }
    if (!_.isEmpty(status)) {
      filters['status'] = status === '' ? undefined : _.startCase(status.toLowerCase())
    } else if (!(_.isInteger(projectId) && projectId > 0)) {
      filters['status'] = 'Active'
    }

    return fetchChallenges(filters, {
      page,
      perPage: PAGE_SIZE
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
export function loadChallenges (projectId, status, filterChallengeName = null) {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD_CHALLENGES_PENDING,
      challenges: [],
      projectId: projectId ? `${projectId}` : '',
      status,
      filterChallengeName
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
      filters['status'] = 'Active'
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

export function loadChallengeTags () {
  return async (dispatch) => {
    const challengeTags = await fetchChallengeTags()
    dispatch({
      type: LOAD_CHALLENGE_METADATA_SUCCESS,
      metadataKey: 'challengeTags',
      metadataValue: challengeTags
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
  return (dispatch, getState) => {
    if (challengeId) {
      return dispatch({
        type: LOAD_CHALLENGE_RESOURCES,
        payload: fetchResources(challengeId)
      })
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
 */
export function createResource (challengeId, roleId, memberHandle) {
  const resource = {
    challengeId,
    roleId,
    memberHandle
  }
  return (dispatch, getState) => {
    return dispatch({
      type: CREATE_CHALLENGE_RESOURCE,
      payload: createResourceAPI(resource)
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
