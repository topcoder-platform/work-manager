/**
 * Reducer to process actions related to challenge details
 */
import {
  LOAD_CHALLENGE_SUBMISSIONS_FAILURE,
  LOAD_CHALLENGE_SUBMISSIONS_PENDING,
  LOAD_CHALLENGE_SUBMISSIONS_SUCCESS
} from '../config/constants'

const initialState = {
  isLoading: true,
  loadingId: null,
  challengeId: null,
  challengeSubmissions: [],
  totalSubmissions: 0,
  submissionsPerPage: 10,
  page: 1
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_CHALLENGE_SUBMISSIONS_SUCCESS:
      return {
        ...state,
        challengeSubmissions: action.payload.data,
        isLoading: false,
        loadingId: null,
        challengeId: state.loadingId,
        totalSubmissions: action.payload.headers['x-total'],
        page: action.payload.page,
        submissionsPerPage: action.payload.perPage
      }
    case LOAD_CHALLENGE_SUBMISSIONS_PENDING:
      return {
        ...state,
        isLoading: true,
        loadingId: action.challengeId,
        challengeId: null,
        challengeSubmissions: [],
        totalPages: 0
      }
    case LOAD_CHALLENGE_SUBMISSIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        loadingId: null,
        challengeId: null,
        challengeSubmissions: [],
        totalPages: 0
      }
    default:
      return state
  }
}
