/**
 * Reducer to process actions related to sidebar
 */
import {
  SET_ACTIVE_PROJECT,
  SET_ACTIVE_MENU,
  LOAD_PROJECTS_SUCCESS,
  LOAD_PROJECTS_PENDING,
  LOAD_PROJECTS_FAILURE,
  RESET_SIDEBAR_ACTIVE_PARAMS
} from '../config/constants'

const initialState = {
  activeProjectId: -1,
  activeMenu: '',
  isLoading: true,
  projects: []
}

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_ACTIVE_PROJECT:
      return { ...state, activeProjectId: action.projectId }
    case SET_ACTIVE_MENU:
      return { ...state, activeMenu: action.menu }
    case LOAD_PROJECTS_SUCCESS:
      return { ...state, projects: action.projects, isLoading: false, isLoggedIn: true }
    case LOAD_PROJECTS_PENDING:
      return { ...state, isLoading: true }
    case LOAD_PROJECTS_FAILURE:
      return { ...state, isLoading: false }
    case RESET_SIDEBAR_ACTIVE_PARAMS:
      return { ...state, activeProjectId: -1, activeMenu: '' }
    default:
      return state
  }
}
