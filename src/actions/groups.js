import _ from 'lodash'
import {
  bulkSearchMembers as bulkSearchMembersAPI,
  bulkCreateGroup as bulkCreateGroupAPI
} from '../services/groups'
import {
  BULK_SEARCH_MEMBERS_PENDING,
  BULK_SEARCH_MEMBERS_PROGRESS,
  BULK_SEARCH_MEMBERS_SUCCESS,
  BULK_SEARCH_MEMBERS_FAILURE,
  BULK_SEARCH_MEMBERS_CHUNK_SIZE,
  BULK_CREATE_GROUP_PENDING,
  BULK_CREATE_GROUP_SUCCESS,
  BULK_CREATE_GROUP_FAILURE,
  RESET_GROUPS_STATE
} from '../config/constants'
import { toastFailure } from '../util/toaster'

const getApiErrorMessage = (error, fallbackMessage) => {
  if (!error) {
    return fallbackMessage
  }

  const responseData = _.get(error, 'response.data')
  const status = _.get(error, 'response.status')
  const statusText = _.get(error, 'response.statusText')
  const errorList = _.get(responseData, 'errors')
  let message = _.get(responseData, 'message') ||
    _.get(responseData, 'error') ||
    _.get(responseData, 'details') ||
    _.get(responseData, 'description') ||
    _.get(responseData, 'title')

  if (!message && Array.isArray(errorList) && errorList.length > 0) {
    const firstError = errorList[0]
    if (typeof firstError === 'string') {
      message = firstError
    } else {
      message = _.get(firstError, 'message') || _.get(firstError, 'detail')
    }
  }

  if (!message && _.isString(responseData)) {
    message = responseData
  }

  if (!message) {
    message = error.message || error.toString()
  }

  if (!message || message === '[object Object]') {
    message = fallbackMessage
  }

  if (status) {
    const statusLabel = statusText ? `${status} ${statusText}` : status
    return `${message} (HTTP ${statusLabel})`
  }

  return message
}

const normalizeValidationResults = (response) => {
  if (Array.isArray(response)) {
    return response
  }

  if (response && Array.isArray(response.results)) {
    return response.results
  }

  return []
}

/**
 * Bulk search members by handles/emails.
 * @param {Array<string>} identifiers
 */
export function bulkSearchMembers (identifiers) {
  return async (dispatch) => {
    dispatch({
      type: BULK_SEARCH_MEMBERS_PENDING
    })

    const validationResults = []

    try {
      const chunks = _.chunk(identifiers, BULK_SEARCH_MEMBERS_CHUNK_SIZE)

      if (chunks.length === 0) {
        dispatch({
          type: BULK_SEARCH_MEMBERS_SUCCESS,
          validationResults
        })
        return validationResults
      }

      for (let index = 0; index < chunks.length; index += 1) {
        const response = await bulkSearchMembersAPI(chunks[index])
        const chunkResults = normalizeValidationResults(response)
        validationResults.push(...chunkResults)
        dispatch({
          type: BULK_SEARCH_MEMBERS_PROGRESS,
          validationResults: [...validationResults],
          chunkIndex: index,
          chunkCount: chunks.length
        })
      }

      dispatch({
        type: BULK_SEARCH_MEMBERS_SUCCESS,
        validationResults
      })
      return validationResults
    } catch (error) {
      const errorDetails = getApiErrorMessage(error, 'Unable to validate members.')
      toastFailure('Member search failed', errorDetails)
      dispatch({
        type: BULK_SEARCH_MEMBERS_FAILURE,
        error: errorDetails,
        validationResults
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
 * @param {boolean} selfRegister
 * @param {boolean} privateGroup
 */
export function bulkCreateGroup (name, description, userIds, selfRegister = false, privateGroup = true) {
  return async (dispatch) => {
    dispatch({
      type: BULK_CREATE_GROUP_PENDING
    })

    try {
      const createdGroup = await bulkCreateGroupAPI({
        name,
        description,
        userIds,
        selfRegister,
        privateGroup
      })
      dispatch({
        type: BULK_CREATE_GROUP_SUCCESS,
        createdGroup
      })
      return createdGroup
    } catch (error) {
      const errorDetails = getApiErrorMessage(error, 'Unable to create group.')
      toastFailure('Group creation failed', errorDetails)
      dispatch({
        type: BULK_CREATE_GROUP_FAILURE,
        error: errorDetails
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
