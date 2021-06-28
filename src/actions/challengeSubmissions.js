import { fetchSubmissions } from '../services/challenges'

import { LOAD_CHALLENGE_SUBMISSIONS } from '../config/constants'

export function loadSubmissions (challengeId) {
  return dispatch => {
    if (challengeId) {
      dispatch({
        type: LOAD_CHALLENGE_SUBMISSIONS,
        payload: fetchSubmissions(challengeId)
      })
    }
  }
}
