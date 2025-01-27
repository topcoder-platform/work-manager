/**
 * Reducer to process actions related to sidebar
 */
import _ from 'lodash'
import {
  SET_ACTIVE_PROJECT,
  LOAD_PROJECTS_SUCCESS,
  LOAD_PROJECTS_PENDING,
  LOAD_PROJECTS_FAILURE,
  RESET_SIDEBAR_ACTIVE_PARAMS,
  UNLOAD_PROJECTS_SUCCESS
} from '../config/constants'
import { toastFailure } from '../util/toaster'

const initialState = {
  activeProjectId: -1,
  isLoading: false,
  projects: [],
  taasProjects: [],
  isLoadProjectsSuccess: false
}

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_ACTIVE_PROJECT:
      return { ...state, activeProjectId: action.projectId, projects: [], isLoading: false, isLoadProjectsSuccess: false }
    case LOAD_PROJECTS_SUCCESS:
      return {
        ...state,
        projects: _.filter(action.projects, p => p.type !== 'talent-as-a-service'),
        taasProjects: _.filter(action.projects, {
          type: 'talent-as-a-service'
        }),
        isLoading: false,
        isLoggedIn: true,
        isLoadProjectsSuccess: true
      }
    case UNLOAD_PROJECTS_SUCCESS:
      return { ...state, projects: [], isLoading: false, isLoggedIn: true, isLoadProjectsSuccess: false }
    case LOAD_PROJECTS_PENDING:
      return { ...state, isLoading: true }
    case LOAD_PROJECTS_FAILURE: {
      const errorMessage = _.get(
        action.payload,
        'response.data.message',
        'Failed to load projects'
      )
      toastFailure('Error', errorMessage)
      return { ...state, isLoading: false }
    }
    case RESET_SIDEBAR_ACTIVE_PARAMS:
      return { ...state, activeProjectId: -1 }
    default:
      return state
  }
}
