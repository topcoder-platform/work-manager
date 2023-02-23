const DOMAIN = 'topcoder-dev.com'
const DEV_API_HOSTNAME = `https://api.${DOMAIN}`

module.exports = {
  ACCOUNTS_APP_CONNECTOR_URL: `https://accounts-auth0.${DOMAIN}`,
  ACCOUNTS_APP_LOGIN_URL: `https://accounts-auth0.${DOMAIN}`,
  COMMUNITY_APP_URL: `https://www.${DOMAIN}`,
  MEMBER_API_URL: `${DEV_API_HOSTNAME}/v5/members`,
  MEMBER_API_V3_URL: `${DEV_API_HOSTNAME}/v3/members`,
  CHALLENGE_API_URL: `${DEV_API_HOSTNAME}/v5/challenges`,
  CHALLENGE_TIMELINE_TEMPLATES_URL: `${DEV_API_HOSTNAME}/v5/timeline-templates`,
  CHALLENGE_TYPES_URL: `${DEV_API_HOSTNAME}/v5/challenge-types`,
  CHALLENGE_TRACKS_URL: `${DEV_API_HOSTNAME}/v5/challenge-tracks`,
  CHALLENGE_PHASES_URL: `${DEV_API_HOSTNAME}/v5/challenge-phases`,
  CHALLENGE_TIMELINES_URL: `${DEV_API_HOSTNAME}/v5/challenge-timelines`,
  PROJECT_API_URL: `${DEV_API_HOSTNAME}/v5/projects`,
  GROUPS_API_URL: `${DEV_API_HOSTNAME}/v5/groups`,
  TERMS_API_URL: `${DEV_API_HOSTNAME}/v5/terms`,
  RESOURCES_API_URL: `${DEV_API_HOSTNAME}/v5/resources`,
  RESOURCE_ROLES_API_URL: `${DEV_API_HOSTNAME}/v5/resource-roles`,
  SUBMISSIONS_API_URL: `${DEV_API_HOSTNAME}/v5/submissions`,
  PLATFORMS_V4_API_URL: `${DEV_API_HOSTNAME}/v4/platforms`,
  TECHNOLOGIES_V4_API_URL: `${DEV_API_HOSTNAME}/v4/technologies`,
  SUBMISSION_REVIEW_APP_URL: `https://submission-review.${DOMAIN}/challenges`,
  STUDIO_URL: `https://studio.${DOMAIN}`,
  CONNECT_APP_URL: `https://connect.${DOMAIN}`,
  DIRECT_PROJECT_URL: `https://www.${DOMAIN}/direct`,
  ONLINE_REVIEW_URL: `https://software.${DOMAIN}`,
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
  CREATE_FORUM_TYPE_IDS: ['927abff4-7af9-4145-8ba1-577c16e64e2e', 'dc876fa4-ef2d-4eee-b701-b555fcc6544c', 'ecd58c69-238f-43a4-a4bb-d172719b9f31'],
  FILE_PICKER_API_KEY: process.env.FILE_PICKER_API_KEY,
  FILE_PICKER_CONTAINER_NAME: 'tc-challenge-v5-dev',
  FILE_PICKER_REGION: 'us-east-1',
  FILE_PICKER_CNAME: 'fs.topcoder.com',
  // if idle for this many minutes, show user a prompt saying they'll be logged out
  IDLE_TIMEOUT_MINUTES: 10,
  // duration to show the prompt saying user will be logged out, before actually logging out the user
  IDLE_TIMEOUT_GRACE_MINUTES: 5,
  MULTI_ROUND_CHALLENGE_TEMPLATE_ID: 'd4201ca4-8437-4d63-9957-3f7708184b07',
  UNIVERSAL_NAV_URL: '//uni-nav.topcoder-dev.com/v1/tc-universal-nav.js',
  HEADER_AUTH_URLS_HREF: `https://accounts-auth0.${DOMAIN}?utm_source=community-app-main`,
  HEADER_AUTH_URLS_LOCATION: `https://accounts-auth0.${DOMAIN}?retUrl=%S&utm_source=community-app-main`
}
