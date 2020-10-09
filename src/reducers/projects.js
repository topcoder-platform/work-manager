/**
 * Reducer to process actions related to project
 */
import _ from 'lodash'
import {
  LOAD_PROJECT_DETAILS_FAILURE,
  LOAD_PROJECT_DETAILS_PENDING,
  LOAD_PROJECT_DETAILS_SUCCESS
} from '../config/constants'

const initialState = {
  isLoading: false,
  projectDetail: {}
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_PROJECT_DETAILS_PENDING:
      return { ...state, isLoading: true }
    case LOAD_PROJECT_DETAILS_FAILURE: {
      const status = _.get(action, 'payload.response.status', 500)
      return { ...state, isLoading: false, hasProjectAccess: status !== 403 }
    }
    case LOAD_PROJECT_DETAILS_SUCCESS:
      return {
        ...state,
        projectDetail: action.payload,
        hasProjectAccess: true,
        isLoading: false
      }
    default:
      return state
  }
}
