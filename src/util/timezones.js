import moment from 'moment-timezone'

const DEFAULT_LOCALE = 'en-US'

const getIntlTimeZoneName = (timeZone, style) => {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    return null
  }

  try {
    const formatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      timeZone,
      timeZoneName: style
    })

    if (typeof formatter.formatToParts !== 'function') {
      return null
    }

    const parts = formatter.formatToParts(new Date())
    const namePart = parts.find(part => part.type === 'timeZoneName')
    return namePart && namePart.value ? namePart.value : null
  } catch (error) {
    return null
  }
}

const getMomentTimeZoneName = (timeZone) => {
  if (!moment || !moment.tz || !moment.tz.zone) {
    return null
  }

  if (!moment.tz.zone(timeZone)) {
    return null
  }

  try {
    return moment.tz(new Date(), timeZone).format('z')
  } catch (error) {
    return null
  }
}

export const formatTimeZoneLabel = (timeZone) => {
  if (!timeZone) {
    return ''
  }

  const normalized = String(timeZone).trim()
  if (!normalized) {
    return ''
  }

  if (normalized === 'Any') {
    return 'Any'
  }

  const shortName = getMomentTimeZoneName(normalized) || getIntlTimeZoneName(normalized, 'short')
  const longName = getIntlTimeZoneName(normalized, 'long')

  if (shortName && longName) {
    if (shortName === longName) {
      return shortName
    }
    return `${shortName} - ${longName}`
  }

  return shortName || longName || normalized
}

export const formatTimeZoneList = (timeZones, fallback = 'Any') => {
  if (!Array.isArray(timeZones) || timeZones.length === 0) {
    return fallback
  }

  if (timeZones.includes('Any')) {
    return fallback
  }

  const labels = timeZones
    .map(zone => formatTimeZoneLabel(zone))
    .filter(Boolean)

  const uniqueLabels = []
  const seenLabels = new Set()
  labels.forEach((label) => {
    const normalized = label.toLowerCase()
    if (seenLabels.has(normalized)) {
      return
    }
    seenLabels.add(normalized)
    uniqueLabels.push(label)
  })

  return uniqueLabels.length ? uniqueLabels.join(', ') : fallback
}
