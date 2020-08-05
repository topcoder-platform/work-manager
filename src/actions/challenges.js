import _ from 'lodash'
import {
  fetchChallengeTypes,
  fetchChallengeTags,
  fetchGroups,
  fetchTimelineTemplates,
  fetchChallengePhases,
  uploadAttachment,
  fetchChallenge,
  fetchChallenges,
  fetchChallengeTerms,
  fetchResources,
  fetchResourceRoles,
  fetchChallengeTimelines,
  fetchChallengeTracks
} from '../services/challenges'
import {
  LOAD_CHALLENGE_DETAILS_PENDING,
  LOAD_CHALLENGE_DETAILS_SUCCESS,
  LOAD_CHALLENGE_DETAILS_FAILURE,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_CHALLENGE_METADATA_SUCCESS,
  LOAD_CHALLENGES_FAILURE,
  LOAD_CHALLENGES_PENDING,
  LOAD_CHALLENGES_SUCCESS,
  UPLOAD_ATTACHMENT_FAILURE,
  UPLOAD_ATTACHMENT_PENDING,
  UPLOAD_ATTACHMENT_SUCCESS,
  LOAD_CHALLENGE_RESOURCES_PENDING,
  LOAD_CHALLENGE_RESOURCES_SUCCESS,
  LOAD_CHALLENGE_RESOURCES_FAILURE,
  REMOVE_ATTACHMENT,
  PAGE_SIZE
} from '../config/constants'
import { fetchProjectById } from '../services/projects'
import { loadProject } from './projects'

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
  return async (dispatch, getState) => {
    dispatch({
      type: LOAD_CHALLENGE_DETAILS_PENDING,
      challengeDetails: {}
    })

    if (challengeId) {
      fetchChallenge(challengeId).then((challenge) => {
        dispatch({
          type: LOAD_CHALLENGE_DETAILS_SUCCESS,
          challengeDetails: challenge
        })
        loadProject(challenge.projectId)(dispatch, getState)
      }).catch(() => {
        dispatch({
          type: LOAD_CHALLENGE_DETAILS_FAILURE
        })
      })
    } else {
      dispatch({
        type: LOAD_CHALLENGE_DETAILS_SUCCESS,
        challengeDetails: null
      })

      if (projectId) {
        fetchProjectById(projectId).then((selectedProject) => {
          if (!selectedProject) return
          const members = selectedProject.members
            .filter(m => m.role === 'manager' || m.role === 'copilot')
          dispatch({
            type: LOAD_CHALLENGE_MEMBERS_SUCCESS,
            members
          })
        })
      }
    }
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

export function createAttachment (challengeId, file) {
  return async (dispatch, getState) => {
    const getUploadingId = () => _.get(getState(), 'challenge.uploadingId')

    if (challengeId !== getUploadingId()) {
      dispatch({
        type: UPLOAD_ATTACHMENT_PENDING,
        challengeId
      })

      try {
        const attachment = await uploadAttachment(challengeId, file)
        dispatch({
          type: UPLOAD_ATTACHMENT_SUCCESS,
          attachment: attachment.data,
          filename: file.name
        })
      } catch (error) {
        dispatch({
          type: UPLOAD_ATTACHMENT_FAILURE,
          filename: file.name
        })
      }
    }
  }
}

export function removeAttachment (attachmentId) {
  return (dispatch) => {
    dispatch({
      type: REMOVE_ATTACHMENT,
      attachmentId
    })
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
  return async (dispatch) => {
    dispatch({
      type: LOAD_CHALLENGE_RESOURCES_PENDING,
      challengeResources: {}
    })

    if (challengeId) {
      fetchResources(challengeId).then((resources) => {
        dispatch({
          type: LOAD_CHALLENGE_RESOURCES_SUCCESS,
          challengeResources: resources
        })
      }).catch(() => {
        dispatch({
          type: LOAD_CHALLENGE_RESOURCES_FAILURE
        })
      })
    } else {
      dispatch({
        type: LOAD_CHALLENGE_RESOURCES_SUCCESS,
        challengeResources: null
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
