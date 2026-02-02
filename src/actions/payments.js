import { createPayment, getPaymentsByAssignmentId } from '../services/payments'
import {
  CREATE_PAYMENT_PENDING,
  CREATE_PAYMENT_SUCCESS,
  CREATE_PAYMENT_FAILURE,
  FETCH_ASSIGNMENT_PAYMENTS_PENDING,
  FETCH_ASSIGNMENT_PAYMENTS_SUCCESS,
  FETCH_ASSIGNMENT_PAYMENTS_FAILURE
} from '../config/constants'

/**
 * Creates a payment for a member
 * @param {String|Number} assignmentId
 * @param {String|Number} memberId
 * @param {String} memberHandle
 * @param {String} paymentTitle
 * @param {String} description
 * @param {String|Number} amount
 * @param {String|Number} billingAccountId
 */
export function createMemberPayment (
  assignmentId,
  memberId,
  memberHandle,
  paymentTitle,
  description,
  amount,
  billingAccountId
) {
  return async (dispatch) => {
    dispatch({
      type: CREATE_PAYMENT_PENDING
    })

    const parsedAmount = Number(amount)
    const trimmedDescription = typeof description === 'string' ? description.trim() : ''
    const payload = {
      winnerId: String(memberId),
      type: 'PAYMENT',
      origin: 'Topcoder',
      category: 'ENGAGEMENT_PAYMENT',
      title: paymentTitle,
      description: trimmedDescription,
      externalId: String(assignmentId),
      attributes: {
        memberHandle,
        assignmentId
      },
      details: [
        {
          totalAmount: parsedAmount,
          grossAmount: parsedAmount,
          installmentNumber: 1,
          currency: 'USD',
          billingAccount: String(billingAccountId),
          challengeFee: 0
        }
      ]
    }

    try {
      const response = await createPayment(payload)
      dispatch({
        type: CREATE_PAYMENT_SUCCESS,
        payment: response.data,
        assignmentId
      })
      return response
    } catch (error) {
      dispatch({
        type: CREATE_PAYMENT_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Fetch payments for a specific assignment.
 * @param {String|Number} assignmentId
 */
export function fetchAssignmentPayments (assignmentId) {
  return async (dispatch) => {
    dispatch({
      type: FETCH_ASSIGNMENT_PAYMENTS_PENDING,
      assignmentId
    })

    try {
      const response = await getPaymentsByAssignmentId(assignmentId)
      const payments = response && response.data && response.data.data
        ? response.data.data
        : response.data
      dispatch({
        type: FETCH_ASSIGNMENT_PAYMENTS_SUCCESS,
        assignmentId,
        payments
      })
      return response
    } catch (error) {
      dispatch({
        type: FETCH_ASSIGNMENT_PAYMENTS_FAILURE,
        assignmentId,
        error
      })
      return Promise.reject(error)
    }
  }
}
