/**
 * Reducer to process actions related to engagement list
 */
import _ from 'lodash'
import { toastSuccess, toastFailure } from '../util/toaster'
import {
  LOAD_ENGAGEMENTS_PENDING,
  LOAD_ENGAGEMENTS_SUCCESS,
  LOAD_ENGAGEMENTS_FAILURE,
  LOAD_ENGAGEMENT_DETAILS_PENDING,
  LOAD_ENGAGEMENT_DETAILS_SUCCESS,
  LOAD_ENGAGEMENT_DETAILS_FAILURE,
  CREATE_ENGAGEMENT_PENDING,
  CREATE_ENGAGEMENT_SUCCESS,
  CREATE_ENGAGEMENT_FAILURE,
  UPDATE_ENGAGEMENT_DETAILS_PENDING,
  UPDATE_ENGAGEMENT_DETAILS_SUCCESS,
  UPDATE_ENGAGEMENT_DETAILS_FAILURE,
  DELETE_ENGAGEMENT_PENDING,
  DELETE_ENGAGEMENT_SUCCESS,
  DELETE_ENGAGEMENT_FAILURE
} from '../config/constants'

const initialState = {
  isLoading: false,
  engagements: [],
  engagementDetails: {},
  failedToLoad: false,
  errorMessage: ''
}

const getErrorMessage = (action, fallback) => _.get(action, 'error.response.data.message', fallback)

const upsertEngagement = (engagements, engagement) => {
  if (!engagement || !engagement.id) {
    return engagements
  }
  const existingIndex = _.findIndex(engagements, { id: engagement.id })
  if (existingIndex === -1) {
    return [engagement, ...engagements]
  }
  return [
    ...engagements.slice(0, existingIndex),
    engagement,
    ...engagements.slice(existingIndex + 1)
  ]
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ENGAGEMENTS_PENDING:
      return {
        ...state,
        isLoading: true,
        failedToLoad: false,
        errorMessage: ''
      }
    case LOAD_ENGAGEMENTS_SUCCESS:
      return {
        ...state,
        engagements: action.engagements || [],
        isLoading: false,
        failedToLoad: false
      }
    case LOAD_ENGAGEMENTS_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to load engagements')
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isLoading: false,
        failedToLoad: true,
        errorMessage
      }
    }
    case LOAD_ENGAGEMENT_DETAILS_PENDING:
      return {
        ...state,
        isLoading: true,
        engagementDetails: {},
        failedToLoad: false,
        errorMessage: ''
      }
    case LOAD_ENGAGEMENT_DETAILS_SUCCESS:
      return {
        ...state,
        engagementDetails: action.engagementDetails || {},
        isLoading: false,
        failedToLoad: false
      }
    case LOAD_ENGAGEMENT_DETAILS_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to load engagement details')
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isLoading: false,
        failedToLoad: true,
        errorMessage
      }
    }
    case CREATE_ENGAGEMENT_PENDING:
    case UPDATE_ENGAGEMENT_DETAILS_PENDING:
    case DELETE_ENGAGEMENT_PENDING:
      return {
        ...state,
        isLoading: true,
        errorMessage: ''
      }
    case CREATE_ENGAGEMENT_SUCCESS: {
      const engagements = upsertEngagement(state.engagements, action.engagementDetails)
      toastSuccess('Success', 'Engagement created successfully.')
      return {
        ...state,
        engagements,
        engagementDetails: action.engagementDetails || {},
        isLoading: false,
        failedToLoad: false
      }
    }
    case UPDATE_ENGAGEMENT_DETAILS_SUCCESS: {
      const engagements = upsertEngagement(state.engagements, action.engagementDetails)
      toastSuccess('Success', 'Engagement updated successfully.')
      return {
        ...state,
        engagements,
        engagementDetails: action.engagementDetails || {},
        isLoading: false,
        failedToLoad: false
      }
    }
    case DELETE_ENGAGEMENT_SUCCESS: {
      const deletedId = action.engagementId || _.get(action, 'engagementDetails.id')
      const engagements = deletedId
        ? state.engagements.filter(engagement => engagement.id !== deletedId)
        : state.engagements
      toastSuccess('Success', 'Engagement deleted successfully.')
      return {
        ...state,
        engagements,
        isLoading: false,
        failedToLoad: false
      }
    }
    case CREATE_ENGAGEMENT_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to create engagement')
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isLoading: false,
        errorMessage
      }
    }
    case UPDATE_ENGAGEMENT_DETAILS_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to update engagement')
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isLoading: false,
        errorMessage
      }
    }
    case DELETE_ENGAGEMENT_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to delete engagement')
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isLoading: false,
        errorMessage
      }
    }
    default:
      return state
  }
}
