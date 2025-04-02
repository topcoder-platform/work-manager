/**
 * Sidebar related redux actions
 */
import { fetchMemberProjects } from '../services/projects'
import {
  LOAD_ALL_USER_PROJECTS_PENDING,
  LOAD_ALL_USER_PROJECTS_SUCCESS,
  LOAD_ALL_USER_PROJECTS_FAILURE,
  SEARCH_USER_PROJECTS_PENDING,
  SEARCH_USER_PROJECTS_SUCCESS,
  SEARCH_USER_PROJECTS_FAILURE
} from '../config/constants'
import _ from 'lodash'

/**
 * Loads projects of the authenticated user
 */
export function loadAllUserProjects (params, isAdmin = true, isManager = true) {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD_ALL_USER_PROJECTS_PENDING
    })

    const state = getState().users

    const filters = {
      status: 'active',
      sort: 'lastActivityAt desc',
      perPage: 20,
      ...params
    }

    if (!isAdmin && !isManager) {
      filters['memberOnly'] = true
    }

    fetchMemberProjects(filters).then(({ projects, pagination }) => dispatch({
      type: LOAD_ALL_USER_PROJECTS_SUCCESS,
      projects: _.uniqBy((filters.page ? state.allUserProjects || [] : []).concat(projects), 'id'),
      total: pagination.xTotal,
      page: pagination.xPage
    })).catch(() => dispatch({
      type: LOAD_ALL_USER_PROJECTS_FAILURE
    }))
  }
}

export function loadNextProjects (isAdmin = true, isManager = true) {
  return (dispatch, getState) => {
    const { page, total, allUserProjects } = getState().users
    if (allUserProjects.length >= total) {
      return
    }

    loadAllUserProjects(_.assign({}, {
      perPage: 20,
      page: page + 1
    }), isAdmin, isManager)(dispatch, getState)
  }
}

/**
 * Filter projects of the authenticated user
 *
 * @param {bool} isAdmin is admin
 * @param {string} keyword search keyword
 */
export function searchUserProjects (isAdmin = true, keyword) {
  return (dispatch) => {
    if (!keyword) {
      dispatch({
        type: SEARCH_USER_PROJECTS_SUCCESS,
        projects: []
      })
      return
    }
    dispatch({
      type: SEARCH_USER_PROJECTS_PENDING
    })

    const filters = {
      sort: 'updatedAt desc',
      perPage: 20,
      page: 1,
      keyword
    }
    if (!isAdmin) {
      filters['memberOnly'] = true
    }

    fetchMemberProjects(filters).then(({ projects }) => dispatch({
      type: SEARCH_USER_PROJECTS_SUCCESS,
      projects
    })).catch(() => dispatch({
      type: SEARCH_USER_PROJECTS_FAILURE
    }))
  }
}
