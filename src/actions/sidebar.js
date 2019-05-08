/**
 * Sidebar related redux actions
 */
import { fetchMemberProjects } from '../services/projects'
import { SET_ACTIVE_MENU, SET_ACTIVE_PROJECT, LOAD_PROJECTS_FAILURE, LOAD_PROJECTS_PENDING, LOAD_PROJECTS_SUCCESS } from '../config/constants'

/**
 * Set active menu
 */
export function setActiveMenu (menu) {
  return (dispatch) => {
    dispatch({
      type: SET_ACTIVE_MENU,
      menu: menu
    })
  }
}

/**
 * Set active project
 */
export function setActiveProject (projectId) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_ACTIVE_PROJECT,
      projectId: getState().sidebar.activeProjectId === projectId ? -1 : projectId
    })
  }
}

/**
 * Loads projects of the authenticated user
 */
export function loadProjects () {
  return (dispatch) => {
    dispatch({
      type: LOAD_PROJECTS_PENDING
    })

    fetchMemberProjects().then(projects => dispatch({
      type: LOAD_PROJECTS_SUCCESS,
      projects
    })).catch(() => dispatch({
      type: LOAD_PROJECTS_FAILURE
    }))
  }
}
