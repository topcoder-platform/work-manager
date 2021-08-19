/**
 * Reducer to process actions related to project
 */
import _ from 'lodash'
import {
  LOAD_PROJECT_BILLING_ACCOUNT_PENDING,
  LOAD_PROJECT_BILLING_ACCOUNT_SUCCESS,
  LOAD_PROJECT_BILLING_ACCOUNT_FAILURE,
  LOAD_PROJECT_DETAILS_FAILURE,
  LOAD_PROJECT_DETAILS_PENDING,
  LOAD_PROJECT_DETAILS_SUCCESS,
  LOAD_PROJECT_PHASES_FAILURE,
  LOAD_PROJECT_PHASES_PENDING,
  LOAD_PROJECT_PHASES_SUCCESS
} from '../config/constants'

const initialState = {
  isLoading: false,
  projectDetail: {},
  isBillingAccountExpired: false,
  isBillingAccountLoading: false,
  isPhasesLoading: false,
  phases: []
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
    case LOAD_PROJECT_BILLING_ACCOUNT_PENDING:
      return {
        ...state,
        isBillingAccountLoading: true,
        isBillingAccountExpired: false
      }
    case LOAD_PROJECT_BILLING_ACCOUNT_SUCCESS:
      return {
        ...state,
        isBillingAccountLoading: false,
        isBillingAccountExpired: !action.payload.active
      }
    case LOAD_PROJECT_BILLING_ACCOUNT_FAILURE:
      return {
        ...state,
        isBillingAccountLoading: false,
        isBillingAccountExpired: false
      }
    case LOAD_PROJECT_PHASES_PENDING:
      return {
        ...state,
        phases: [],
        isPhasesLoading: true
      }
    case LOAD_PROJECT_PHASES_SUCCESS:
      return {
        ...state,
        phases: action.payload,
        isPhasesLoading: false
      }
    case LOAD_PROJECT_PHASES_FAILURE:
      return {
        ...state,
        isPhasesLoading: false
      }
    default:
      return state
  }
}
