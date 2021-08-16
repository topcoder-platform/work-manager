import {
  LOAD_PROJECT_BILLING_ACCOUNT,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_PROJECT_DETAILS,
  LOAD_PROJECT_PHASES
} from '../config/constants'
import { fetchProjectById, fetchBillingAccount, fetchProjectPhases } from '../services/projects'

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
