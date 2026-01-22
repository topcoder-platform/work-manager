/**
 * Reducer to process actions related to applications
 */
import _ from 'lodash'
import { toastSuccess, toastFailure } from '../util/toaster'
import {
  LOAD_APPLICATIONS_PENDING,
  LOAD_APPLICATIONS_SUCCESS,
  LOAD_APPLICATIONS_FAILURE,
  LOAD_APPLICATION_DETAILS_PENDING,
  LOAD_APPLICATION_DETAILS_SUCCESS,
  LOAD_APPLICATION_DETAILS_FAILURE,
  UPDATE_APPLICATION_STATUS_PENDING,
  UPDATE_APPLICATION_STATUS_SUCCESS,
  UPDATE_APPLICATION_STATUS_FAILURE
} from '../config/constants'

const initialState = {
  isLoading: false,
  applications: [],
  applicationDetails: {},
  failedToLoad: false,
  errorMessage: ''
}

const getErrorMessage = (action, fallback) => _.get(action, 'error.response.data.message', fallback)

const upsertApplication = (applications, application) => {
  if (!application || !application.id) {
    return applications
  }
  const existingIndex = _.findIndex(applications, { id: application.id })
  if (existingIndex === -1) {
    return [application, ...applications]
  }
  return [
    ...applications.slice(0, existingIndex),
    application,
    ...applications.slice(existingIndex + 1)
  ]
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_APPLICATIONS_PENDING:
      return {
        ...state,
        isLoading: true,
        failedToLoad: false,
        errorMessage: ''
      }
    case LOAD_APPLICATIONS_SUCCESS:
      return {
        ...state,
        applications: action.applications || [],
        isLoading: false,
        failedToLoad: false
      }
    case LOAD_APPLICATIONS_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to load applications')
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isLoading: false,
        failedToLoad: true,
        errorMessage
      }
    }
    case LOAD_APPLICATION_DETAILS_PENDING:
      return {
        ...state,
        isLoading: true,
        applicationDetails: {},
        failedToLoad: false,
        errorMessage: ''
      }
    case LOAD_APPLICATION_DETAILS_SUCCESS:
      return {
        ...state,
        applicationDetails: action.applicationDetails || {},
        isLoading: false,
        failedToLoad: false
      }
    case LOAD_APPLICATION_DETAILS_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to load application details')
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isLoading: false,
        failedToLoad: true,
        errorMessage
      }
    }
    case UPDATE_APPLICATION_STATUS_PENDING:
      return {
        ...state,
        isLoading: true,
        errorMessage: ''
      }
    case UPDATE_APPLICATION_STATUS_SUCCESS: {
      const updatedApplication = action.application || {}
      const applications = upsertApplication(state.applications, updatedApplication)
      const applicationDetails = updatedApplication.id && state.applicationDetails && state.applicationDetails.id === updatedApplication.id
        ? updatedApplication
        : state.applicationDetails
      toastSuccess('Success', 'Application status updated successfully.')
      return {
        ...state,
        applications,
        applicationDetails,
        isLoading: false,
        failedToLoad: false
      }
    }
    case UPDATE_APPLICATION_STATUS_FAILURE: {
      const errorMessage = getErrorMessage(action, 'Failed to update application status')
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
