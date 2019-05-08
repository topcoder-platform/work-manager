import { fetchProjectChallenges } from '../services/challenges'
import { LOAD_CHALLENGES_FAILURE, LOAD_CHALLENGES_PENDING, LOAD_CHALLENGES_SUCCESS } from '../config/constants'

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
