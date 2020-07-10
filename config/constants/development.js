const DOMAIN = 'topcoder-dev.com'
const DEV_API_HOSTNAME = `https://api.${DOMAIN}`

module.exports = {
  ACCOUNTS_APP_CONNECTOR_URL: `https://accounts.${DOMAIN}/connector.html`,
  ACCOUNTS_APP_LOGIN_URL: `https://accounts.${DOMAIN}/member`,
  COMMUNITY_APP_URL: `https://www.${DOMAIN}`,
  MEMBER_API_URL: `${DEV_API_HOSTNAME}/v4/members`,
  MEMBER_API_V3_URL: `${DEV_API_HOSTNAME}/v3/members`,
  DEV_APP_URL: `http://local.${DOMAIN}`,
  CHALLENGE_API_URL: `${DEV_API_HOSTNAME}/v5/challenges`,
  CHALLENGE_TIMELINE_TEMPLATES_URL: `${DEV_API_HOSTNAME}/v5/timeline-templates`,
  CHALLENGE_TYPES_URL: `${DEV_API_HOSTNAME}/v5/challenge-types`,
  CHALLENGE_PHASES_URL: `${DEV_API_HOSTNAME}/v5/challenge-phases`,
  CHALLENGE_TIMELINES_URL: `${DEV_API_HOSTNAME}/v5/challenge-timelines`,
  PROJECT_API_URL: `${DEV_API_HOSTNAME}/v5/projects`,
  GROUPS_API_URL: `${DEV_API_HOSTNAME}/v5/groups`,
  TERMS_API_URL: `${DEV_API_HOSTNAME}/v5/terms`,
  RESOURCES_API_URL: `${DEV_API_HOSTNAME}/v5/resources`,
  RESOURCE_ROLES_API_URL: `${DEV_API_HOSTNAME}/v5/resource-roles`,
  PLATFORMS_V4_API_URL: `${DEV_API_HOSTNAME}/v4/platforms`,
  TECHNOLOGIES_V4_API_URL: `${DEV_API_HOSTNAME}/v4/technologies`,
  CONNECT_APP_URL: `https://connect.${DOMAIN}`,
  DIRECT_PROJECT_URL: `https://www.${DOMAIN}/direct`,
  ONLINE_REVIEW_URL: `https://software.${DOMAIN}`,
  DEFAULT_TERM_UUID: 'ae6fc4ff-3bd1-4e3f-a987-cc60ab94b422', // Terms & Conditions of Use at TopCoder
  DEFAULT_NDA_UUID: '7245bb7d-d7c9-45a0-9603-d5ff05af0977', // Appirio NDA v2.0
  SUBMITTER_ROLE_UUID: '732339e7-8e30-49d7-9198-cccf9451e221'
}
