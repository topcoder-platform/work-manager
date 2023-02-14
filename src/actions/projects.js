import {
  LOAD_PROJECT_BILLING_ACCOUNT,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_PROJECT_DETAILS,
  LOAD_PROJECT_PHASES,
  LOAD_CHALLENGE_MEMBERS
} from '../config/constants'
import {
  fetchProjectById,
  fetchBillingAccount,
  fetchProjectPhases
} from '../services/projects'

/**
 * Loads project details
 */
export function loadProject (projectId, filterMembers = true) {
  return (dispatch, getState) => {
    return dispatch({
      type: LOAD_PROJECT_DETAILS,
      payload: fetchProjectById(projectId).then((project) => {
        if (project && project.members) {
          const members = filterMembers ? project.members.filter(m => m.role === 'manager' || m.role === 'copilot') : project.members
          dispatch({
            type: LOAD_CHALLENGE_MEMBERS_SUCCESS,
            payload: members
          })
        }

        // Loads billing account
        dispatch({
          type: LOAD_PROJECT_BILLING_ACCOUNT,
          payload: fetchBillingAccount(projectId)
        })

        // Loads project phases
        dispatch({
          type: LOAD_PROJECT_PHASES,
          payload: fetchProjectPhases(projectId)
        })

        return project
      })
    })
  }
}

export function reloadProjectMembers (projectId) {
  return (dispatch) => {
    return dispatch({
      type: LOAD_CHALLENGE_MEMBERS,
      payload: fetchProjectById(projectId)
        .then((project) => {
          if (project && project.members) {
            return project.members
          }
          return []
        })
    })
  }
}
