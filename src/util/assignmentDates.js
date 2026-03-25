import moment from 'moment-timezone'

const ASSIGNMENT_DATE_FORMAT = 'YYYY-MM-DD'
const ASSIGNMENT_CANONICAL_UTC_HOUR = 12

/**
 * Builds a stable local Date object for the supplied assignment calendar date.
 *
 * @param {string} assignmentDate Calendar date in YYYY-MM-DD format.
 * @returns {Date|null} Local Date value suitable for DateInput rendering.
 */
const createLocalAssignmentDate = (assignmentDate) => {
  const parsedDate = moment(assignmentDate, ASSIGNMENT_DATE_FORMAT, true)
  if (!parsedDate.isValid()) {
    return null
  }

  return moment({
    year: parsedDate.year(),
    month: parsedDate.month(),
    date: parsedDate.date(),
    hour: ASSIGNMENT_CANONICAL_UTC_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0
  }).toDate()
}

/**
 * Serializes a user-selected assignment date into the canonical API format.
 *
 * @param {string|Date|Object|null|undefined} value Assignment date value from the UI.
 * @returns {string|null} Canonical ISO timestamp stored for the assignment date.
 */
export const serializeTentativeAssignmentDate = (value) => {
  if (!value) {
    return null
  }

  const parsed = moment(value)
  if (!parsed.isValid()) {
    return null
  }

  const assignmentDate = parsed.format(ASSIGNMENT_DATE_FORMAT)
  return moment
    .utc(assignmentDate, ASSIGNMENT_DATE_FORMAT)
    .hour(ASSIGNMENT_CANONICAL_UTC_HOUR)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toISOString()
}

/**
 * Converts a stored assignment date into a DateInput-friendly local Date value.
 *
 * @param {string|Date|Object|null|undefined} value Assignment date from persisted state or API data.
 * @returns {Date|string|null} Local Date when parsing succeeds, otherwise the original non-empty value.
 */
export const deserializeTentativeAssignmentDate = (value) => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null
    }

    return createLocalAssignmentDate(moment(value).format(ASSIGNMENT_DATE_FORMAT))
  }

  const parsed = moment.isMoment(value)
    ? value.clone()
    : typeof value === 'string'
      ? moment.utc(value, moment.ISO_8601, true)
      : moment(value)

  if (parsed.isValid()) {
    return createLocalAssignmentDate(parsed.format(ASSIGNMENT_DATE_FORMAT))
  }

  return typeof value === 'string' ? value.trim() || null : null
}
