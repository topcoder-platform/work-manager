export const CAPACITY_LIMIT_ERROR_MESSAGE = 'Maximum number of members already assigned'

/**
 * Checks whether an API error matches the known assignment-capacity limit case.
 *
 * @param {string} message API error message.
 * @param {number|string} status HTTP status code when available.
 * @returns {boolean} True when the error is the capacity-limit message.
 */
export const isCapacityLimitError = (message, status) => {
  if (status !== undefined && status !== null && Number(status) !== 400) {
    return false
  }

  if (typeof message !== 'string') {
    return false
  }

  const normalizedMessage = message.trim().replace(/\s+/g, ' ').toLowerCase()
  const normalizedCapacityMessage = CAPACITY_LIMIT_ERROR_MESSAGE.toLowerCase()

  return normalizedMessage === normalizedCapacityMessage
}
