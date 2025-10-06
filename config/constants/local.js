const DOMAIN = 'topcoder-dev.com'

// Keep generic API bases pointing to dev unless specifically overridden below
const DEV_API_HOSTNAME = `https://api.${DOMAIN}`
const API_V5 = `${DEV_API_HOSTNAME}/v5`

// Local service endpoints mirror platform-ui local.env.ts overrides
const LOCAL_CHALLENGE_API = 'http://localhost:3000/v6'
const LOCAL_GROUPS_API = 'http://localhost:3001/v6'
const LOCAL_IDENTITY_API = 'http://localhost:3002/v6'
const LOCAL_MEMBER_API = 'http://localhost:3003/v6'
const LOCAL_RESOURCE_API = 'http://localhost:3004/v6'
const LOCAL_REVIEW_API = 'http://localhost:3005/v6'
const LOCAL_SKILLS_API_V5 = 'http://localhost:3006/v5/standardized-skills'
// Lookups API available on 3007 if needed in future
// const LOCAL_LOOKUPS_API = 'http://localhost:3007/v6'

module.exports = {
  // Core API bases (leave on dev domain; individual services overridden below)
  API_V2: `${DEV_API_HOSTNAME}/v2`,
  API_V3: `${DEV_API_HOSTNAME}/v3`,
  API_V4: `${DEV_API_HOSTNAME}/v4`,
  API_V5,

  // Auth and UI URLs (stay on dev domain)
  ACCOUNTS_APP_CONNECTOR_URL: `https://accounts-auth0.${DOMAIN}`,
  ACCOUNTS_APP_LOGIN_URL: `https://accounts-auth0.${DOMAIN}`,
  COMMUNITY_APP_URL: `https://www-v6.${DOMAIN}`,

  // Local service URLs
  MEMBER_API_URL: `${LOCAL_MEMBER_API}/members`,
  CHALLENGE_API_URL: `${LOCAL_CHALLENGE_API}/challenges`,
  CHALLENGE_DEFAULT_REVIEWERS_URL: `${LOCAL_CHALLENGE_API.replace(/\/v6$/, '')}/v6/challenge/default-reviewers`,
  CHALLENGE_API_VERSION: '1.1.0',
  CHALLENGE_TIMELINE_TEMPLATES_URL: `${LOCAL_CHALLENGE_API}/timeline-templates`,
  CHALLENGE_TYPES_URL: `${LOCAL_CHALLENGE_API}/challenge-types`,
  CHALLENGE_TRACKS_URL: `${LOCAL_CHALLENGE_API}/challenge-tracks`,
  CHALLENGE_PHASES_URL: `${LOCAL_CHALLENGE_API}/challenge-phases`,
  CHALLENGE_TIMELINES_URL: `${LOCAL_CHALLENGE_API}/challenge-timelines`,

  // Copilots and other apps remain on dev
  COPILOTS_URL: 'https://copilots-v6.topcoder-dev.com/copilots',

  // Projects API: keep dev unless you run projects locally
  PROJECT_API_URL: `${DEV_API_HOSTNAME}/v5/projects`,

  // Local groups/resources/review services
  GROUPS_API_URL: `${LOCAL_GROUPS_API}/groups`,
  TERMS_API_URL: `${DEV_API_HOSTNAME}/v5/terms`,
  RESOURCES_API_URL: `${LOCAL_RESOURCE_API}/resources`,
  RESOURCE_ROLES_API_URL: `${LOCAL_RESOURCE_API}/resource-roles`,
  SUBMISSIONS_API_URL: `${LOCAL_REVIEW_API}/submissions`,
  REVIEW_TYPE_API_URL: `${LOCAL_REVIEW_API}/reviewTypes`,
  SCORECARDS_API_URL: `${LOCAL_REVIEW_API}/scorecards`,
  WORKFLOWS_API_URL: `${LOCAL_REVIEW_API}/workflows`,

  SUBMISSION_REVIEW_APP_URL: `https://submission-review.${DOMAIN}/challenges`,
  STUDIO_URL: `https://studio.${DOMAIN}`,
  CONNECT_APP_URL: `https://connect.${DOMAIN}`,
  DIRECT_PROJECT_URL: `https://www.${DOMAIN}/direct`,
  ONLINE_REVIEW_URL: `https://software.${DOMAIN}`,
  REVIEW_APP_URL: `https://review.${DOMAIN}`,

  // IDs and static values (same as development)
  DEFAULT_TERM_UUID: '317cd8f9-d66c-4f2a-8774-63c612d99cd4', // Terms & Conditions of Use at TopCoder
  DEFAULT_NDA_UUID: 'e5811a7b-43d1-407a-a064-69e5015b4900', // NDA v3.0
  SUBMITTER_ROLE_UUID: '732339e7-8e30-49d7-9198-cccf9451e221',
  DEV_TRACK_ID: '9b6fc876-f4d9-4ccb-9dfd-419247628825',
  DES_TRACK_ID: '5fa04185-041f-49a6-bfd1-fe82533cd6c8',
  DS_TRACK_ID: 'c0f5d461-8219-4c14-878a-c3a3f356466d',
  QA_TRACK_ID: '36e6a8d0-7e1e-4608-a673-64279d99c115',
  CP_TRACK_ID: '9d6e0de8-df14-4c76-ba0a-a9a8cb03a4ea',
  CHALLENGE_TYPE_ID: '927abff4-7af9-4145-8ba1-577c16e64e2e',
  MARATHON_TYPE_ID: '929bc408-9cf2-4b3e-ba71-adfbf693046c',
  SEGMENT_API_KEY: 'QBtLgV8vCiuRX1lDikbMjcoe9aCHkF6n',
  CREATE_FORUM_TYPE_IDS: ['927abff4-7af9-4145-8ba1-577c16e64e2e', 'dc876fa4-ef2d-4eee-b701-b555fcc6544c', 'ecd58c69-238f-43a4-a4bb-d172719b9f31', '78b37a69-92d5-4ad7-bf85-c79b65420c79', '929bc408-9cf2-4b3e-ba71-adfbf693046c'],

  // Filestack (same defaults as development)
  FILE_PICKER_API_KEY: process.env.FILE_PICKER_API_KEY,
  FILE_PICKER_CONTAINER_NAME: 'tc-challenge-v5-dev',
  FILE_PICKER_SUBMISSION_CONTAINER_NAME: process.env.FILE_PICKER_SUBMISSION_CONTAINER_NAME || 'submission-staging-dev',
  FILE_PICKER_REGION: 'us-east-1',
  FILE_PICKER_CNAME: 'fs.topcoder.com',
  FILE_PICKER_LOCATION: 's3',

  // Idle/logout prompts
  IDLE_TIMEOUT_MINUTES: 10,
  IDLE_TIMEOUT_GRACE_MINUTES: 5,

  MULTI_ROUND_CHALLENGE_TEMPLATE_ID: 'd4201ca4-8437-4d63-9957-3f7708184b07',
  UNIVERSAL_NAV_URL: 'https://uni-nav.topcoder-dev.com/v1/tc-universal-nav.js',
  HEADER_AUTH_URLS_HREF: `https://accounts-auth0.${DOMAIN}?utm_source=community-app-main`,
  HEADER_AUTH_URLS_LOCATION: `https://accounts-auth0.${DOMAIN}?retUrl=%S&utm_source=community-app-main`,

  // Standardized skills API on local
  SKILLS_V5_API_URL: `${LOCAL_SKILLS_API_V5}/skills/autocomplete`,
  UPDATE_SKILLS_V5_API_URL: `${LOCAL_SKILLS_API_V5}/challenge-skills`,

  SALESFORCE_BILLING_ACCOUNT_LINK: 'https://c.cs18.visual.force.com/apex/baredirect?id=',
  PROFILE_URL: 'https://profiles.topcoder-dev.com/'
}

