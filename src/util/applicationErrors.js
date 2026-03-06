export const CAPACITY_LIMIT_ERROR_MESSAGE = 'Maximum number of members already assigned'
const CAPACITY_LIMIT_ERROR_MESSAGE_PATTERNS = [
  CAPACITY_LIMIT_ERROR_MESSAGE,
  'Maximum number of members already assigned to this engagement',
  'Assigned member count exceeds required member count.'
]

/**
 * Normalizes API error message payloads into a single string so capacity-limit
 * checks can support both string and string-array responses.
 *
 * @param {string|Array<string>} message API error message payload.
 * @returns {string} Normalized message text.
 */
const normalizeCapacityErrorMessage = (message) => {
  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message)) {
    return message
      .map((entry) => (entry == null ? '' : String(entry)))
      .filter(Boolean)
      .join(' ')
  }

  return ''
}

/**
 * Checks whether an API error matches the known assignment-capacity limit case.
 *
 * @param {string|Array<string>} message API error message.
 * @param {number|string} status HTTP status code when available.
 * @returns {boolean} True when the error is the capacity-limit message.
 */
export const isCapacityLimitError = (message, status) => {
  if (status !== undefined && status !== null && Number(status) !== 400) {
    return false
  }

  const rawMessage = normalizeCapacityErrorMessage(message)
  if (!rawMessage) {
    return false
  }

  const normalizedMessage = rawMessage.trim().replace(/\s+/g, ' ').toLowerCase()
  if (!normalizedMessage) {
    return false
  }

  const normalizedPatterns = CAPACITY_LIMIT_ERROR_MESSAGE_PATTERNS
    .map(pattern => pattern.toLowerCase())

  if (normalizedPatterns.some(pattern => normalizedMessage === pattern)) {
    return true
  }

  if (normalizedMessage.includes('maximum number of members already assigned')) {
    return true
  }

  return normalizedMessage.includes('required members') &&
    normalizedMessage.includes('select') &&
    normalizedMessage.includes('member')
}
