/**
 * Reducer to process authentication actions
 */
import { LOAD_USER_SUCCESS, SAVE_AUTH_TOKEN } from '../config/constants'

const initialState = {
  isLoading: true,
  isLoggedIn: false,
  user: null,
  token: null
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
      return { ...state, user: action.user, isLoading: false, isLoggedIn: true }
    case SAVE_AUTH_TOKEN:
      return { ...state, token: action.token }
    default:
      return state
  }
}
