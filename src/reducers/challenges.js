/**
 * Reducer to process actions related to challenge list
 */
import {
  LOAD_CHALLENGE_DETAILS_FAILURE,
  LOAD_CHALLENGE_DETAILS_PENDING,
  LOAD_CHALLENGE_DETAILS_SUCCESS,
  LOAD_CHALLENGE_MEMBERS_SUCCESS, LOAD_CHALLENGE_METADATA_SUCCESS,
  LOAD_CHALLENGES_FAILURE,
  LOAD_CHALLENGES_PENDING,
  LOAD_CHALLENGES_SUCCESS
} from '../config/constants'

const initialState = {
  isLoading: true,
  challenges: [],
  metadata: {},
  selectedProjectId: null,
  challengeDetails: {}
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_CHALLENGES_SUCCESS:
      return { ...state, challenges: action.challenges, isLoading: false }
    case LOAD_CHALLENGES_PENDING:
    case LOAD_CHALLENGE_DETAILS_PENDING:
      return { ...state, isLoading: true }
    case LOAD_CHALLENGES_FAILURE:
    case LOAD_CHALLENGE_DETAILS_FAILURE:
      return { ...state, isLoading: false }
    case LOAD_CHALLENGE_DETAILS_SUCCESS:
      return { ...state, challengeDetails: action.challengeDetails, isLoading: false }
    case LOAD_CHALLENGE_METADATA_SUCCESS:
      return { ...state, metadata: { ...state.metadata, ...action.metadata } }
    case LOAD_CHALLENGE_MEMBERS_SUCCESS:
      return { ...state, metadata: { ...state.metadata, members: action.members } }
    default:
      return state
  }
}
