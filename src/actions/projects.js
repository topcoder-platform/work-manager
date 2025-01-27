import {
  LOAD_PROJECT_BILLING_ACCOUNT,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_PROJECT_DETAILS,
  LOAD_PROJECT_PHASES,
  LOAD_CHALLENGE_MEMBERS,
  LOAD_PROJECT_TYPES,
  CREATE_PROJECT,
  LOAD_PROJECT_BILLING_ACCOUNTS,
  UPDATE_PROJECT_PENDING,
  UPDATE_PROJECT_SUCCESS,
  UPDATE_PROJECT_FAILURE
} from '../config/constants'
import {
  fetchProjectById,
  fetchBillingAccount,
  fetchProjectPhases,
  getProjectTypes,
  createProjectApi,
  fetchBillingAccounts,
  updateProjectApi
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
          type: LOAD_PROJECT_BILLING_ACCOUNTS,
          payload: fetchBillingAccounts(projectId)
        })

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

/**
 * Loads project types
 */
export function loadProjectTypes () {
  return (dispatch) => {
    return dispatch({
      type: LOAD_PROJECT_TYPES,
      payload: getProjectTypes()
    })
  }
}

/**
 * Creates a project
 */
export function createProject (project) {
  return (dispatch) => {
    return dispatch({
      type: CREATE_PROJECT,
      payload: createProjectApi(project)
    })
  }
}

/**
 * Only loads project details
 * @param {String} projectId Id of the project
 */
export function loadOnlyProjectInfo (projectId) {
  return (dispatch) => {
    return dispatch({
      type: LOAD_PROJECT_DETAILS,
      payload: fetchProjectById(projectId)
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

/**
 * Updates project details
 * @param {string} projectId - The project ID
 * @param {object} updatedProps - The updated project details
 * @returns {Promise<object>} The updated project
 */
export function updateProject (projectId, updatedProps) {
  return async (dispatch) => {
    dispatch({
      type: UPDATE_PROJECT_PENDING
    })
    return updateProjectApi(projectId, updatedProps).then((project) => {
      // refresh billing account
      dispatch({
        type: LOAD_PROJECT_BILLING_ACCOUNT,
        payload: fetchBillingAccount(projectId)
      })
      dispatch({
        type: LOAD_PROJECT_BILLING_ACCOUNTS,
        payload: fetchBillingAccounts(projectId)
      })
      return dispatch({
        type: UPDATE_PROJECT_SUCCESS,
        payload: project
      })
    }).catch((e) => {
      dispatch({
        type: UPDATE_PROJECT_FAILURE,
        error: e
      })
      return Promise.reject(e)
    })
  }
}
