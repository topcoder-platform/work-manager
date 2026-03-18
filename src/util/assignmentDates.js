import moment from 'moment-timezone'

const ASSIGNMENT_DATE_FORMAT = 'YYYY-MM-DD'
const ASSIGNMENT_CANONICAL_UTC_HOUR = 12

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
