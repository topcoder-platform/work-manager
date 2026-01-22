import { configureConnector, decodeToken } from 'tc-auth-lib'
import { fetchProfile } from '../services/user'
import {
  LOAD_USER_SUCCESS,
  SAVE_AUTH_TOKEN,
  ADMIN_ROLES,
  MANAGER_ROLES,
  TASK_MANAGER_ROLES
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

const normalizeRoles = (roles) => (Array.isArray(roles) ? roles : [])

const getRoleFlags = (roles) => {
  const normalizedRoles = normalizeRoles(roles)
  const normalizedRolesLower = normalizedRoles.map((role) => `${role}`.toLowerCase())
  const hasRole = (roleList) => normalizedRolesLower.some((role) => roleList.includes(role))

  return {
    roles: normalizedRoles,
    isAdmin: hasRole(ADMIN_ROLES),
    isManager: hasRole(MANAGER_ROLES),
    isTaskManager: hasRole(TASK_MANAGER_ROLES)
  }
}

/**
 * Load user profile
 * @returns {Function}
 */
export function loadUser () {
  return async (dispatch, getState) => {
    if (!getState().auth.user) {
      const token = getState().auth.token
      if (token) {
        const tokenData = decodeToken(token)
        const { handle } = tokenData
        const roleFlags = getRoleFlags(tokenData.roles)
        fetchProfile(handle).then(user => {
          dispatch({
            type: LOAD_USER_SUCCESS,
            user,
            ...roleFlags
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
    const tokenData = decodeToken(token)
    const roleFlags = getRoleFlags(tokenData.roles)
    dispatch({
      type: SAVE_AUTH_TOKEN,
      token,
      ...roleFlags
    })
    dispatch(loadUser())
  }
}
