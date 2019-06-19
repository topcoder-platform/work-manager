import {
  fetchProjectChallenges,
  fetchChallengeTypes,
  fetchGroups, fetchTimelineTemplates, fetchChallengePhases
} from '../services/challenges'
import {
  LOAD_CHALLENGE_DETAILS_PENDING,
  LOAD_CHALLENGE_DETAILS_SUCCESS, LOAD_CHALLENGE_MEMBERS_SUCCESS, LOAD_CHALLENGE_METADATA_SUCCESS,
  LOAD_CHALLENGES_FAILURE,
  LOAD_CHALLENGES_PENDING,
  LOAD_CHALLENGES_SUCCESS
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
      const groups = await fetchGroups()
      dispatch({
        type: LOAD_CHALLENGE_METADATA_SUCCESS,
        metadata: {
          challengeTypes,
          groups,
          timelineTemplates,
          challengePhases: challengePhases.filter(c => c.isActive)
        }
      })
    }

    dispatch({
      type: LOAD_CHALLENGE_DETAILS_SUCCESS,
      challengeDetails: {}
    })
  }
}
