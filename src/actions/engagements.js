import _ from 'lodash'
import {
  fetchEngagements,
  fetchEngagement,
  createEngagement as createEngagementAPI,
  updateEngagement as updateEngagementAPI,
  patchEngagement,
  deleteEngagement as deleteEngagementAPI
} from '../services/engagements'
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

/**
 * Loads engagements for a project
 * @param {String|Number} projectId
 * @param {String} status
 * @param {String} filterName
 */
export function loadEngagements (projectId, status = 'all', filterName = '') {
  return async (dispatch) => {
    dispatch({
      type: LOAD_ENGAGEMENTS_PENDING
    })

    const filters = {}
    if (projectId) {
      filters.projectId = projectId
    }
    if (status && status !== 'all') {
      filters.status = status
    }
    if (!_.isEmpty(filterName)) {
      filters.title = filterName
    }

    try {
      const response = await fetchEngagements(filters)
      dispatch({
        type: LOAD_ENGAGEMENTS_SUCCESS,
        engagements: _.get(response, 'data', [])
      })
    } catch (error) {
      dispatch({
        type: LOAD_ENGAGEMENTS_FAILURE,
        error
      })
    }
  }
}

/**
 * Loads engagement details
 * @param {String|Number} projectId
 * @param {String|Number} engagementId
 */
export function loadEngagementDetails (projectId, engagementId) {
  return async (dispatch) => {
    void projectId
    if (!engagementId) {
      return dispatch({
        type: LOAD_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails: {}
      })
    }

    dispatch({
      type: LOAD_ENGAGEMENT_DETAILS_PENDING
    })

    try {
      const response = await fetchEngagement(engagementId)
      return dispatch({
        type: LOAD_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails: _.get(response, 'data', {})
      })
    } catch (error) {
      dispatch({
        type: LOAD_ENGAGEMENT_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Creates engagement
 * @param {Object} engagementDetails
 * @param {String|Number} projectId
 */
export function createEngagement (engagementDetails, projectId) {
  return async (dispatch) => {
    dispatch({
      type: CREATE_ENGAGEMENT_PENDING
    })

    if (!projectId) {
      const error = new Error('Project ID is required to create engagement.')
      dispatch({
        type: CREATE_ENGAGEMENT_FAILURE,
        error
      })
      return Promise.reject(error)
    }

    const payload = {
      ...engagementDetails,
      projectId
    }

    try {
      const response = await createEngagementAPI(payload)
      return dispatch({
        type: CREATE_ENGAGEMENT_SUCCESS,
        engagementDetails: _.get(response, 'data', {})
      })
    } catch (error) {
      dispatch({
        type: CREATE_ENGAGEMENT_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Updates engagement details
 * @param {String|Number} engagementId
 * @param {Object} engagementDetails
 * @param {String|Number} projectId
 */
export function updateEngagementDetails (engagementId, engagementDetails, projectId) {
  return async (dispatch) => {
    void projectId
    dispatch({
      type: UPDATE_ENGAGEMENT_DETAILS_PENDING
    })

    try {
      const response = await updateEngagementAPI(engagementId, engagementDetails)
      return dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails: _.get(response, 'data', {})
      })
    } catch (error) {
      dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Partially updates engagement details
 * @param {String|Number} engagementId
 * @param {Object} partialDetails
 * @param {String|Number} projectId
 */
export function partiallyUpdateEngagementDetails (engagementId, partialDetails, projectId) {
  return async (dispatch) => {
    void projectId
    dispatch({
      type: UPDATE_ENGAGEMENT_DETAILS_PENDING
    })

    try {
      const response = await patchEngagement(engagementId, partialDetails)
      return dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails: _.get(response, 'data', {})
      })
    } catch (error) {
      dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Deletes engagement
 * @param {String|Number} engagementId
 * @param {String|Number} projectId
 */
export function deleteEngagement (engagementId, projectId) {
  return async (dispatch) => {
    void projectId
    dispatch({
      type: DELETE_ENGAGEMENT_PENDING
    })

    try {
      const response = await deleteEngagementAPI(engagementId)
      return dispatch({
        type: DELETE_ENGAGEMENT_SUCCESS,
        engagementDetails: _.get(response, 'data', {}),
        engagementId
      })
    } catch (error) {
      dispatch({
        type: DELETE_ENGAGEMENT_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}
