/**
 * Provides date related utility methods
 */
import moment from 'moment'
import _ from 'lodash'
import 'moment-duration-format'

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
 * Get phase duration
 * @param {Date} startDate phase start date
 * @param {Date} endDate phase end date
 * @returns duration
 */
export const getPhaseDuration = (startDate, endDate) => {
  const startDateMoment = moment(startDate).set({ second: 0, millisecond: 0 })
  const endDateMoment = moment(endDate).set({ second: 0, millisecond: 0 })
  return moment.duration(endDateMoment.diff(startDateMoment)).asMinutes()
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
      if (p.scheduledStartDate && p.scheduledEndDate) {
        const startDate = moment(p.scheduledStartDate).set({ second: 0, millisecond: 0 })
        const endDate = moment(p.scheduledEndDate).set({ second: 0, millisecond: 0 })
        p.duration = moment.duration(endDate.diff(startDate)).asMinutes()
      } else {
        p.duration = Math.floor(p.duration / minuteToSecond)
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
  return _.sortBy(phases, [
    phase => phase.actualStartDate || phase.scheduledStartDate,
    phase => {
      const phaseName = (phase.name || '').toLowerCase()

      if (phaseName === 'registration') {
        return 0
      }

      if (phaseName === 'submission') {
        return 1
      }

      return 2
    }
  ])
}

/**
 * Convert challenge phase from hours to second and remove unnessesary field
 * @param {Object} challengeDetail challenge detail
 */
export const updateChallengePhaseBeforeSendRequest = (challengeDetail) => {
  if (!challengeDetail) {
    return challengeDetail
  }

  const challengeDetailTmp = _.cloneDeep(challengeDetail)

  if (challengeDetailTmp.status && _.isString(challengeDetailTmp.status)) {
    challengeDetailTmp.status = challengeDetailTmp.status.toUpperCase()
  }

  if (challengeDetailTmp.discussions && challengeDetailTmp.discussions.length > 0) {
    challengeDetailTmp.discussions = challengeDetailTmp.discussions.map(discussion => {
      if (discussion && _.isString(discussion.type)) {
        return {
          ...discussion,
          type: discussion.type.toUpperCase()
        }
      }
      return discussion
    })
  }

  if (challengeDetailTmp.metadata && challengeDetailTmp.metadata.length > 0) {
    challengeDetailTmp.metadata = challengeDetailTmp.metadata.map(m => {
      const metadata = { ...m }

      // check if value is boolean and convert to string
      if (typeof metadata.value === 'boolean') {
        metadata.value = metadata.value.toString()
      }

      return metadata
    })
  }

  if (challengeDetailTmp.phases) {
    challengeDetailTmp.startDate = moment(challengeDetailTmp.phases[0].scheduledStartDate)
    // challengeDetailTmp.registrationStartDate = moment(challengeDetailTmp.phases[0].scheduledStartDate)
    // challengeDetailTmp.registrationEndDate = moment(challengeDetailTmp.phases[0].scheduledEndDate)
    // challengeDetailTmp.submissionStartDate = moment(challengeDetailTmp.phases[1].scheduledStartDate)
    // challengeDetailTmp.submissionEndDate = moment(challengeDetailTmp.phases[1].scheduledEndDate)
    challengeDetailTmp.phases = challengeDetailTmp.phases.map((p) => ({
      duration: p.duration * minuteToSecond,
      phaseId: p.phaseId,
      scheduledStartDate: p.scheduledStartDate
    }))
  }

  return challengeDetailTmp
}
