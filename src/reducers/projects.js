/**
 * Reducer to process actions related to project
 */
import _ from 'lodash'
import {
  LOAD_PROJECT_BILLING_ACCOUNTS_PENDING,
  LOAD_PROJECT_BILLING_ACCOUNTS_SUCCESS,
  LOAD_PROJECT_BILLING_ACCOUNTS_FAILURE,
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
  UPDATE_PROJECT_FAILURE,
  UPDATE_PROJECT_PENDING,
  UPDATE_PROJECT_SUCCESS,
  UPDATE_PROJECT_DETAILS_FAILURE,
  UPDATE_PROJECT_DETAILS_PENDING,
  UPDATE_PROJECT_DETAILS_SUCCESS
} from '../config/constants'
import { toastSuccess, toastFailure } from '../util/toaster'
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

/**
 * Builds billing account options
 * @param {array} billingAccountObj the billing account object
 * @returns {array} the billing account options
 */
const buildBillingAccountOptions = (billingAccountObj) => {
  const billingAccountOptions = billingAccountObj.map(billingAccount => ({
    label: `(${billingAccount.tcBillingAccountId}) ${
      billingAccount.endDate
        ? ' - ' + moment(billingAccount.endDate).format(dateFormat)
        : ''
    }`,
    value: billingAccount.tcBillingAccountId
  }))
  return billingAccountOptions
}

const initialState = {
  isLoading: false,
  isUpdating: false,
  projectDetail: {},
  isBillingAccountsLoading: false,
  billingAccounts: [],
  isBillingAccountExpired: false,
  isBillingAccountLoading: false,
  isBillingAccountLoadingFailed: false,
  currentBillingAccount: null,
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
      const errorMessage = _.get(
        action.payload,
        'response.data.message',
        'Failed to load project details'
      )
      toastFailure('Error', errorMessage)
      return { ...state, isLoading: false, hasProjectAccess: status !== 403 }
    }
    case LOAD_PROJECT_DETAILS_SUCCESS:
      return {
        ...state,
        projectDetail: action.payload,
        hasProjectAccess: true,
        isLoading: false
      }
    case LOAD_PROJECT_BILLING_ACCOUNTS_PENDING:
      return {
        ...state,
        isBillingAccountsLoading: true,
        billingAccounts: []
      }

    case LOAD_PROJECT_BILLING_ACCOUNTS_SUCCESS:
      return {
        ...state,
        isBillingAccountsLoading: false,
        billingAccounts: [
          ...buildBillingAccountOptions(
            action.payload
          )
        ]
      }
    case LOAD_PROJECT_BILLING_ACCOUNTS_FAILURE:
      return {
        ...state,
        isBillingAccountsLoading: false
      }
    case UPDATE_PROJECT_DETAILS_PENDING:
      return { ...state, isUpdating: true }
    case UPDATE_PROJECT_DETAILS_FAILURE: {
      const errorMessage = _.get(
        action.payload,
        'response.data.message',
        'Failed to update project info'
      )
      toastFailure('Error', errorMessage)
      return { ...state, isUpdating: false }
    }
    case UPDATE_PROJECT_DETAILS_SUCCESS:
      toastSuccess('Success', 'Project updated successfully.')
      return {
        ...state,
        projectDetail: {
          ...state.projectDetail,
          name: action.payload.name,
          details: action.payload.details
        },
        hasProjectAccess: true,
        isUpdating: false
      }
    case LOAD_PROJECT_BILLING_ACCOUNT_PENDING:
      return {
        ...state,
        isBillingAccountLoading: true,
        isBillingAccountExpired: false,
        billingStartDate: '',
        billingEndDate: '',
        currentBillingAccount: null
      }
    case LOAD_PROJECT_BILLING_ACCOUNT_SUCCESS:
      // Check if the payload is empty
      if (!action.payload || Object.keys(action.payload).length === 0) {
        // If empty, optionally just update the loading flag (or keep it as is):
        return {
          ...state,
          isBillingAccountLoading: false,
          isBillingAccountLoadingFailed: true
        }
      }
      return {
        ...state,
        isBillingAccountLoading: false,
        isBillingAccountExpired: checkBillingExpired(
          action.payload.active,
          action.payload.endDate
        ),
        billingStartDate: moment(action.payload.startDate).format(dateFormat),
        billingEndDate: moment(action.payload.endDate).format(dateFormat),
        currentBillingAccount: action.payload.tcBillingAccountId,
        isBillingAccountLoadingFailed: false
      }
    case LOAD_PROJECT_BILLING_ACCOUNT_FAILURE:
      return {
        ...state,
        isBillingAccountLoading: false,
        isBillingAccountExpired: false,
        billingStartDate: '',
        billingEndDate: '',
        currentBillingAccount: null,
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
    case UPDATE_PROJECT_PENDING:
      return {
        ...state,
        isUpdatingProject: true
      }
    case UPDATE_PROJECT_SUCCESS:
      toastSuccess('Success', 'Project updated successfully.')
      return {
        ...state,
        projectDetail: action.payload,
        isUpdatingProject: false
      }
    case UPDATE_PROJECT_FAILURE:
      const message = _.get(
        action,
        'payload.response.data.message',
        'Failed to update project.'
      )
      toastFailure('Error', message)
      return {
        ...state,
        isUpdatingProject: false
      }
    default:
      return state
  }
}
