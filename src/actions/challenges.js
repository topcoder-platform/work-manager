import _ from 'lodash'
import {
  fetchChallengeTypes,
  fetchChallengeTags,
  fetchGroups,
  fetchTimelineTemplates,
  fetchChallengePhases,
  uploadAttachment,
  fetchChallenge,
  fetchChallenges
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
  REMOVE_ATTACHMENT,
  PAGE_SIZE,
  SET_FILTER_CHALLENGE_NAME
} from '../config/constants'
import { fetchProjectById, fetchProjectMembers } from '../services/projects'

/**
 * Member challenges related redux actions
 */

/**
 * Loads active challenges of project
 */
export function loadChallenges (projectId, status, filterChallengeName = null) {
  return (dispatch, getState) => {
    const oldState = getState().challenges
    if (oldState.status === status &&
      filterChallengeName === oldState.filterChallengeName &&
      `${projectId}` === oldState.projectId) return

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
        perPage: PAGE_SIZE
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
    const { selectedProjectId } = getState().challenges
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
    }

    if (selectedProjectId !== projectId) {
      const selectedProject = getState().sidebar.projects.length
        ? getState().sidebar.projects.find(p => p.id === +projectId)
        : await fetchProjectById(projectId)
      const projectMembers = selectedProject.members
        .filter(m => m.role === 'manager' || m.role === 'copilot')
        .map(m => m.userId)
      const members = projectMembers.length
        ? await fetchProjectMembers(projectMembers)
        : []
      dispatch({
        type: LOAD_CHALLENGE_MEMBERS_SUCCESS,
        members
      })
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
      metadataValue: challengePhases.filter(c => c.isActive)
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
  return async (dispatch) => {
    const groups = await fetchGroups()
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

/**
 * Set filter challenge name
 * @param value
 */
export function setFilterChallengeName (value) {
  return (dispatch) => {
    dispatch({
      type: SET_FILTER_CHALLENGE_NAME,
      value
    })
  }
}
