/**
 * Reducer to process payment actions
 */
import _ from 'lodash'
import { toastSuccess, toastFailure } from '../util/toaster'
import {
  CREATE_PAYMENT_PENDING,
  CREATE_PAYMENT_SUCCESS,
  CREATE_PAYMENT_FAILURE,
  FETCH_ASSIGNMENT_PAYMENTS_PENDING,
  FETCH_ASSIGNMENT_PAYMENTS_SUCCESS,
  FETCH_ASSIGNMENT_PAYMENTS_FAILURE
} from '../config/constants'

const initialState = {
  isProcessing: false,
  lastPayment: null,
  errorMessage: '',
  paymentsByAssignment: {}
}

const getErrorMessage = (action) => _.get(action, 'error.response.data.message', 'Failed to create payment')
const getFetchErrorMessage = (action) => _.get(action, 'error.response.data.message', 'Failed to load payments')

export default function (state = initialState, action) {
  switch (action.type) {
    case CREATE_PAYMENT_PENDING:
      return {
        ...state,
        isProcessing: true,
        errorMessage: ''
      }
    case CREATE_PAYMENT_SUCCESS:
      toastSuccess('Success', 'Payment created successfully')
      return {
        ...state,
        isProcessing: false,
        lastPayment: action.payment || null,
        errorMessage: ''
      }
    case CREATE_PAYMENT_FAILURE: {
      const errorMessage = getErrorMessage(action)
      toastFailure('Error', errorMessage)
      return {
        ...state,
        isProcessing: false,
        errorMessage
      }
    }
    case FETCH_ASSIGNMENT_PAYMENTS_PENDING: {
      const assignmentId = action.assignmentId
      if (_.isNil(assignmentId)) {
        return state
      }
      const currentEntry = state.paymentsByAssignment[assignmentId] || {}
      return {
        ...state,
        paymentsByAssignment: {
          ...state.paymentsByAssignment,
          [assignmentId]: {
            ...currentEntry,
            isLoading: true,
            error: ''
          }
        }
      }
    }
    case FETCH_ASSIGNMENT_PAYMENTS_SUCCESS: {
      const assignmentId = action.assignmentId
      if (_.isNil(assignmentId)) {
        return state
      }
      return {
        ...state,
        paymentsByAssignment: {
          ...state.paymentsByAssignment,
          [assignmentId]: {
            isLoading: false,
            payments: Array.isArray(action.payments) ? action.payments : [],
            error: ''
          }
        }
      }
    }
    case FETCH_ASSIGNMENT_PAYMENTS_FAILURE: {
      const assignmentId = action.assignmentId
      if (_.isNil(assignmentId)) {
        return state
      }
      const errorMessage = getFetchErrorMessage(action)
      const currentEntry = state.paymentsByAssignment[assignmentId] || {}
      return {
        ...state,
        paymentsByAssignment: {
          ...state.paymentsByAssignment,
          [assignmentId]: {
            ...currentEntry,
            isLoading: false,
            error: errorMessage
          }
        }
      }
    }
    default:
      return state
  }
}
