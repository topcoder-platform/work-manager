import {
  LOAD_PROJECT_DETAILS_SUCCESS,
  LOAD_PROJECT_DETAILS_PENDING,
  LOAD_PROJECT_DETAILS_FAILURE
} from '../config/constants'
import { fetchProjectById } from '../services/projects'

/**
 * Loads project details
 */
export function loadProject (projectId) {
  return async (dispatch, getState) => {
    dispatch({
      type: LOAD_PROJECT_DETAILS_PENDING,
      projectDetail: {}
    })
    if (projectId) {
      fetchProjectById(projectId).then((project) => {
        dispatch({
          type: LOAD_PROJECT_DETAILS_SUCCESS,
          projectDetail: project
        })
      }).catch(() => {
        dispatch({
          type: LOAD_PROJECT_DETAILS_FAILURE
        })
      })
    } else {
      dispatch({
        type: LOAD_PROJECT_DETAILS_SUCCESS,
        projectDetail: null
      })
    }
  }
}
