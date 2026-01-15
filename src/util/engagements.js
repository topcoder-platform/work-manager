const STATUS_LABELS = {
  OPEN: 'Open',
  PENDING_ASSIGNMENT: 'Pending Assignment',
  ACTIVE: 'Active',
  CANCELLED: 'Cancelled',
  CLOSED: 'Closed'
}

const STATUS_TO_API = {
  Open: 'OPEN',
  'Pending Assignment': 'PENDING_ASSIGNMENT',
  Active: 'ACTIVE',
  Cancelled: 'CANCELLED',
  Closed: 'CLOSED'
}

const ROLE_TO_API = {
  designer: 'DESIGNER',
  'software-developer': 'SOFTWARE_DEVELOPER',
  'data-scientist': 'DATA_SCIENTIST',
  'data-engineer': 'DATA_ENGINEER'
}

const ROLE_FROM_API = {
  DESIGNER: 'Designer',
  SOFTWARE_DEVELOPER: 'Software Developer',
  DATA_SCIENTIST: 'Data Scientist',
  DATA_ENGINEER: 'Data Engineer'
}

const WORKLOAD_TO_API = {
  fulltime: 'FULL_TIME',
  fractional: 'FRACTIONAL'
}

const WORKLOAD_FROM_API = {
  FULL_TIME: 'Full-Time',
  FRACTIONAL: 'Fractional'
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

export const toEngagementRoleApi = (role) => {
  if (!role) {
    return role
  }
  const normalized = role.toString().trim()
  if (ROLE_TO_API[normalized]) {
    return ROLE_TO_API[normalized]
  }
  const upper = normalized.toUpperCase().replace(/[\s-]+/g, '_')
  if (ROLE_FROM_API[upper]) {
    return upper
  }
  return role
}

export const fromEngagementRoleApi = (role) => {
  if (!role) {
    return role
  }
  const normalized = role.toString().trim().toUpperCase().replace(/[\s-]+/g, '_')
  return ROLE_FROM_API[normalized] || role
}

export const toEngagementWorkloadApi = (workload) => {
  if (!workload) {
    return workload
  }
  const normalized = workload.toString().trim()
  if (WORKLOAD_TO_API[normalized]) {
    return WORKLOAD_TO_API[normalized]
  }
  const upper = normalized.toUpperCase().replace(/[\s-]+/g, '_')
  if (WORKLOAD_FROM_API[upper]) {
    return upper
  }
  return workload
}

export const fromEngagementWorkloadApi = (workload) => {
  if (!workload) {
    return workload
  }
  const normalized = workload.toString().trim().toUpperCase().replace(/[\s-]+/g, '_')
  return WORKLOAD_FROM_API[normalized] || workload
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

  const role = fromEngagementRoleApi(engagement.role)
  const workload = fromEngagementWorkloadApi(engagement.workload)
  const compensationRange = engagement.compensationRange || ''

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

  const normalizedDurationWeeks = durationWeeks != null && durationWeeks !== ''
    ? durationWeeks
    : durationUnit === 'weeks' && durationAmount != null && durationAmount !== ''
      ? durationAmount
      : ''

  return {
    ...engagement,
    startDate,
    endDate,
    durationAmount,
    durationUnit,
    durationWeeks: normalizedDurationWeeks,
    timezones,
    skills,
    status: fromEngagementStatusApi(engagement.status),
    role,
    workload,
    compensationRange
  }
}

export const normalizeEngagements = (engagements = []) => {
  if (!Array.isArray(engagements)) {
    return []
  }
  return engagements.map(normalizeEngagement)
}
