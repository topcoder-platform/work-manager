import { axiosInstance } from './axiosWithAuth'
import _ from 'lodash'

const {
  CUSTOMER_PAYMENT_API_URL
} = process.env

/**
 * Api request for fetching challenge types
 * @returns {Promise<*>}
 */
export async function fetchCustomerPaymentById (id) {
  const response = await axiosInstance.get(`${CUSTOMER_PAYMENT_API_URL}/${id}`)
  return _.get(response, 'data', [])
}

export async function refundPaymentById (id) {
  const response = await axiosInstance.patch(`${CUSTOMER_PAYMENT_API_URL}/${id}/refund`)
  return _.get(response, 'data', [])
}
