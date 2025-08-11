/**
 * Constants used across the app
 */
export const {
  COMMUNITY_APP_URL,
  CHALLENGE_API_URL,
  COPILOTS_URL,
  SUBMISSION_REVIEW_APP_URL,
  STUDIO_URL,
  CONNECT_APP_URL,
  DIRECT_PROJECT_URL,
  ONLINE_REVIEW_URL,
  DEFAULT_TERM_UUID,
  DEFAULT_NDA_UUID,
  SUBMITTER_ROLE_UUID,
  DEV_TRACK_ID,
  DES_TRACK_ID,
  DS_TRACK_ID,
  QA_TRACK_ID,
  CP_TRACK_ID,
  CHALLENGE_TYPE_ID,
  MARATHON_TYPE_ID,
  MULTI_ROUND_CHALLENGE_TEMPLATE_ID,
  UNIVERSAL_NAV_URL,
  HEADER_AUTH_URLS_HREF,
  HEADER_AUTH_URLS_LOCATION,
  API_V2,
  API_V3,
  API_V4,
  API_V5,
  SKILLS_V5_API_URL,
  UPDATE_SKILLS_V5_API_URL,
  SALESFORCE_BILLING_ACCOUNT_LINK,
  PROFILE_URL
} = process.env

export const CREATE_FORUM_TYPE_IDS = typeof process.env.CREATE_FORUM_TYPE_IDS === 'string' ? process.env.CREATE_FORUM_TYPE_IDS.split(',') : process.env.CREATE_FORUM_TYPE_IDS
export const PROJECTS_API_URL = process.env.PROJECTS_API_URL || process.env.PROJECT_API_URL

/**
 * Filepicker config
 */
// to be able to start the Connect App we should pass at least the dummy value for `FILE_PICKER_API_KEY`
// but if we want to test file uploading we should provide the real value in `FILE_PICKER_API_KEY` env variable
export const FILE_PICKER_API_KEY = process.env.FILE_PICKER_API_KEY || 'DUMMY'
export const FILE_PICKER_CONTAINER_NAME = process.env.FILE_PICKER_CONTAINER_NAME || 'tc-challenge-v5-dev'
export const FILE_PICKER_SUBMISSION_CONTAINER_NAME = process.env.FILE_PICKER_SUBMISSION_CONTAINER_NAME || 'submission-staging-dev'
export const PROJECT_ATTACHMENTS_FOLDER = process.env.PROJECT_ATTACHMENTS_FOLDER || 'PROJECT_ATTACHMENTS'
export const FILE_PICKER_REGION = process.env.FILE_PICKER_REGION || 'us-east-1'
export const FILE_PICKER_LOCATION = process.env.FILE_PICKER_LOCATION || 's3'
export const FILE_PICKER_CNAME = process.env.FILE_PICKER_CNAME || 'fs.topcoder.com'
export const FILE_PICKER_FROM_SOURCES = ['local_file_system', 'googledrive', 'dropbox']
export const ASSETS_FILE_PICKER_FROM_SOURCES = ['local_file_system']
export const ASSETS_FILE_PICKER_MAX_FILES = 4
export const FILE_PICKER_ACCEPT = ['.bmp', '.gif', '.jpg', '.tex', '.xls', '.xlsx', '.doc', '.docx', '.zip', '.txt', '.pdf', '.png', '.ppt', '.pptx', '.rtf', '.csv']
export const FILE_PICKER_MAX_FILES = 10
export const FILE_PICKER_MAX_SIZE = 500 * 1024 * 1024 // 500Mb
export const FILE_PICKER_PROGRESS_INTERVAL = 100
export const FILE_PICKER_UPLOAD_RETRY = 2
export const FILE_PICKER_UPLOAD_TIMEOUT = 30 * 60 * 1000 // 30 minutes
export const SPECIFICATION_ATTACHMENTS_FOLDER = 'SPECIFICATION_ATTACHMENTS'
export const MEMBERS_API_URL = process.env.MEMBERS_API_URL

export const getAWSContainerFileURL = (key) => `https://${FILE_PICKER_CONTAINER_NAME}.s3.amazonaws.com/${key}`

// Actions
export const LOAD_PROJECTS_SUCCESS = 'LOAD_PROJECTS_SUCCESS'
export const LOAD_PROJECTS_PENDING = 'LOAD_PROJECTS_PENDING'
export const LOAD_PROJECTS_FAILURE = 'LOAD_PROJECTS_FAILURE'
export const UNLOAD_PROJECTS_SUCCESS = 'UNLOAD_PROJECTS_SUCCESS'

export const LOAD_ALL_USER_PROJECTS_SUCCESS = 'LOAD_ALL_USER_PROJECTS_SUCCESS'
export const LOAD_ALL_USER_PROJECTS_PENDING = 'LOAD_ALL_USER_PROJECTS_PENDING'
export const LOAD_ALL_USER_PROJECTS_FAILURE = 'LOAD_ALL_USER_PROJECTS_FAILURE'

export const SEARCH_USER_PROJECTS_SUCCESS = 'SEARCH_USER_PROJECTS_SUCCESS'
export const SEARCH_USER_PROJECTS_PENDING = 'SEARCH_USER_PROJECTS_PENDING'
export const SEARCH_USER_PROJECTS_FAILURE = 'SEARCH_USER_PROJECTS_FAILURE'

// project billingAccounts
export const LOAD_PROJECT_BILLING_ACCOUNTS = 'LOAD_PROJECT_BILLING_ACCOUNTS'
export const LOAD_PROJECT_BILLING_ACCOUNTS_PENDING = 'LOAD_PROJECT_BILLING_ACCOUNTS_PENDING'
export const LOAD_PROJECT_BILLING_ACCOUNTS_FAILURE = 'LOAD_PROJECT_BILLING_ACCOUNTS_FAILURE'
export const LOAD_PROJECT_BILLING_ACCOUNTS_SUCCESS = 'LOAD_PROJECT_BILLING_ACCOUNTS_SUCCESS'

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

export const UPDATE_CHALLENGES_SKILLS_SUCCESS = 'UPDATE_CHALLENGES_SKILLS_SUCCESS'

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

export const UPDATE_PROJECT_DETAILS = 'UPDATE_PROJECT_DETAILS'
export const UPDATE_PROJECT_DETAILS_SUCCESS = 'UPDATE_PROJECT_DETAILS_SUCCESS'
export const UPDATE_PROJECT_DETAILS_PENDING = 'UPDATE_PROJECT_DETAILS_PENDING'
export const UPDATE_PROJECT_DETAILS_FAILURE = 'UPDATE_PROJECT_DETAILS_FAILURE'

export const UPDATE_PROJECT_ROLE_FOR_MEMBER_SUCCESS = 'UPDATE_PROJECT_ROLE_FOR_MEMBER_SUCCESS'

export const LOAD_CHALLENGE_SUBMISSIONS = 'LOAD_CHALLENGE_SUBMISSIONS'
export const LOAD_CHALLENGE_SUBMISSIONS_SUCCESS = 'LOAD_CHALLENGE_SUBMISSIONS_SUCCESS'
export const LOAD_CHALLENGE_SUBMISSIONS_PENDING = 'LOAD_CHALLENGE_SUBMISSIONS_PENDING'
export const LOAD_CHALLENGE_SUBMISSIONS_FAILURE = 'LOAD_CHALLENGE_SUBMISSIONS_FAILURE'

export const LOAD_CHALLENGE_MEMBERS = 'LOAD_CHALLENGE_MEMBERS'
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

export const LOAD_PROJECT_TYPES = 'LOAD_PROJECT_TYPES'
export const LOAD_PROJECT_TYPES_SUCCESS = 'LOAD_PROJECT_TYPES_SUCCESS'
export const LOAD_PROJECT_TYPES_PENDING = 'LOAD_PROJECT_TYPES_PENDING'
export const LOAD_PROJECT_TYPES_FAILURE = 'LOAD_PROJECT_TYPES_FAILURE'

export const LOAD_PROJECT_INVITES = 'LOAD_PROJECT_INVITES'
export const LOAD_PROJECT_INVITES_SUCCESS = 'LOAD_PROJECT_INVITES_SUCCESS'
export const LOAD_PROJECT_INVITES_PENDING = 'LOAD_PROJECT_INVITES_PENDING'
export const LOAD_PROJECT_INVITES_FAILURE = 'LOAD_PROJECT_INVITES_FAILURE'

export const CREATE_PROJECT = 'CREATE_PROJECT'
export const CREATE_PROJECT_PENDING = 'CREATE_PROJECT_PENDING'
export const CREATE_PROJECT_SUCCESS = 'CREATE_PROJECT_SUCCESS'
export const CREATE_PROJECT_FAILURE = 'CREATE_PROJECT_FAILURE'

export const ADD_PROJECT_ATTACHMENT_SUCCESS = 'ADD_PROJECT_ATTACHMENT_SUCCESS'
export const UPDATE_PROJECT_ATTACHMENT_SUCCESS = 'UPDATE_PROJECT_ATTACHMENT_SUCCESS'
export const REMOVE_PROJECT_ATTACHMENT_SUCCESS = 'REMOVE_PROJECT_ATTACHMENT_SUCCESS'

export const UPDATE_PROJECT = 'UPDATE_PROJECT'
export const UPDATE_PROJECT_PENDING = 'UPDATE_PROJECT_PENDING'
export const UPDATE_PROJECT_SUCCESS = 'UPDATE_PROJECT_SUCCESS'
export const UPDATE_PROJECT_FAILURE = 'UPDATE_PROJECT_FAILURE'

export const PROJECT_MEMBER_INVITE_STATUS_ACCEPTED = 'accepted'
export const PROJECT_MEMBER_INVITE_STATUS_REFUSED = 'refused'
export const PROJECT_MEMBER_INVITE_STATUS_CANCELED = 'canceled'
export const PROJECT_MEMBER_INVITE_STATUS_PENDING = 'pending'
export const PROJECT_MEMBER_INVITE_STATUS_REQUESTED = 'requested'
export const PROJECT_MEMBER_INVITE_STATUS_REQUEST_APPROVED = 'request_approved'
export const PROJECT_MEMBER_INVITE_STATUS_REQUEST_REJECTED = 'request_rejected'

// Name of challenge tracks
export const CHALLENGE_TRACKS = {
  DESIGN: DES_TRACK_ID,
  DEVELOP: DEV_TRACK_ID,
  DATA_SCIENCE: DS_TRACK_ID,
  QA: QA_TRACK_ID,
  COMPETITIVE_PROGRAMMING: CP_TRACK_ID
}

// List of challenge phase statuses
export const PHASE_STATUS = {
  CLOSED: 'Closed',
  OPEN: 'Open',
  SCHEDULED: 'Scheduled'
}

// List of prize sets types
export const PRIZE_SETS_TYPE = {
  CHALLENGE_PRIZES: 'PLACEMENT',
  COPILOT_PAYMENT: 'COPILOT',
  REVIEWER_PAYMENT: 'REVIEWER',
  CHECKPOINT_PRIZES: 'CHECKPOINT'
}

export const REVIEW_TYPES = {
  INTERNAL: 'INTERNAL',
  COMMUNITY: 'COMMUNITY'
}

export const ROUND_TYPES = {
  'SINGLE_ROUND': 'Single round',
  'TWO_ROUNDS': 'Two rounds'
}

export const DESIGN_CHALLENGE_TYPES = [
  'Application Front-End Design',
  'Print/Presentation',
  'Web Design',
  'Widget or Mobile Screen Design',
  'Wireframes'
]

// List of subtracks that should be considered as Marathon Matches
export const MARATHON_MATCH_SUBTRACKS = [
  'DEVELOP_MARATHON_MATCH'
]

export const PROJECT_ROLES = {
  READ: 'observer',
  CUSTOMER: 'customer',
  WRITE: 'customer',
  MANAGER: 'manager',
  COPILOT: 'copilot'
}

export const ALLOWED_DOWNLOAD_SUBMISSIONS_ROLES = [
  'administrator',
  PROJECT_ROLES.MANAGER,
  PROJECT_ROLES.COPILOT,
  PROJECT_ROLES.WRITE
]

export const ALLOWED_EDIT_RESOURCE_ROLES = [
  'administrator',
  PROJECT_ROLES.MANAGER,
  PROJECT_ROLES.COPILOT
]

export const CHALLENGE_STATUS = {
  ACTIVE: 'ACTIVE',
  NEW: 'NEW',
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
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
  'connect copilot',
  'topcoder user'
]

export const READ_ONLY_ROLES = [
  'topcoder user'
]

export const ADMIN_ROLES = [
  'administrator',
  'connect admin'
]

export const COPILOT_ROLES = [
  'copilot'
]

export const MANAGER_ROLES = [
  'project manager'
]

export const downloadAttachmentURL = (challengeId, attachmentId, token) =>
  `${CHALLENGE_API_URL}/${challengeId}/attachments/${attachmentId}/download?token=${token}`

export const PAGE_SIZE = 10

export const PROJECTS_PAGE_SIZE = 20

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
export const CHALLENGE_TYPES_WITH_MULTIPLE_PRIZES = ['Challenge', 'Marathon Match']

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
 * System reviewers
 */
export const SystemReviewers = {
  Default: 'TC System'
}

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

export const MULTI_ROUND_CHALLENGE_DESC_TEMPLATE = '\n\n### ROUND 1\n' +
  '**Submit your initial designs for checkpoint feedback**\n\n' +
  '### ROUND 2\n' +
  '**Submit your final designs with all checkpoint feedback implemented**\n\n' +
  '### CHALLENGE DESCRIPTION'

export const MAX_CHECKPOINT_PRIZE_COUNT = 8
export const DEFAULT_CHECKPOINT_PRIZE = 50
export const DEFAULT_CHECKPOINT_PRIZE_COUNT = 5

export const PAGINATION_PER_PAGE_OPTIONS = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '25', value: '25' },
  { label: '50', value: '50' }
]

export const SPECIAL_CHALLENGE_TAGS = [
  'Marathon Match',
  'Rapid Development Match'
]

/**
 * Possible statuses of projects
 */
export const PROJECT_STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Paused', value: 'paused' }
]

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  IN_REVIEW: 'in_review',
  REVIEWED: 'reviewed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused'
}

export const JOB_ROLE_OPTIONS = [
  { value: null, label: 'Select Role' },
  { value: 'designer', label: 'Designer' },
  { value: 'software-developer', label: 'Software Developer' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'data-engineer', label: 'Data Engineer' }
]

export const JOB_WORKLOAD_OPTIONS = [
  { value: null, label: 'Select Workload' },
  { value: 'fulltime', label: 'Full-Time' },
  { value: 'fractional', label: 'Fractional' }
]

/*
* Project Attachment types
*/
export const ATTACHMENT_TYPE_FILE = 'file'
export const ATTACHMENT_TYPE_LINK = 'link'

/**
 * Project assets shared with type text
 */
export const PROJECT_ASSETS_SHARED_WITH_ALL_MEMBERS = 'All Project Members'
export const PROJECT_ASSETS_SHARED_WITH_ADMIN = 'Only Admins'

export const PROJECT_TYPE_TAAS = 'talent-as-a-service'
