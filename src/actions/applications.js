import _ from 'lodash'
import {
  fetchApplications,
  fetchApplication,
  updateApplicationStatus as updateApplicationStatusAPI,
  approveApplication as approveApplicationAPI
} from '../services/engagements'
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

/**
 * Loads applications for an engagement
 * @param {String|Number} engagementId
 * @param {String} statusFilter
 */
export function loadApplications (engagementId, statusFilter = 'all') {
  return async (dispatch) => {
    dispatch({
      type: LOAD_APPLICATIONS_PENDING
    })

    const filters = {}
    if (statusFilter && statusFilter !== 'all') {
      filters.status = statusFilter
    }

    try {
      const response = await fetchApplications(engagementId, filters)
      return dispatch({
        type: LOAD_APPLICATIONS_SUCCESS,
        applications: _.get(response, 'data', [])
      })
    } catch (error) {
      dispatch({
        type: LOAD_APPLICATIONS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Loads application details
 * @param {String|Number} applicationId
 */
export function loadApplicationDetails (applicationId) {
  return async (dispatch) => {
    if (!applicationId) {
      return dispatch({
        type: LOAD_APPLICATION_DETAILS_SUCCESS,
        applicationDetails: {}
      })
    }

    dispatch({
      type: LOAD_APPLICATION_DETAILS_PENDING
    })

    try {
      const response = await fetchApplication(applicationId)
      return dispatch({
        type: LOAD_APPLICATION_DETAILS_SUCCESS,
        applicationDetails: _.get(response, 'data', {})
      })
    } catch (error) {
      dispatch({
        type: LOAD_APPLICATION_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Updates application status
 * @param {String|Number} applicationId
 * @param {String} status
 */
export function updateApplicationStatus (applicationId, status) {
  return async (dispatch) => {
    dispatch({
      type: UPDATE_APPLICATION_STATUS_PENDING
    })

    try {
      const normalizedStatus = (status || '').toString().toUpperCase()
      const response = normalizedStatus === 'ACCEPTED'
        ? await approveApplicationAPI(applicationId)
        : await updateApplicationStatusAPI(applicationId, status)
      return dispatch({
        type: UPDATE_APPLICATION_STATUS_SUCCESS,
        application: _.get(response, 'data', {})
      })
    } catch (error) {
      dispatch({
        type: UPDATE_APPLICATION_STATUS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}
