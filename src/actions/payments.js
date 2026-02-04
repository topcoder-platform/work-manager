import { createPayment, getPaymentsByAssignmentId } from '../services/payments'
import {
  CREATE_PAYMENT_PENDING,
  CREATE_PAYMENT_SUCCESS,
  CREATE_PAYMENT_FAILURE,
  FETCH_ASSIGNMENT_PAYMENTS_PENDING,
  FETCH_ASSIGNMENT_PAYMENTS_SUCCESS,
  FETCH_ASSIGNMENT_PAYMENTS_FAILURE
} from '../config/constants'

const ENGAGEMENT_PAYMENT_STATUS = 'ON_HOLD_ADMIN'

/**
 * Creates a payment for a member
 * @param {String|Number} assignmentId
 * @param {String|Number} memberId
 * @param {String} memberHandle
 * @param {String} paymentTitle
 * @param {String} remarks
 * @param {String|Number} agreementRate
 * @param {String|Number} amount
 * @param {String|Number} billingAccountId
 * @param {String} paymentStatus
 */
export function createMemberPayment (
  assignmentId,
  memberId,
  memberHandle,
  paymentTitle,
  remarks,
  agreementRate,
  amount,
  billingAccountId,
  paymentStatus = ENGAGEMENT_PAYMENT_STATUS
) {
  return async (dispatch) => {
    dispatch({
      type: CREATE_PAYMENT_PENDING
    })

    const parsedAmount = Number(amount)
    const trimmedTitle = typeof paymentTitle === 'string'
      ? paymentTitle.trim()
      : (paymentTitle != null ? String(paymentTitle) : '')
    const trimmedRemarks = typeof remarks === 'string' ? remarks.trim() : ''
    const attributes = {
      memberHandle,
      assignmentId,
      remarks: trimmedRemarks
    }
    if (agreementRate !== null && agreementRate !== undefined && agreementRate !== '') {
      attributes.agreementRate = agreementRate
    }
    const payload = {
      winnerId: String(memberId),
      type: 'PAYMENT',
      origin: 'Topcoder',
      category: 'ENGAGEMENT_PAYMENT',
      title: trimmedTitle,
      description: trimmedTitle,
      externalId: String(assignmentId),
      attributes,
      ...(paymentStatus ? { status: paymentStatus } : {}),
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
