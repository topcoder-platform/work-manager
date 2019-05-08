/**
 * Provides date related utility methods
 */
import moment from 'moment'
import 'moment-duration-format'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export const getLastDate = (dates) => {
  return Math.max(...dates)
}

export const getFormattedDuration = (duration) => {
  let format
  if (duration > DAY_MS) format = 'D[d] H[h]'
  else if (duration > HOUR_MS) format = 'H[h] m[min]'
  else format = 'm[min] s[s]'

  return moment.duration(duration).format(format)
}

export const getRoundFormattedDuration = (duration) => {
  let format
  if (duration > DAY_MS) format = 'D[d]'
  else format = 'H[h]'
  return moment.duration(duration).format(format)
}
