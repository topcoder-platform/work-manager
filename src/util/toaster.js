import { toastr } from 'react-redux-toastr'

/**
 * Show error toast
 * @param {string} title
 * @param {string} message
 */
export const toastFailure = (title, message) => {
  setTimeout(() => {
    toastr.error(title, message)
  }, 0)
}

/**
 * Show success toast
 * @param {string} title
 * @param {string} message
 */
export const toastSuccess = (title, message) => {
  setTimeout(() => {
    toastr.success(title, message)
  }, 0)
}
