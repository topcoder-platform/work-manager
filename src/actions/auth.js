import { configureConnector, decodeToken } from 'tc-auth-lib'
import { fetchProfileV5 } from '../services/user'
import {
  LOAD_USER_SUCCESS,
  SAVE_AUTH_TOKEN
} from '../config/constants'

const { ACCOUNTS_APP_CONNECTOR_URL } = process.env

/**
 * Authentication and user related redux actions
 */

// Creates an iframe on the page for handling authentication
configureConnector({
  connectorUrl: ACCOUNTS_APP_CONNECTOR_URL,
  frameId: 'tc-accounts-iframe'
})

/**
 * Load user profile
 * @returns {Function}
 */
export function loadUser () {
  return async (dispatch, getState) => {
    if (!getState().auth.user) {
      if (getState().auth.token) {
        const { handle } = decodeToken(getState().auth.token)
        fetchProfileV5(handle).then(user => {
          dispatch({
            type: LOAD_USER_SUCCESS,
            user
          })
        })
      }
    }
  }
}

/**
 * Save token in redux store
 * @param token authentication token
 * @returns {Function}
 */
export function saveToken (token) {
  return (dispatch) => {
    dispatch({
      type: SAVE_AUTH_TOKEN,
      token
    })
    const { handle } = decodeToken(token)
    dispatch(loadUser(handle))
  }
}
