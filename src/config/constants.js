/**
 * Constants used across the app
 */
export const {
  COMMUNITY_APP_URL,
  CHALLENGE_API_URL,
  SUBMISSION_REVIEW_APP_URL,
  STUDIO_URL,
  CONNECT_APP_URL,
  DIRECT_PROJECT_URL,
  SUBMISSION_REVIEW_URL,
  ONLINE_REVIEW_URL,
  DEFAULT_TERM_UUID,
  DEFAULT_NDA_UUID,
  SUBMITTER_ROLE_UUID,
  DEV_TRACK_ID,
  DES_TRACK_ID,
  DS_TRACK_ID,
  QA_TRACK_ID,
  CHALLENGE_TYPE_ID,
  SEGMENT_API_KEY
} = process.env
export const CREATE_FORUM_TYPE_IDS = typeof process.env.CREATE_FORUM_TYPE_IDS === 'string' ? process.env.CREATE_FORUM_TYPE_IDS.split(',') : process.env.CREATE_FORUM_TYPE_IDS

/**
 * Filepicker config
 */
// to be able to start the Connect App we should pass at least the dummy value for `FILE_PICKER_API_KEY`
// but if we want to test file uploading we should provide the real value in `FILE_PICKER_API_KEY` env variable
export const FILE_PICKER_API_KEY = process.env.FILE_PICKER_API_KEY || 'DUMMY'
export const FILE_PICKER_CONTAINER_NAME = process.env.FILE_PICKER_CONTAINER_NAME || 'tc-challenge-v5-dev'
export const FILE_PICKER_REGION = process.env.FILE_PICKER_REGION || 'us-east-1'
export const FILE_PICKER_CNAME = process.env.FILE_PICKER_CNAME || 'fs.topcoder.com'
export const FILE_PICKER_FROM_SOURCES = ['local_file_system', 'googledrive', 'dropbox']
export const FILE_PICKER_ACCEPT = ['.bmp', '.gif', '.jpg', '.tex', '.xls', '.xlsx', '.doc', '.docx', '.zip', '.txt', '.pdf', '.png', '.ppt', '.pptx', '.rtf', '.csv']
export const FILE_PICKER_MAX_FILES = 10
export const FILE_PICKER_MAX_SIZE = 500 * 1024 * 1024 // 500Mb
export const FILE_PICKER_PROGRESS_INTERVAL = 100
export const FILE_PICKER_UPLOAD_RETRY = 2
export const FILE_PICKER_UPLOAD_TIMEOUT = 30 * 60 * 1000 // 30 minutes
export const SPECIFICATION_ATTACHMENTS_FOLDER = 'SPECIFICATION_ATTACHMENTS'

export const getAWSContainerFileURL = (key) => `https://${FILE_PICKER_CONTAINER_NAME}.s3.amazonaws.com/${key}`

// Actions
export const LOAD_PROJECTS_SUCCESS = 'LOAD_PROJECTS_SUCCESS'
export const LOAD_PROJECTS_PENDING = 'LOAD_PROJECTS_PENDING'
export const LOAD_PROJECTS_FAILURE = 'LOAD_PROJECTS_FAILURE'

// project billingAccount
export const LOAD_PROJECT_BILLING_ACCOUNT = 'LOAD_PROJECT_BILLING_ACCOUNT'
export const LOAD_PROJECT_BILLING_ACCOUNT_PENDING = 'LOAD_PROJECT_BILLING_ACCOUNT_PENDING'
export const LOAD_PROJECT_BILLING_ACCOUNT_FAILURE = 'LOAD_PROJECT_BILLING_ACCOUNT_FAILURE'
export const LOAD_PROJECT_BILLING_ACCOUNT_SUCCESS = 'LOAD_PROJECT_BILLING_ACCOUNT_SUCCESS'

export const LOAD_PROJECT_PHASES = 'LOAD_PROJECT_PHASES'
export const LOAD_PROJECT_PHASES_PENDING = 'LOAD_PROJECT_PHASES_PENDING'
export const LOAD_PROJECT_PHASES_FAILURE = 'LOAD_PROJECT_PHASES_FAILURE'
export const LOAD_PROJECT_PHASES_SUCCESS = 'LOAD_PROJECT_PHASES_SUCCESS'

export const SET_ACTIVE_PROJECT = 'SET_ACTIVE_PROJECT'

export const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS'

export const LOAD_MEMBER_PENDING = 'LOAD_MEMBER_PENDING'
export const LOAD_MEMBER_SUCCESS = 'LOAD_MEMBER_SUCCESS'
export const LOAD_MEMBER_FAILURE = 'LOAD_MEMBER_FAILURE'

export const LOAD_CHALLENGES_SUCCESS = 'LOAD_CHALLENGES_SUCCESS'
export const LOAD_CHALLENGES_PENDING = 'LOAD_CHALLENGES_PENDING'
export const LOAD_CHALLENGES_FAILURE = 'LOAD_CHALLENGES_FAILURE'

export const LOAD_CHALLENGE_DETAILS = 'LOAD_CHALLENGE_DETAILS'
export const LOAD_CHALLENGE_DETAILS_SUCCESS = 'LOAD_CHALLENGE_DETAILS_SUCCESS'
export const LOAD_CHALLENGE_DETAILS_PENDING = 'LOAD_CHALLENGE_DETAILS_PENDING'
export const LOAD_CHALLENGE_DETAILS_FAILURE = 'LOAD_CHALLENGE_DETAILS_FAILURE'

export const UPDATE_CHALLENGE_DETAILS_SUCCESS = 'UPDATE_CHALLENGE_DETAILS_SUCCESS'
export const UPDATE_CHALLENGE_DETAILS_PENDING = 'UPDATE_CHALLENGE_DETAILS_PENDING'
export const UPDATE_CHALLENGE_DETAILS_FAILURE = 'UPDATE_CHALLENGE_DETAILS_FAILURE'

export const CREATE_CHALLENGE_SUCCESS = 'CREATE_CHALLENGE_SUCCESS'
export const CREATE_CHALLENGE_PENDING = 'CREATE_CHALLENGE_PENDING'
export const CREATE_CHALLENGE_FAILURE = 'CREATE_CHALLENGE_FAILURE'

export const DELETE_CHALLENGE_SUCCESS = 'DELETE_CHALLENGE_SUCCESS'
export const DELETE_CHALLENGE_PENDING = 'DELETE_CHALLENGE_PENDING'
export const DELETE_CHALLENGE_FAILURE = 'DELETE_CHALLENGE_FAILURE'

export const LOAD_PROJECT_DETAILS = 'LOAD_PROJECT_DETAILS'
export const LOAD_PROJECT_DETAILS_SUCCESS = 'LOAD_PROJECT_DETAILS_SUCCESS'
export const LOAD_PROJECT_DETAILS_PENDING = 'LOAD_PROJECT_DETAILS_PENDING'
export const LOAD_PROJECT_DETAILS_FAILURE = 'LOAD_PROJECT_DETAILS_FAILURE'

export const LOAD_CHALLENGE_SUBMISSIONS = 'LOAD_CHALLENGE_SUBMISSIONS'
export const LOAD_CHALLENGE_SUBMISSIONS_SUCCESS = 'LOAD_CHALLENGE_SUBMISSIONS_SUCCESS'
export const LOAD_CHALLENGE_SUBMISSIONS_PENDING = 'LOAD_CHALLENGE_SUBMISSIONS_PENDING'
export const LOAD_CHALLENGE_SUBMISSIONS_FAILURE = 'LOAD_CHALLENGE_SUBMISSIONS_FAILURE'

export const LOAD_CHALLENGE_MEMBERS_SUCCESS = 'LOAD_CHALLENGE_MEMBERS_SUCCESS'
export const LOAD_CHALLENGE_METADATA_SUCCESS = 'LOAD_CHALLENGE_METADATA_SUCCESS'

export const SAVE_AUTH_TOKEN = 'SAVE_AUTH_TOKEN'

export const CREATE_ATTACHMENT_PENDING = 'CREATE_ATTACHMENT_PENDING'
export const CREATE_ATTACHMENT_FAILURE = 'CREATE_ATTACHMENT_FAILURE'
export const CREATE_ATTACHMENT_SUCCESS = 'CREATE_ATTACHMENT_SUCCESS'

export const REMOVE_ATTACHMENT_PENDING = 'REMOVE_ATTACHMENT_PENDING'
export const REMOVE_ATTACHMENT_FAILURE = 'REMOVE_ATTACHMENT_FAILURE'
export const REMOVE_ATTACHMENT_SUCCESS = 'REMOVE_ATTACHMENT_SUCCESS'

export const LOAD_CHALLENGE_RESOURCES = 'LOAD_CHALLENGE_RESOURCES'
export const LOAD_CHALLENGE_RESOURCES_SUCCESS = 'LOAD_CHALLENGE_RESOURCES_SUCCESS'
export const LOAD_CHALLENGE_RESOURCES_PENDING = 'LOAD_CHALLENGE_RESOURCES_PENDING'
export const LOAD_CHALLENGE_RESOURCES_FAILURE = 'LOAD_CHALLENGE_RESOURCES_FAILURE'

export const CREATE_CHALLENGE_RESOURCE = 'CREATE_CHALLENGE_RESOURCE'
export const CREATE_CHALLENGE_RESOURCE_SUCCESS = 'CREATE_CHALLENGE_RESOURCE_SUCCESS'
export const CREATE_CHALLENGE_RESOURCE_PENDING = 'CREATE_CHALLENGE_RESOURCE_PENDING'
export const CREATE_CHALLENGE_RESOURCE_FAILURE = 'CREATE_CHALLENGE_RESOURCE_FAILURE'

export const DELETE_CHALLENGE_RESOURCE = 'DELETE_CHALLENGE_RESOURCE'
export const DELETE_CHALLENGE_RESOURCE_SUCCESS = 'DELETE_CHALLENGE_RESOURCE_SUCCESS'
export const DELETE_CHALLENGE_RESOURCE_PENDING = 'DELETE_CHALLENGE_RESOURCE_PENDING'
export const DELETE_CHALLENGE_RESOURCE_FAILURE = 'DELETE_CHALLENGE_RESOURCE_FAILURE'

export const SET_FILTER_CHALLENGE_VALUE = 'SET_FILTER_CHALLENGE_VALUE'

export const RESET_SIDEBAR_ACTIVE_PARAMS = 'RESET_SIDEBAR_ACTIVE_PARAMS'

export const BETA_MODE_COOKIE_TAG = 'beta-mode'

// Name of challenge tracks
export const CHALLENGE_TRACKS = {
  DESIGN: DES_TRACK_ID,
  DEVELOP: DEV_TRACK_ID,
  DATA_SCIENCE: DS_TRACK_ID,
  QA: QA_TRACK_ID
}

// List of challenge phase statuses
export const PHASE_STATUS = {
  CLOSED: 'Closed',
  OPEN: 'Open',
  SCHEDULED: 'Scheduled'
}

// List of prize sets types
export const PRIZE_SETS_TYPE = {
  CHALLENGE_PRIZES: 'placement',
  COPILOT_PAYMENT: 'copilot',
  REVIEWER_PAYMENT: 'reviewer',
  CHECKPOINT_PRIZES: 'checkpoint'
}

// prize set type descriptions
export const PRIZE_SETS_TYPE_DESCRIPTION = {
  [PRIZE_SETS_TYPE.CHECKPOINT_PRIZES]: 'Checkpoint Prizes'
}

export const REVIEW_TYPES = {
  INTERNAL: 'INTERNAL',
  COMMUNITY: 'COMMUNITY'
}

// List of subtracks that should be considered as Marathon Matches
export const MARATHON_MATCH_SUBTRACKS = [
  'DEVELOP_MARATHON_MATCH'
]

export const CHALLENGE_STATUS = {
  ACTIVE: 'ACTIVE',
  NEW: 'NEW',
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
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
  USD: 'USD'
}

export const ALLOWED_USER_ROLES = [
  'copilot',
  'administrator',
  'connect admin',
  'connect manager',
  'connect copilot'
]

export const ADMIN_ROLES = [
  'administrator',
  'connect admin'
]

export const downloadAttachmentURL = (challengeId, attachmentId, token) =>
  `${CHALLENGE_API_URL}/${challengeId}/attachments/${attachmentId}/download?token=${token}`

export const PAGE_SIZE = 50

/**
 * The minimal number of characters to enter before starting showing autocomplete suggestions
 */
export const AUTOCOMPLETE_MIN_LENGTH = 3

/**
 * Debounce timeout in ms for calling API for getting autocomplete suggestions
 */
export const AUTOCOMPLETE_DEBOUNCE_TIME_MS = 150

/**
 * Number of groups to retrieve for group dropdown
 */
export const GROUPS_DROPDOWN_PER_PAGE = 1000000 // make sure we are getting all the groups with one request

/**
 * The list of challenge types which can have multiple prizes
 */
export const CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES = ['Challenge']

/**
 * All the repeating messages.
 *
 * To have the same wording across the app.
 */
export const MESSAGE = {
  NO_LEGACY_CHALLENGE: 'Legacy challenge is not yet created',
  NO_TASK_ASSIGNEE: 'Task is not assigned yet',
  TASK_CLOSE_SUCCESS: 'Task closed successfully',
  CHALLENGE_LAUNCH_SUCCESS: 'Challenge activated successfully',
  COMMUNITY_REVIEW_DISABLED: 'Community review is NOT available for Design challenges',
  INTERNAL_REVIEW_DISABLED: 'Internal review is NOT available for QA challenges',
  PHASE_CLOSED: 'This phase has already closed',
  MARK_COMPLETE: 'This will close the task and generate a payment for the assignee and copilot.'
}

/**
 * Challenge cancel reasons
 */
export const CANCEL_REASONS = [
  'Cancelled - Failed Review',
  'Cancelled - Failed Screening',
  'Cancelled - Zero Submissions',
  'Cancelled - Winner Unresponsive',
  'Cancelled - Client Request',
  'Cancelled - Requirements Infeasible',
  'Cancelled - Zero Registrations'
]

/**
 * Milestone product details
 */
export const GENERIC_PROJECT_MILESTONE_PRODUCT_TYPE = 'generic-product'
export const GENERIC_PROJECT_MILESTONE_PRODUCT_NAME = 'Generic Product'
export const PHASE_PRODUCT_TEMPLATE_ID = 67
export const PHASE_PRODUCT_CHALLENGE_ID_FIELD = 'details.challengeGuid'

/*
 *  Possible statuses of project milestones
 */
export const MILESTONE_STATUS = {
  UNPLANNED: 'in_review',
  PLANNED: 'reviewed',
  ACTIVE: 'active',
  BLOCKED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}
