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
 * Calculates the assignment rate per week from hourly rate and standard hours.
 *
 * @param {string|number|null|undefined} ratePerHour Hourly assignment rate.
 * @param {string|number|null|undefined} standardHoursPerWeek Weekly standard
 * hours.
 * @returns {string} Weekly assignment rate with trailing zeroes trimmed, or an
 * empty string when the inputs are incomplete or invalid.
 */
export const calculateAssignmentRatePerWeek = (ratePerHour, standardHoursPerWeek) => {
  const parsedRatePerHour = toPositiveNumber(ratePerHour)
  const parsedStandardHoursPerWeek = toPositiveInteger(standardHoursPerWeek)

  if (parsedRatePerHour === null || parsedStandardHoursPerWeek === null) {
    return ''
  }

  return Number(
    (parsedRatePerHour * parsedStandardHoursPerWeek).toFixed(2)
  ).toString()
}
