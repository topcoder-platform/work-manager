const DOMAIN = 'topcoder.com'
const PROD_API_HOSTNAME = `https://api.${DOMAIN}`

module.exports = {
  ACCOUNTS_APP_CONNECTOR_URL: process.env.ACCOUNTS_APP_CONNECTOR_URL || `https://accounts-auth0.${DOMAIN}`,
  ACCOUNTS_APP_LOGIN_URL: `https://accounts-auth0.${DOMAIN}`,
  COMMUNITY_APP_URL: `https://www.${DOMAIN}`,
  MEMBER_API_URL: `${PROD_API_HOSTNAME}/v4/members`,
  MEMBER_API_V3_URL: `${PROD_API_HOSTNAME}/v3/members`,
  CHALLENGE_API_URL: `${PROD_API_HOSTNAME}/v5/challenges`,
  CHALLENGE_TIMELINE_TEMPLATES_URL: `${PROD_API_HOSTNAME}/v5/timeline-templates`,
  CHALLENGE_TYPES_URL: `${PROD_API_HOSTNAME}/v5/challenge-types`,
  CHALLENGE_TRACKS_URL: `${PROD_API_HOSTNAME}/v5/challenge-tracks`,
  CHALLENGE_PHASES_URL: `${PROD_API_HOSTNAME}/v5/challenge-phases`,
  CHALLENGE_TIMELINES_URL: `${PROD_API_HOSTNAME}/v5/challenge-timelines`,
  PROJECT_API_URL: `${PROD_API_HOSTNAME}/v5/projects`,
  GROUPS_API_URL: `${PROD_API_HOSTNAME}/v5/groups`,
  TERMS_API_URL: `${PROD_API_HOSTNAME}/v5/terms`,
  RESOURCES_API_URL: `${PROD_API_HOSTNAME}/v5/resources`,
  RESOURCE_ROLES_API_URL: `${PROD_API_HOSTNAME}/v5/resource-roles`,
  SUBMISSIONS_API_URL: `${PROD_API_HOSTNAME}/v5/submissions`,
  PLATFORMS_V4_API_URL: `${PROD_API_HOSTNAME}/v4/platforms`,
  TECHNOLOGIES_V4_API_URL: `${PROD_API_HOSTNAME}/v4/technologies`,
  SUBMISSION_REVIEW_APP_URL: `https://submission-review.${DOMAIN}/challenges`,
  STUDIO_URL: `https://studio.${DOMAIN}`,
  CONNECT_APP_URL: `https://connect.${DOMAIN}`,
  DIRECT_PROJECT_URL: `https://www.${DOMAIN}/direct`,
  ONLINE_REVIEW_URL: `https://software.${DOMAIN}`,
  SUBMISSION_REVIEW_URL: `https://submission-review.${DOMAIN}/challenges`,
  DEFAULT_TERM_UUID: '564a981e-6840-4a5c-894e-d5ad22e9cd6f', // Terms & Conditions of Use at TopCoder
  DEFAULT_NDA_UUID: 'c41e90e5-4d0e-4811-bd09-38ff72674490', // Appirio NDA v2.0
  SUBMITTER_ROLE_UUID: '732339e7-8e30-49d7-9198-cccf9451e221',
  DEV_TRACK_ID: '9b6fc876-f4d9-4ccb-9dfd-419247628825',
  DES_TRACK_ID: '5fa04185-041f-49a6-bfd1-fe82533cd6c8',
  DS_TRACK_ID: 'c0f5d461-8219-4c14-878a-c3a3f356466d',
  QA_TRACK_ID: '36e6a8d0-7e1e-4608-a673-64279d99c115',
  CHALLENGE_TYPE_ID: '927abff4-7af9-4145-8ba1-577c16e64e2e',
  SEGMENT_API_KEY: 'QSQAW5BWmZfLoKFNRgNKaqHvLDLJoGqF',
  CREATE_FORUM_TYPE_IDS: ['927abff4-7af9-4145-8ba1-577c16e64e2e', 'dc876fa4-ef2d-4eee-b701-b555fcc6544c'],
  FILE_PICKER_API_KEY: process.env.FILE_PICKER_API_KEY,
  FILE_PICKER_CONTAINER_NAME: 'tc-challenge-v5-prod',
  FILE_PICKER_REGION: 'us-east-1',
  FILE_PICKER_CNAME: 'fs.topcoder.com'
}
