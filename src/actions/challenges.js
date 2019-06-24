import _ from 'lodash'
import {
  fetchProjectChallenges,
  fetchChallengeTypes,
  fetchChallengeTags,
  fetchGroups,
  fetchTimelineTemplates,
  fetchChallengePhases,
  uploadAttachment,
  fetchChallenge
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
  REMOVE_ATTACHMENT
} from '../config/constants'
import { fetchProjectById, fetchProjectMembers } from '../services/projects'

/**
 * Member challenges related redux actions
 */

/**
 * Loads active challenges of project
 */
export function loadChallenges (projectId, status) {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD_CHALLENGES_PENDING,
      challenges: []
    })

    fetchProjectChallenges(projectId, status).then(challenges => dispatch({
      type: LOAD_CHALLENGES_SUCCESS,
      challenges
    })).catch(() => dispatch({
      type: LOAD_CHALLENGES_FAILURE,
      challenges: []
    }))
  }
}

/**
 * Loads Challenge details
 */
export function loadChallengeDetails (projectId, challengeId) {
  return async (dispatch, getState) => {
    const { selectedProjectId, metadata } = getState().challenges
    dispatch({
      type: LOAD_CHALLENGE_DETAILS_PENDING,
      challengeDetails: {}
    })

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

    if (!metadata.challengeTypes) {
      const timelineTemplates = await fetchTimelineTemplates()
      const challengePhases = await fetchChallengePhases()
      const challengeTypes = await fetchChallengeTypes()
      const challengeTags = await fetchChallengeTags()
      const groups = await fetchGroups()
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadata: {
          challengeTypes,
          challengeTags,
          groups,
          timelineTemplates,
          challengePhases: challengePhases.filter(c => c.isActive)
        }
      })
    }

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
