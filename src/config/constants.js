/**
 * Constants used across the app
 */
export const { COMMUNITY_APP_URL, CHALLENGE_API_URL } = process.env

// Actions
export const LOAD_PROJECTS_SUCCESS = 'LOAD_PROJECTS_SUCCESS'
export const LOAD_PROJECTS_PENDING = 'LOAD_PROJECTS_PENDING'
export const LOAD_PROJECTS_FAILURE = 'LOAD_PROJECTS_FAILURE'

export const SET_ACTIVE_PROJECT = 'SET_ACTIVE_PROJECT'

export const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS'

export const LOAD_CHALLENGES_SUCCESS = 'LOAD_CHALLENGES_SUCCESS'
export const LOAD_CHALLENGES_PENDING = 'LOAD_CHALLENGES_PENDING'
export const LOAD_CHALLENGES_FAILURE = 'LOAD_CHALLENGES_FAILURE'

export const LOAD_CHALLENGE_DETAILS_SUCCESS = 'LOAD_CHALLENGE_DETAILS_SUCCESS'
export const LOAD_CHALLENGE_DETAILS_PENDING = 'LOAD_CHALLENGE_DETAILS_PENDING'
export const LOAD_CHALLENGE_DETAILS_FAILURE = 'LOAD_CHALLENGE_DETAILS_FAILURE'

export const LOAD_CHALLENGE_SUBMISSIONS_SUCCESS = 'LOAD_CHALLENGE_SUBMISSIONS_SUCCESS'
export const LOAD_CHALLENGE_SUBMISSIONS_PENDING = 'LOAD_CHALLENGE_SUBMISSIONS_PENDING'
export const LOAD_CHALLENGE_SUBMISSIONS_FAILURE = 'LOAD_CHALLENGE_SUBMISSIONS_FAILURE'

export const LOAD_CHALLENGE_MEMBERS_SUCCESS = 'LOAD_CHALLENGE_MEMBERS'
export const LOAD_CHALLENGE_METADATA_SUCCESS = 'LOAD_CHALLENGE_METADATA_SUCCESS'

export const SAVE_AUTH_TOKEN = 'SAVE_AUTH_TOKEN'

export const UPLOAD_ATTACHMENT_PENDING = 'UPLOAD_ATTACHMENT_PENDING'
export const UPLOAD_ATTACHMENT_FAILURE = 'UPLOAD_ATTACHMENT_FAILURE'
export const UPLOAD_ATTACHMENT_SUCCESS = 'UPLOAD_ATTACHMENT_SUCCESS'

export const REMOVE_ATTACHMENT = 'REMOVE_ATTACHMENT'

export const SET_FILTER_CHALLENGE_VALUE = 'SET_FILTER_CHALLENGE_VALUE'

export const RESET_SIDEBAR_ACTIVE_PARAMS = 'RESET_SIDEBAR_ACTIVE_PARAMS'

// Name of challenge tracks
export const CHALLENGE_TRACKS = {
  DESIGN: 'DESIGN',
  DEVELOP: 'DEVELOP',
  DATA_SCIENCE: 'DATA_SCIENCE',
  QA: 'QA'
}

// List of challenge phase statuses
export const PHASE_STATUS = {
  CLOSED: 'Closed',
  OPEN: 'Open',
  SCHEDULED: 'Scheduled'
}

// List of subtracks that should be considered as Marathon Matches
export const MARATHON_MATCH_SUBTRACKS = [
  'DEVELOP_MARATHON_MATCH'
]

export const CHALLENGE_STATUS = {
  ACTIVE: 'ACTIVE',
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED'
}

export const getTCMemberURL = (handle) => `${COMMUNITY_APP_URL}/members/${handle}`

export const SYSTEM_USERS = [
  'TC System',
  'Applications'
]

export const VALIDATION_VALUE_TYPE = {
  NUMBER: 'number',
  INTEGER: 'integer',
  STRING: 'string'
}

export const CHALLENGE_PRIZE_TYPE = {
  MONEY: 'money'
}

export const ALLOWED_USER_ROLES = [
  'copilot',
  'administrator',
  'Connect Admin',
  'Connect Manager',
  'Connect Copilot'
]

export const downloadAttachmentURL = (challengeId, attachmentId, token) =>
  `${CHALLENGE_API_URL}/${challengeId}/attachments/${attachmentId}?token=${token}`

export const PAGE_SIZE = 50
