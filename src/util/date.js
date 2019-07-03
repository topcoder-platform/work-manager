/**
 * Provides date related utility methods
 */
import _ from 'lodash'
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

/**
 * Get phase end date
 * @param index  the phase index
 * @param challenge the challenge data
 * @returns {moment.Moment}
 */
export const getPhaseEndDate = (index, challenge) => {
  const map = {}
  const alreadyCalculated = {}
  _.each(challenge.phases, p => { map[p.id] = p.duration })
  const finalDate = moment(challenge.startDate)
  finalDate.add(challenge.phases[index].duration, 'hours')

  if (!challenge.phases[index].predecessor) {
    return finalDate
  }

  for (let i = index; i >= 0; i -= 1) {
    const { predecessor } = challenge.phases[i]
    if (predecessor) {
      if (!alreadyCalculated[predecessor]) {
        alreadyCalculated[predecessor] = true
        finalDate.add(map[predecessor], 'hours')
      }
    }
  }

  return finalDate
}
