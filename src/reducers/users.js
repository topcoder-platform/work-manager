/**
 * Reducer to process actions related to sidebar
 */
import {
  LOAD_ALL_USER_PROJECTS_PENDING,
  LOAD_ALL_USER_PROJECTS_SUCCESS,
  LOAD_ALL_USER_PROJECTS_FAILURE,
  SEARCH_USER_PROJECTS_PENDING,
  SEARCH_USER_PROJECTS_SUCCESS,
  SEARCH_USER_PROJECTS_FAILURE
} from '../config/constants'

const initialState = {
  allUserProjects: [],
  isLoadingAllUserProjects: false,
  searchUserProjects: [],
  isSearchingUserProjects: false
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_USER_PROJECTS_SUCCESS:
      return {
        ...state,
        allUserProjects: action.projects,
        isLoadingAllUserProjects: false
      }
    case LOAD_ALL_USER_PROJECTS_PENDING:
      return { ...state, isLoadingAllUserProjects: true }
    case LOAD_ALL_USER_PROJECTS_FAILURE:
      return { ...state, isLoadingAllUserProjects: false }

    case SEARCH_USER_PROJECTS_SUCCESS:
      return {
        ...state,
        searchUserProjects: action.projects,
        isSearchingUserProjects: false
      }
    case SEARCH_USER_PROJECTS_PENDING:
      return {
        ...state,
        searchUserProjects: [],
        isSearchingUserProjects: true
      }
    case SEARCH_USER_PROJECTS_FAILURE:
      return {
        ...state,
        searchUserProjects: [],
        isSearchingUserProjects: false
      }
    default:
      return state
  }
}
