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
  LOAD_PROJECT_PHASES_SUCCESS,
  LOAD_PROJECT_TYPES_FAILURE,
  LOAD_PROJECT_TYPES_PENDING,
  LOAD_PROJECT_TYPES_SUCCESS,
  UPDATE_PROJECT_SUCCESS
} from '../config/constants'
import { toastSuccess } from '../util/toaster'
import moment from 'moment-timezone'

/**
 * checks if billing is expired or not
 * @param {boolean} active if billing account is active or not
 * @param {string} endDate the end date
 * @returns if billing expired or not
 */
const checkBillingExpired = (active, endDate) => {
  if (active) {
    if (moment().isBefore(endDate)) {
      return false
    }
    return true
  }
  return true
}
const dateFormat = 'MMM DD, YYYY'

const initialState = {
  isLoading: false,
  projectDetail: {},
  isBillingAccountExpired: false,
  isBillingAccountLoading: false,
  isBillingAccountLoadingFailed: false,
  billingStartDate: null,
  billingEndDate: null,
  isPhasesLoading: false,
  phases: [],
  isProjectTypesLoading: false,
  projectTypes: []
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
        isBillingAccountExpired: false,
        billingStartDate: '',
        billingEndDate: ''
      }
    case LOAD_PROJECT_BILLING_ACCOUNT_SUCCESS:
      return {
        ...state,
        isBillingAccountLoading: false,
        isBillingAccountExpired: checkBillingExpired(action.payload.active, action.payload.endDate),
        billingStartDate: moment(action.payload.startDate).format(dateFormat),
        billingEndDate: moment(action.payload.endDate).format(dateFormat),
        isBillingAccountLoadingFailed: false
      }
    case LOAD_PROJECT_BILLING_ACCOUNT_FAILURE:
      return {
        ...state,
        isBillingAccountLoading: false,
        isBillingAccountExpired: false,
        billingStartDate: '',
        billingEndDate: '',
        isBillingAccountLoadingFailed: true
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
    case LOAD_PROJECT_TYPES_PENDING:
      return {
        ...state,
        projectTypes: [],
        isProjectTypesLoading: true
      }
    case LOAD_PROJECT_TYPES_SUCCESS:
      return {
        ...state,
        projectTypes: action.payload,
        isProjectTypesLoading: false
      }
    case LOAD_PROJECT_TYPES_FAILURE:
      return {
        ...state,
        isProjectTypesLoading: false
      }
    case UPDATE_PROJECT_SUCCESS:
      toastSuccess('Success', `Project updated successfully.`)
      return {
        ...state,
        projectDetail: action.payload
      }
    default:
      return state
  }
}
