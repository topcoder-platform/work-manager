/**
 * Constants used across the app
 */
// Actions
export const LOAD_PROJECTS_SUCCESS = 'LOAD_PROJECTS_SUCCESS'
export const LOAD_PROJECTS_PENDING = 'LOAD_PROJECTS_PENDING'
export const LOAD_PROJECTS_FAILURE = 'LOAD_PROJECTS_FAILURE'

export const SET_ACTIVE_PROJECT = 'SET_ACTIVE_PROJECT'
export const SET_ACTIVE_MENU = 'SET_ACTIVE_MENU'

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

export const LOAD_CHALLENGE_TYPES_SUCCESS = 'LOAD_CHALLENGE_TYPES_SUCCESS'
export const LOAD_CHALLENGE_TYPES_PENDING = 'LOAD_CHALLENGE_TYPES_PENDING'
export const LOAD_CHALLENGE_TYPES_FAILURE = 'LOAD_CHALLENGE_TYPES_FAILURE'

export const LOAD_SUBMISSION_DETAILS_SUCCESS = 'LOAD_SUBMISSION_DETAILS_SUCCESS'
export const LOAD_SUBMISSION_DETAILS_PENDING = 'LOAD_SUBMISSION_DETAILS_PENDING'
export const LOAD_SUBMISSION_DETAILS_FAILURE = 'LOAD_SUBMISSION_DETAILS_FAILURE'

export const LOAD_SUBMISSION_ARTIFACTS_SUCCESS = 'LOAD_SUBMISSION_ARTIFACTS_SUCCESS'
export const LOAD_SUBMISSION_ARTIFACTS_PENDING = 'LOAD_SUBMISSION_ARTIFACTS_PENDING'
export const LOAD_SUBMISSION_ARTIFACTS_FAILURE = 'LOAD_SUBMISSION_ARTIFACTS_FAILURE'

export const SWITCH_TAB = 'SWITCH_TAB'

export const SAVE_AUTH_TOKEN = 'SAVE_AUTH_TOKEN'

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

export const SUBMISSION_DETAILS_TABS = {
  REVIEW_SUMMARY: 'Review Summary',
  ARTIFACTS: 'Artifacts'
}

export const SIDEBAR_MENU = {
  ACTIVE_CHALLENGES: 'Active Challenges',
  ALL_CHALLENGES: 'All Challenges',
  NEW_CHALLENGE: 'New Challenge'
}

export const CHALLENGE_STATUS = {
  ACTIVE: 'ACTIVE',
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED'
}

export const PROJECT_API_URL = process.env.PROJECT_API_URL

export const ACCOUNTS_APP_CONNECTOR_URL = process.env.ACCOUNTS_APP_CONNECTOR_URL
export const ACCOUNTS_APP_LOGIN_URL = process.env.ACCOUNTS_APP_LOGIN_URL

export const COMMUNITY_APP_URL = process.env.COMMUNITY_APP_URL

export const CHALLENGE_API_URL = process.env.CHALLENGE_API_URL

export const SUBMISSION_REVIEW_API_URL = process.env.SUBMISSION_REVIEW_API_URL

export const MEMBER_API_URL = process.env.MEMBER_API_URL
export const MEMBER_API_V3_URL = process.env.MEMBER_API_V3_URL

export const getTCChallengeURL = (challengeId) => `${COMMUNITY_APP_URL}/challenges/${challengeId}`
export const getTCMemberURL = (handle) => `${COMMUNITY_APP_URL}/members/${handle}`
export const downloadSubmissionURL = (submissionId, token) =>
  `${SUBMISSION_REVIEW_API_URL}/challengeSubmissions/${submissionId}/download?token=${token}`
export const downloadSubmissionArtifactURL = (submissionId, artifactId, token) =>
  `${SUBMISSION_REVIEW_API_URL}/challengeSubmissions/${submissionId}/artifacts/${artifactId}/download?token=${token}`

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
  MONEY: 'money',
  GIFT: 'gift'
}
