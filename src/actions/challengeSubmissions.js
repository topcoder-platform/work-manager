import _ from 'lodash'
import { fetchChallengeSubmissions } from '../services/submissionReview'
import {
  LOAD_CHALLENGE_SUBMISSIONS_FAILURE,
  LOAD_CHALLENGE_SUBMISSIONS_PENDING,
  LOAD_CHALLENGE_SUBMISSIONS_SUCCESS
} from '../config/constants'

/**
 * Load challenge submissions
 * @param {String} challengeId
 */
export function loadChallengeSubmissions (challengeId) {
  return async (dispatch, getState) => {
    const getLoadingId = () => _.get(getState(), 'challengeSubmissions.loadingId')

    // if it's not loading already
    if (challengeId !== getLoadingId()) {
      dispatch({
        type: LOAD_CHALLENGE_SUBMISSIONS_PENDING,
        challengeId
      })

      try {
        const challengeSubmissions = await fetchChallengeSubmissions(challengeId)

        // prevent possible race condition
        if (challengeId === getLoadingId()) {
          dispatch({
            type: LOAD_CHALLENGE_SUBMISSIONS_SUCCESS,
            challengeSubmissions
          })
        }
      } catch (error) {
        console.error(error)
        dispatch({
          type: LOAD_CHALLENGE_SUBMISSIONS_FAILURE
        })
      }
    }
  }
}
