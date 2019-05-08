/**
 * Reducer to process actions related to challenge list
 */
import { LOAD_CHALLENGES_FAILURE, LOAD_CHALLENGES_PENDING, LOAD_CHALLENGES_SUCCESS } from '../config/constants'

const initialState = {
  isLoading: true,
  challenges: []
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_CHALLENGES_SUCCESS:
      return { ...state, challenges: action.challenges, isLoading: false }
    case LOAD_CHALLENGES_PENDING:
      return { ...state, isLoading: true }
    case LOAD_CHALLENGES_FAILURE:
      return { ...state, isLoading: false }
    default:
      return state
  }
}
