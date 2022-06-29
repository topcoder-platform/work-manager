import { fetchCustomerPaymentById, refundPaymentById } from '../services/customerPayments'

export const getCustomerPaymentById = (id) => {
  return (dispatch) => {
    return fetchCustomerPaymentById(id)
  }
}

export const refundPayment = (paymentIntent) => {
  return (dispatch) => {
    return refundPaymentById(paymentIntent)
  }
}
