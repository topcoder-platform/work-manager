/**
 * Sidebar related redux actions
 */
import { fetchMemberProjects } from '../services/projects'
import {
  LOAD_ALL_USER_PROJECTS_PENDING,
  LOAD_ALL_USER_PROJECTS_SUCCESS,
  LOAD_ALL_USER_PROJECTS_FAILURE
} from '../config/constants'

/**
 * Loads projects of the authenticated user
 */
export function loadAllUserProjects (isAdmin = true) {
  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_USER_PROJECTS_PENDING
    })

    const filters = {
      status: 'active',
      sort: 'lastActivityAt desc'
    }
    if (!isAdmin) {
      filters['memberOnly'] = true
    }

    fetchMemberProjects(filters).then(projects => dispatch({
      type: LOAD_ALL_USER_PROJECTS_SUCCESS,
      projects
    })).catch(() => dispatch({
      type: LOAD_ALL_USER_PROJECTS_FAILURE
    }))
  }
}
