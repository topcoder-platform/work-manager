import {
  LOAD_PROJECT_DETAILS_SUCCESS,
  LOAD_PROJECT_DETAILS_PENDING,
  LOAD_PROJECT_DETAILS_FAILURE,
  LOAD_CHALLENGE_MEMBERS_SUCCESS
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

        if (project && project.members) {
          const members = project.members.filter(m => m.role === 'manager' || m.role === 'copilot')
          dispatch({
            type: LOAD_CHALLENGE_MEMBERS_SUCCESS,
            members
          })
        }
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
