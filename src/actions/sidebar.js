/**
 * Sidebar related redux actions
 */
import { fetchMemberProjects } from '../services/projects'
import { SET_ACTIVE_PROJECT, LOAD_PROJECTS_FAILURE, LOAD_PROJECTS_PENDING, LOAD_PROJECTS_SUCCESS, RESET_SIDEBAR_ACTIVE_PARAMS } from '../config/constants'
import _ from 'lodash'

/**
 * Set active project
 */
export function setActiveProject (projectId) {
  return (dispatch, getState) => {
    if (getState().sidebar.activeProjectId === projectId) return
    dispatch({
      type: SET_ACTIVE_PROJECT,
      projectId: getState().sidebar.activeProjectId === projectId ? -1 : projectId
    })
  }
}

/**
 * Loads projects of the authenticated user
 */
export function loadProjects (filterProjectName = '', myProjects = true) {
  return (dispatch) => {
    dispatch({
      type: LOAD_PROJECTS_PENDING
    })

    const filters = {}
    if (!_.isEmpty(filterProjectName)) {
      if (!isNaN(filterProjectName)) { // if it is number
        filters['id'] = parseInt(filterProjectName, 10)
      } else { // text search
        filters['keyword'] = decodeURIComponent(filterProjectName)
      }
    }
    filters['status'] = 'active'
    filters['sort'] = 'lastActivityAt desc'
    // filters['perPage'] = 20
    // filters['page'] = 1
    if (myProjects) {
      filters['memberOnly'] = true
    }

    fetchMemberProjects(filters).then(projects => dispatch({
      type: LOAD_PROJECTS_SUCCESS,
      projects
    })).catch(() => dispatch({
      type: LOAD_PROJECTS_FAILURE
    }))
  }
}

/**
 * Unloads projects of the authenticated user
 */
export function unloadProjects () {
  return (dispatch) => {
    dispatch({
      type: LOAD_PROJECTS_SUCCESS,
      projects: []
    })
  }
}

/**
 * Reset active params. e.g activeProjectId
 */
export function resetSidebarActiveParams () {
  return (dispatch) => {
    dispatch({
      type: RESET_SIDEBAR_ACTIVE_PARAMS
    })
  }
}
