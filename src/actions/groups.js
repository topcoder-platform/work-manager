import {
  bulkSearchMembers as bulkSearchMembersAPI,
  bulkCreateGroup as bulkCreateGroupAPI
} from '../services/groups'
import {
  BULK_SEARCH_MEMBERS_PENDING,
  BULK_SEARCH_MEMBERS_SUCCESS,
  BULK_SEARCH_MEMBERS_FAILURE,
  BULK_CREATE_GROUP_PENDING,
  BULK_CREATE_GROUP_SUCCESS,
  BULK_CREATE_GROUP_FAILURE,
  RESET_GROUPS_STATE
} from '../config/constants'
import { toastFailure } from '../util/toaster'

/**
 * Bulk search members by handles/emails.
 * @param {Array<string>} identifiers
 */
export function bulkSearchMembers (identifiers) {
  return async (dispatch) => {
    dispatch({
      type: BULK_SEARCH_MEMBERS_PENDING
    })

    try {
      const validationResults = await bulkSearchMembersAPI(identifiers)
      dispatch({
        type: BULK_SEARCH_MEMBERS_SUCCESS,
        validationResults
      })
      return validationResults
    } catch (error) {
      const errorDetails = (error && (error.message || error.toString())) || 'Unknown error'
      toastFailure('Member search failed', errorDetails)
      dispatch({
        type: BULK_SEARCH_MEMBERS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Bulk create a group.
 * @param {String} name
 * @param {String} description
 * @param {Array<string|number>} userIds
 */
export function bulkCreateGroup (name, description, userIds) {
  return async (dispatch) => {
    dispatch({
      type: BULK_CREATE_GROUP_PENDING
    })

    try {
      const createdGroup = await bulkCreateGroupAPI({ name, description, userIds })
      dispatch({
        type: BULK_CREATE_GROUP_SUCCESS,
        createdGroup
      })
      return createdGroup
    } catch (error) {
      const errorDetails = (error && (error.message || error.toString())) || 'Unknown error'
      toastFailure('Group creation failed', errorDetails)
      dispatch({
        type: BULK_CREATE_GROUP_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Reset groups-related state.
 */
export function resetGroupsState () {
  return (dispatch) => {
    dispatch({
      type: RESET_GROUPS_STATE
    })
  }
}
