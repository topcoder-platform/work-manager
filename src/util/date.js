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
 * @param getChallengePhase a function to get the challenge phase from the metadata for the specified phase
 * @returns {moment.Moment}
 */
export const getPhaseEndDate = (index, challenge, getChallengePhase) => {
  const map = {}
  const alreadyCalculated = {}
  _.each(challenge.phases, p => {
    if (p) {
      const phase = getChallengePhase(p)
      if (phase) map[phase.id] = phase.duration
    }
  })
  const finalDate = moment(challenge.startDate)
  const phase = challenge.phases[index] && getChallengePhase(challenge.phases[index])
  if (phase) {
    finalDate.add(phase.duration, 'hours')
    if (!phase.predecessor) {
      return finalDate
    }
  }

  for (let i = index; i >= 0 && challenge.phases[i]; i -= 1) {
    const challengePhase = getChallengePhase(challenge.phases[i])
    const predecessor = challengePhase && challengePhase.predecessor
    if (predecessor) {
      if (!alreadyCalculated[predecessor]) {
        alreadyCalculated[predecessor] = true
        finalDate.add(map[predecessor], 'hours')
      }
    }
  }

  return finalDate
}
