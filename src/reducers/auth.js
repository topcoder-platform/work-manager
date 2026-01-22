/**
 * Reducer to process authentication actions
 */
import { LOAD_USER_SUCCESS, SAVE_AUTH_TOKEN } from '../config/constants'

const initialState = {
  isLoading: true,
  isLoggedIn: false,
  user: null,
  token: null,
  roles: [],
  isAdmin: false,
  isManager: false,
  isTaskManager: false
}

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_USER_SUCCESS:
      try {
        window.analytics.identify('', {
          username: action.user.handle,
          id: action.user.userId
        })
      } catch (e) {
        // ignore
      }
      return {
        ...state,
        user: action.user,
        isLoading: false,
        isLoggedIn: true,
        roles: Array.isArray(action.roles) ? action.roles : state.roles,
        isAdmin: typeof action.isAdmin === 'boolean' ? action.isAdmin : state.isAdmin,
        isManager: typeof action.isManager === 'boolean' ? action.isManager : state.isManager,
        isTaskManager: typeof action.isTaskManager === 'boolean' ? action.isTaskManager : state.isTaskManager
      }
    case SAVE_AUTH_TOKEN:
      return {
        ...state,
        token: action.token,
        roles: Array.isArray(action.roles) ? action.roles : state.roles,
        isAdmin: typeof action.isAdmin === 'boolean' ? action.isAdmin : state.isAdmin,
        isManager: typeof action.isManager === 'boolean' ? action.isManager : state.isManager,
        isTaskManager: typeof action.isTaskManager === 'boolean' ? action.isTaskManager : state.isTaskManager
      }
    default:
      return state
  }
}
