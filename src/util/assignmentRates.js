/**
 * Parses a positive numeric input value.
 *
 * @param {string|number|null|undefined} value Input value from assignment forms.
 * @returns {number|null} Parsed positive number, or `null` when the value is
 * empty or invalid.
 */
export const toPositiveNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/**
 * Parses a positive integer input value.
 *
 * @param {string|number|null|undefined} value Input value from assignment forms.
 * @returns {number|null} Parsed positive integer, or `null` when the value is
 * empty or invalid.
 */
export const toPositiveInteger = (value) => {
  const parsed = toPositiveNumber(value)
  return Number.isInteger(parsed) ? parsed : null
}

/**
 * Parses a positive numeric input value that may include at most the supplied
 * number of decimal places.
 *
 * @param {string|number|null|undefined} value Input value from assignment forms.
 * @param {number} maxDecimalPlaces Maximum supported decimal places.
 * @returns {number|null} Parsed positive number, or `null` when the value is
 * empty, invalid, or exceeds the supported decimal precision.
 */
export const toPositiveNumberWithMaxDecimalPlaces = (value, maxDecimalPlaces) => {
  const parsed = toPositiveNumber(value)
  if (parsed === null) {
    return null
  }

  const normalized = typeof value === 'string' ? value.trim() : String(value)
  if (!normalized || /e/i.test(normalized)) {
    return null
  }

  const [, decimalPart = ''] = normalized.replace(/^\+/, '').split('.')
  return decimalPart.length <= maxDecimalPlaces ? parsed : null
}

/**
 * Removes non-numeric characters from assignment form input while preserving a
 * single decimal separator.
 *
 * @param {string|number|null|undefined} value Raw input field value.
 * @param {number|null|undefined} maxDecimalPlaces Optional decimal precision
 * limit applied to the sanitized decimal part.
 * @returns {string} Sanitized numeric string suitable for controlled inputs.
 */
export const sanitizePositiveNumericInput = (value, maxDecimalPlaces) => {
  if (value == null) {
    return ''
  }

  const numeric = String(value).replace(/[^0-9.]/g, '')
  const firstDecimalIndex = numeric.indexOf('.')

  if (firstDecimalIndex === -1) {
    return numeric
  }

  const decimalPart = numeric
    .slice(firstDecimalIndex + 1)
    .replace(/\./g, '')
  const truncatedDecimalPart = maxDecimalPlaces == null
    ? decimalPart
    : decimalPart.slice(0, maxDecimalPlaces)

  return `${numeric.slice(0, firstDecimalIndex + 1)}${truncatedDecimalPart}`
}

/**
 * Calculates the assignment rate per week from hourly rate and standard hours.
 *
 * @param {string|number|null|undefined} ratePerHour Hourly assignment rate.
 * @param {string|number|null|undefined} standardHoursPerWeek Weekly standard
 * hours.
 * @returns {string} Weekly assignment rate with two decimal places, or an empty
 * string when the inputs are incomplete or invalid.
 */
export const calculateAssignmentRatePerWeek = (ratePerHour, standardHoursPerWeek) => {
  const parsedRatePerHour = toPositiveNumber(ratePerHour)
  const parsedStandardHoursPerWeek = toPositiveNumberWithMaxDecimalPlaces(
    standardHoursPerWeek,
    2
  )

  if (parsedRatePerHour === null || parsedStandardHoursPerWeek === null) {
    return ''
  }

  return (parsedRatePerHour * parsedStandardHoursPerWeek).toFixed(2)
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

/**
 * Formats assignment currency values with two decimal places.
 *
 * @param {string|number|null|undefined} value Currency value to display.
 * @returns {string} USD currency string, or an empty string when the value is
 * missing.
 */
export const formatAssignmentCurrency = (value) => {
  if (value == null || value === '') {
    return ''
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return String(value)
  }

  return currencyFormatter.format(parsed)
}
