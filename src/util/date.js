/**
 * Provides date related utility methods
 */
import moment from 'moment'
import _ from 'lodash'
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
 * Convert challenge phases from seconds to hours
 * @param {Array} phases challenge phares
 */
export const convertChallengePhaseFromSecondsToHours = (phases) => {
  if (phases) {
    const hourToSecond = 60 * 60
    _.forEach(phases, (p) => {
      p.duration = Math.round(p.duration / hourToSecond)
    })
  }
}

/**
 * Convert challenge phase from hours to second and remove unnessesary field
 * @param {Object} challengeDetail challenge detail
 */
export const updateChallengePhaseBeforeSendRequest = (challengeDetail) => {
  const hourToSecond = 60 * 60
  if (challengeDetail.phases) {
    challengeDetail.phases = challengeDetail.phases.map((p) => ({
      duration: p.duration * hourToSecond,
      phaseId: p.phaseId
    }))
  }
  return challengeDetail
}
