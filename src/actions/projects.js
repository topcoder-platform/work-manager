import {
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_PROJECT_DETAILS
} from '../config/constants'
import { fetchProjectById } from '../services/projects'

/**
 * Loads project details
 */
export function loadProject (projectId) {
  return (dispatch, getState) => {
    return dispatch({
      type: LOAD_PROJECT_DETAILS,
      payload: fetchProjectById(projectId).then((project) => {
        if (project && project.members) {
          const members = project.members.filter(m => m.role === 'manager' || m.role === 'copilot')
          dispatch({
            type: LOAD_CHALLENGE_MEMBERS_SUCCESS,
            members
          })
        }
        return project
      })
    })
  }
}
