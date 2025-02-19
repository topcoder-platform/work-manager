/**
 * Sidebar related redux actions
 */
import { fetchMemberProjects } from '../services/projects'
import {
  SET_ACTIVE_PROJECT,
  LOAD_PROJECTS_FAILURE,
  LOAD_PROJECTS_PENDING,
  LOAD_PROJECTS_SUCCESS,
  RESET_SIDEBAR_ACTIVE_PARAMS,
  UNLOAD_PROJECTS_SUCCESS,
  PROJECTS_PAGE_SIZE
} from '../config/constants'
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
export function loadProjects (filterProjectName = '', myProjects = true, paramFilters = {}) {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD_PROJECTS_PENDING
    })

    const filters = {
      sort: 'lastActivityAt desc',
      perPage: PROJECTS_PAGE_SIZE,
      ...paramFilters
    }
    if (!_.isEmpty(filterProjectName)) {
      if (!isNaN(filterProjectName)) { // if it is number
        filters['id'] = parseInt(filterProjectName, 10)
      } else { // text search
        filters['keyword'] = decodeURIComponent(filterProjectName)
      }
    }

    if (myProjects) {
      filters['memberOnly'] = true
    }

    const state = getState().sidebar
    // eslint-disable-next-line no-sequences
    fetchMemberProjects(filters).then(({ projects, pagination }) => (console.log('here', pagination), dispatch({
      type: LOAD_PROJECTS_SUCCESS,
      projects: _.uniqBy((state.projects || []).concat(projects), 'id'),
      total: pagination.xTotal,
      page: pagination.xPage
    }))).catch(() => dispatch({
      type: LOAD_PROJECTS_FAILURE
    }))
  }
}

/**
 * Load more projects for the authenticated user
 */
export function loadMoreProjects (filterProjectName = '', myProjects = true, paramFilters = {}) {
  return (dispatch, getState) => {
    const state = getState().sidebar

    loadProjects(filterProjectName, myProjects, _.assignIn({}, paramFilters, {
      perPage: PROJECTS_PAGE_SIZE,
      page: state.page + 1
    }))(dispatch, getState)
  }
}

export function loadTaasProjects (filterProjectName = '', myProjects = true, paramFilters = {}) {
  return loadProjects(filterProjectName, myProjects, Object.assign({
    type: 'talent-as-a-service'
  }, paramFilters))
}

/**
 * Unloads projects of the authenticated user
 */
export function unloadProjects () {
  return (dispatch) => {
    dispatch({
      type: UNLOAD_PROJECTS_SUCCESS
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
