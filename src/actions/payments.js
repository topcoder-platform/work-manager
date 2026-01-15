import { createPayment } from '../services/payments'
import {
  CREATE_PAYMENT_PENDING,
  CREATE_PAYMENT_SUCCESS,
  CREATE_PAYMENT_FAILURE
} from '../config/constants'

/**
 * Creates a payment for a member
 * @param {String|Number} engagementId
 * @param {String|Number} memberId
 * @param {String} memberHandle
 * @param {String} paymentTitle
 * @param {String|Number} amount
 * @param {String|Number} billingAccountId
 */
export function createMemberPayment (
  engagementId,
  memberId,
  memberHandle,
  paymentTitle,
  amount,
  billingAccountId
) {
  return async (dispatch) => {
    dispatch({
      type: CREATE_PAYMENT_PENDING
    })

    const parsedAmount = Number(amount)
    const payload = {
      winnerId: memberId,
      type: 'ENGAGEMENT',
      origin: 'work-manager',
      category: 'ENGAGEMENT_PAYMENT',
      title: paymentTitle,
      description: paymentTitle,
      externalId: String(engagementId),
      attributes: {
        memberHandle,
        engagementId
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
        payment: response.data
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
