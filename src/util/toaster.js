import { toastr } from 'react-redux-toastr'

/**
 * Show error toast
 * @param {string} title
 * @param {string} message
 */
export const toastFailure = (title, message) => {
  setImmediate(() => {
    toastr.error(title, message)
  })
}

/**
 * Show success toast
 * @param {string} title
 * @param {string} message
 */
export const toastSuccess = (title, message) => {
  setImmediate(() => {
    toastr.success(title, message)
  })
}
