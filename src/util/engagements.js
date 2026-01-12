const STATUS_LABELS = {
  OPEN: 'Open',
  PENDING_ASSIGNMENT: 'Pending Assignment',
  CLOSED: 'Closed'
}

const STATUS_TO_API = {
  Open: 'OPEN',
  'Pending Assignment': 'PENDING_ASSIGNMENT',
  Closed: 'CLOSED'
}

export const toEngagementStatusApi = (status) => {
  if (!status) {
    return status
  }
  const normalized = status.toString().trim()
  if (STATUS_TO_API[normalized]) {
    return STATUS_TO_API[normalized]
  }
  const upper = normalized.toUpperCase().replace(/\s+/g, '_')
  if (STATUS_LABELS[upper]) {
    return upper
  }
  return status
}

export const fromEngagementStatusApi = (status) => {
  if (!status) {
    return status
  }
  const normalized = status.toString().trim().toUpperCase().replace(/\s+/g, '_')
  return STATUS_LABELS[normalized] || status
}

const normalizeSkill = (skill) => {
  if (!skill) {
    return null
  }
  if (typeof skill === 'string') {
    return { id: skill, name: skill }
  }
  const id = skill.id || skill.value
  if (!id) {
    return null
  }
  const name = skill.name || skill.label || id
  return { ...skill, id, name }
}

export const normalizeEngagement = (engagement = {}) => {
  if (!engagement || typeof engagement !== 'object') {
    return engagement
  }

  const durationWeeks = engagement.durationWeeks
  const durationMonths = engagement.durationMonths
  let durationAmount = engagement.durationAmount
  let durationUnit = engagement.durationUnit

  if (durationWeeks != null && durationWeeks !== '') {
    durationAmount = durationWeeks
    durationUnit = 'weeks'
  } else if (durationMonths != null && durationMonths !== '') {
    durationAmount = durationMonths
    durationUnit = 'months'
  } else if (engagement.duration && engagement.duration.amount !== undefined) {
    durationAmount = engagement.duration.amount
    durationUnit = engagement.duration.unit || durationUnit
  }

  const startDate = engagement.startDate || engagement.durationStartDate
  const endDate = engagement.endDate || engagement.durationEndDate
  const timezones = Array.isArray(engagement.timezones)
    ? engagement.timezones
    : Array.isArray(engagement.timeZones)
      ? engagement.timeZones
      : []

  let skills = Array.isArray(engagement.skills) ? engagement.skills : null
  if (skills && skills.length) {
    skills = skills.map(normalizeSkill).filter(Boolean)
  } else {
    const requiredSkills = Array.isArray(engagement.requiredSkills)
      ? engagement.requiredSkills
      : []
    skills = requiredSkills.map(normalizeSkill).filter(Boolean)
  }

  return {
    ...engagement,
    startDate,
    endDate,
    durationAmount,
    durationUnit,
    timezones,
    skills,
    status: fromEngagementStatusApi(engagement.status)
  }
}

export const normalizeEngagements = (engagements = []) => {
  if (!Array.isArray(engagements)) {
    return []
  }
  return engagements.map(normalizeEngagement)
}
