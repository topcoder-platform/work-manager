/**
 * Reducer to process payment actions
 */
import _ from 'lodash'
import { toastSuccess, toastFailure } from '../util/toaster'
import {
  CREATE_PAYMENT_PENDING,
  CREATE_PAYMENT_SUCCESS,
  CREATE_PAYMENT_FAILURE
} from '../config/constants'

const initialState = {
  isProcessing: false,
  lastPayment: null,
  errorMessage: ''
}

const getErrorMessage = (action) => _.get(action, 'error.response.data.message', 'Failed to create payment')

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
    default:
      return state
  }
}
