import {
  LOAD_PROJECT_BILLING_ACCOUNT,
  LOAD_CHALLENGE_MEMBERS_SUCCESS,
  LOAD_PROJECT_DETAILS,
  LOAD_PROJECT_PHASES,
  LOAD_CHALLENGE_MEMBERS,
  LOAD_PROJECT_TYPES,
  CREATE_PROJECT,
  UPDATE_PROJECT
} from '../config/constants'
import {
  fetchProjectById,
  fetchBillingAccount,
  fetchProjectPhases,
  getProjectTypes,
  createProjectApi,
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
 * Updates a project
 */
export function updateProject (projectId, project) {
  return (dispatch) => {
    return dispatch({
      type: UPDATE_PROJECT,
      payload: updateProjectApi(projectId, project)
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
