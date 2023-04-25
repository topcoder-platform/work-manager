/**
 * Provides date related utility methods
 */
import moment from 'moment'
import _ from 'lodash'
import 'moment-duration-format'
import { canChangeDuration } from './phase'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const dateFormat = 'MM/DD/YYYY HH:mm'
const minuteToSecond = 60
const minuteToMilisecond = 60 * 1000 // = 1 minute

/**
 * Find Max Date
 * @param dates array
 * @returns max Date
 */
export const getLastDate = (dates) => {
  return Math.max(...dates)
}

/**
 * Get formatted date
 * @param {Date} date date to be formatted
 * @returns formatted Date
 */
export const formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY')
}

/**
 * Get phase duration in hours and minutes
 * @param {number} phaseDuration phase duration
 * @returns Object phase duration in hours and minutes
 */
export const getPhaseHoursMinutes = (phaseDuration) => {
  if (!phaseDuration) {
    return {
      hours: 0,
      minutes: 0
    }
  }
  return {
    hours: Math.floor(phaseDuration / 60),
    minutes: phaseDuration % 60
  }
}

/**
 * Get phase end date
 * @param {Date} startDate phase start date
 * @param {Number} duration phase duration in minutes
 * @returns end date
 */
export const getPhaseEndDate = (startDate, duration) => {
  return moment(startDate).add(duration, 'minutes').format(dateFormat)
}

/**
 * Get phase end date in date
 * @param {Date} startDate phase start date
 * @param {Number} duration phase duration in minutes
 * @returns end date
 */
export const getPhaseEndDateInDate = (startDate, duration) => {
  return moment(startDate).add(duration || 0, 'minutes').toDate()
}

/**
 * Get phase duration percentate
 * @param {Number} startDateTime start date time
 * @param {Number} endDateTime end date time
 * @param {Number} duration phase duration in minutes
 * @returns percentage number
 */
export const getPhaseDurationPercentage = (startDateTime, endDateTime, duration) => {
  return Math.round(((endDateTime - startDateTime) / (minuteToMilisecond * duration)) * 100)
}

/**
 * Get phase duration in minutes
 * @param {Object} phaseHoursMinutes phase duration in hours minutes
 * @returns phase duration in minutes
 */
export const convertPhaseHoursMinutesToPhaseDuration = (phaseHoursMinutes) => {
  return (phaseHoursMinutes.hours || 0) * 60 + (phaseHoursMinutes.minutes || 0)
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
    _.forEach(phases, (p) => {
      if (canChangeDuration(p)) {
        p.duration = Math.floor(p.duration / minuteToSecond)
      } else {
        // use the same duration display as OR, as long as we aren't changing the fields that should be fine.
        const duration = moment.duration(moment(p.scheduledEndDate).diff(moment(p.scheduledStartDate)))
        p.duration = Math.ceil(duration.asMinutes())
      }
    })
  }
}

/**
 * Normalize challenge data from the format returned by API
 * to the format we use in Redux Store
 *
 * @param {Object} apiChallengeData challenge data from API
 *
 * @returns {object} challenge data in the Redux Store format
 */
export const normalizeChallengeDataFromAPI = (apiChallengeData) => {
  const normalizedChallengeData = _.cloneDeep(apiChallengeData)
  if (normalizedChallengeData.legacy) {
    if (normalizedChallengeData.legacy.track) {
      normalizedChallengeData.track = normalizedChallengeData.legacy.track.trim()
    }
    if (normalizedChallengeData.legacy.reviewType) {
      normalizedChallengeData.reviewType = normalizedChallengeData.legacy.reviewType
    }
    if (normalizedChallengeData.legacy.forumId) {
      normalizedChallengeData.forumId = normalizedChallengeData.legacy.forumId
    }
  }
  convertChallengePhaseFromSecondsToHours(normalizedChallengeData.phases)
  normalizedChallengeData.phases = sortChallengePhases(normalizedChallengeData.phases)

  return normalizedChallengeData
}

/**
 * Sorts the challenge phases in order of their supposed execution
 *
 * @param {Array} phases challenge phases that are to be sorte3d
 */
export const sortChallengePhases = (phases) => {
  return _.sortBy(phases, phase => phase.actualStartDate || phase.scheduledStartDate)
}

/**
 * Convert challenge phase from hours to second and remove unnessesary field
 * @param {Object} challengeDetail challenge detail
 */
export const updateChallengePhaseBeforeSendRequest = (challengeDetail) => {
  if (challengeDetail.phases) {
    const challengeDetailTmp = _.cloneDeep(challengeDetail)
    challengeDetailTmp.startDate = moment(challengeDetail.phases[0].scheduledStartDate)
    // challengeDetailTmp.registrationStartDate = moment(challengeDetail.phases[0].scheduledStartDate)
    // challengeDetailTmp.registrationEndDate = moment(challengeDetail.phases[0].scheduledEndDate)
    // challengeDetailTmp.submissionStartDate = moment(challengeDetail.phases[1].scheduledStartDate)
    // challengeDetailTmp.submissionEndDate = moment(challengeDetail.phases[1].scheduledEndDate)
    challengeDetailTmp.phases = challengeDetailTmp.phases.map((p) => ({
      duration: p.duration * minuteToSecond,
      phaseId: p.phaseId,
      scheduledStartDate: p.scheduledStartDate
    }))
    return challengeDetailTmp
  }
  return challengeDetail
}
