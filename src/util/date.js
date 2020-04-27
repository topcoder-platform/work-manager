/**
 * Provides date related utility methods
 */
import moment from 'moment'
import 'moment-duration-format'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

/**
 * Find Max Date
 * @param dates array
 * @returns max Date
 */
export const getLastDate = (dates) => {
  return Math.max(...dates)
}

/**
 * Formats duration
 * @param duration Duration
 * @returns formatted duration
 */
export const getFormattedDuration = (duration) => {
  let format
  if (duration > DAY_MS) format = 'D[d] H[h]'
  else if (duration > HOUR_MS) format = 'H[h] m[min]'
  else format = 'm[min] s[s]'

  return moment.duration(duration).format(format)
}

/**
 * Round formats duration
 * @param duration Duration
 * @returns Round formatted duration
 */
export const getRoundFormattedDuration = (duration) => {
  let format
  if (duration > DAY_MS) format = 'D[d]'
  else format = 'H[h]'
  return moment.duration(duration).format(format)
}
