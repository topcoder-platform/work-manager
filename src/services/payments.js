import { axiosInstance } from './axiosWithAuth'
import { TC_FINANCE_API_URL } from '../config/constants'

/**
 * Api request for creating a payment
 * @param {Object} paymentData
 * @returns {Promise<*>}
 */
export function createPayment (paymentData) {
  return axiosInstance.post(`${TC_FINANCE_API_URL}/winnings`, paymentData)
}

/**
 * Api request for fetching payments by assignment id
 * @param {String|Number} assignmentId
 * @returns {Promise<*>}
 */
export function getPaymentsByAssignmentId (assignmentId) {
  return axiosInstance.get(`${TC_FINANCE_API_URL}/winnings/by-external-id/${assignmentId}`)
}
