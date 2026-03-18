/**
 * Topcoder related utilities
 */
import {
  MARATHON_MATCH_SUBTRACKS,
  CHALLENGE_TRACKS,
  ALLOWED_USER_ROLES,
  ADMIN_ROLES,
  COPILOT_ROLES,
  SUBMITTER_ROLE_UUID,
  READ_ONLY_ROLES,
  ALLOWED_DOWNLOAD_SUBMISSIONS_ROLES,
  ALLOWED_EDIT_RESOURCE_ROLES,
  MANAGER_ROLES,
  PROJECT_ROLES,
  TASK_MANAGER_ROLES,
  PROJECT_MEMBER_INVITE_STATUS_PENDING
} from '../config/constants'
import _ from 'lodash'
import { decodeToken } from 'tc-auth-lib'
import { fetchResources, fetchResourceRoles } from '../services/challenges'
import store from '../config/store'

const TALENT_MANAGER_ROLES = [
  'talent manager',
  'topcoder talent manager'
]

const normalizeUserId = (userId) => {
  if (_.isNil(userId)) {
    return null
  }

  const normalizedUserId = `${userId}`.trim()
  return normalizedUserId.length > 0 ? normalizedUserId : null
}

const normalizeEmail = (email) => {
  if (_.isNil(email)) {
    return null
  }

  const normalizedEmail = `${email}`.trim().toLowerCase()
  return normalizedEmail.length > 0 ? normalizedEmail : null
}

const getProjectMember = (project, userId) => {
  const normalizedUserId = normalizeUserId(userId)

  if (
    !project ||
    _.isEmpty(project) ||
    !normalizedUserId ||
    !Array.isArray(project.members)
  ) {
    return null
  }

  return _.find(
    project.members,
    member => normalizeUserId(member.userId) === normalizedUserId
  ) || null
}

const canManageProject = (project, userId) => {
  if (!project || _.isEmpty(project)) {
    return true
  }

  return ALLOWED_EDIT_RESOURCE_ROLES.includes(
    _.get(getProjectMember(project, userId), 'role')
  )
}

export const RATING_COLORS = [
  {
    color: '#9D9FA0' /* Grey */,
    limit: 900
  },
  {
    color: '#69C329' /* Green */,
    limit: 1200
  },
  {
    color: '#616BD5' /* Blue */,
    limit: 1500
  },
  {
    color: '#FCD617' /* Yellow */,
    limit: 2200
  },
  {
    color: '#EF3A3A' /* Red */,
    limit: Infinity
  }
]

/**
 * Given user rating returns corresponding rating level (from 1 to 5, both
 * inclusive). The rating levels are used to group members into categories
 * by their performance, and to assign colors to their handles.
 * @param {Number} rating
 * @return {Number} Rating level.
 */
export function getRatingLevel (rating) {
  if (rating < 900) return 1
  if (rating < 1200) return 2
  if (rating < 1500) return 3
  if (rating < 2200) return 4
  return 5
}

/**
 * Sort list
 * @param {Array} list list need to be sorted
 */
export function sortList (list, field, sort, getValue) {
  const compare = (a, b) => {
    if (a > b) {
      return 1
    }

    if (a === b) {
      return 0
    }

    return -1
  }

  list.sort((a, b) => {
    let valueForAB = {}
    valueForAB = getValue(a, b)
    let { valueA, valueB } = valueForAB
    const { valueIsString } = valueForAB
    if (valueIsString) {
      if (_.isNil(valueA)) {
        valueA = ''
      }
      if (_.isNil(valueB)) {
        valueB = ''
      }
    } else {
      if (_.isNil(valueA)) {
        valueA = 0
      }
      if (_.isNil(valueB)) {
        valueB = 0
      }
    }
    if (sort === 'desc') {
      return compare(valueB, valueA)
    }

    return compare(valueA, valueB)
  })
}
/**
 * Given a rating value, returns corresponding color.
 * @param {Number} rating Rating.
 * @return {String} Color.
 */
export function getRatingColor (rating) {
  let i = 0
  const r = Number(rating)
  while (RATING_COLORS[i].limit <= r) i += 1
  return RATING_COLORS[i].color || 'black'
}

/**
 * ********** UNUSED ************************
 *
 * Handle special subtrack DEVELOP_MARATHON_MATCH
 * @param {String} track
 * @param {String} subTrack
 * @returns {String} track
 */
export function fixedTrack (track, subTrack) {
  return MARATHON_MATCH_SUBTRACKS.includes(subTrack)
    ? CHALLENGE_TRACKS.DATA_SCIENCE
    : track
}

/**
 * Given challenge domain (track), returns its corresponding challenge types
 * @param {String} trackId challenge trackId
 */
export const getDomainTypes = (trackId) => {
  switch (trackId) {
    case CHALLENGE_TRACKS.DEVELOP:
      return ['CH', 'F2F', 'TSK', 'SKL', 'PC', 'MM']
    case CHALLENGE_TRACKS.DATA_SCIENCE:
      return ['CH', 'F2F', 'TSK', 'SKL', 'PC', 'MA', 'MM']
    case CHALLENGE_TRACKS.QA:
      return ['CH', 'F2F', 'TSK', 'SKL', 'PC']
    case CHALLENGE_TRACKS.DESIGN:
      return ['CH', 'F2F', 'TSK', 'SKL', 'PC']
    case CHALLENGE_TRACKS.COMPETITIVE_PROGRAMMING:
      return ['CH', 'F2F', 'SKL', 'PC', 'MM', 'RDM']
    default:
      return []
  }
}

/**
 * Checks if role is present in allowed roles
 * @param  roles
 */
export const checkAllowedRoles = roles =>
  roles.some(val => ALLOWED_USER_ROLES.indexOf(val.toLowerCase()) > -1)

/**
 * Checks if read only role is present in allowed roles
 * @param  token
 */
export const checkReadOnlyRoles = token => {
  const roles = _.get(decodeToken(token), 'roles')
  if (checkAllowedRoles(roles)) {
    return false
  }
  return roles.some(val => READ_ONLY_ROLES.indexOf(val.toLowerCase()) > -1)
}

/**
 * Checks if read only role is present in roles
 * @param  token
 */
export const checkOnlyReadOnlyRoles = token => {
  const roles = _.get(decodeToken(token), 'roles')
  return roles.some(val => READ_ONLY_ROLES.indexOf(val.toLowerCase()) > -1)
}

/**
 * Checks if this role can download submission
 * @param  resourceRoles
 */
export const checkDownloadSubmissionRoles = resourceRoles => {
  return resourceRoles.some(val => ALLOWED_DOWNLOAD_SUBMISSIONS_ROLES.indexOf(val.toLowerCase()) > -1)
}

/**
 * Checks if this role can edit resources
 * @param  resourceRoles
 */
export const checkEditResourceRoles = resourceRoles => {
  return resourceRoles.some(val => _.filter(ALLOWED_EDIT_RESOURCE_ROLES, (r) => val.toLowerCase().indexOf(r) > -1).length > 0)
}

/**
 * Checks if token has any of the admin roles
 * @param  token
 */
export const checkAdmin = (token) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  return roles.some(val => ADMIN_ROLES.indexOf(val.toLowerCase()) > -1)
}

export const checkManager = (token) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  return roles.some(val => MANAGER_ROLES.indexOf(val.toLowerCase()) > -1)
}

export const checkTalentManager = (token) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  return roles.some(val => TALENT_MANAGER_ROLES.indexOf(val.toLowerCase()) > -1)
}

export const checkAdminOrTalentManager = (token) => {
  return checkAdmin(token) || checkTalentManager(token)
}

export const checkTaskManager = (token) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  return roles.some(val => TASK_MANAGER_ROLES.indexOf(val.toLowerCase()) > -1)
}

/**
 * Checks whether the caller can manage project ownership flows in Work Manager.
 *
 * Admins always qualify. Project Managers, Copilots, and Talent Managers
 * additionally need a management-capable project membership when a project
 * context is provided.
 *
 * @param  token
 * @param  project
 * @returns {boolean} Whether the caller can manage the project in the UI.
 */
export const checkCanManageProject = (token, project) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  const isAdmin = roles.some(val => ADMIN_ROLES.indexOf(val.toLowerCase()) > -1)
  const isCopilot = roles.some(val => COPILOT_ROLES.indexOf(val.toLowerCase()) > -1)
  const isManager = roles.some(val => MANAGER_ROLES.indexOf(val.toLowerCase()) > -1)
  const isTalentManager = roles.some(val => TALENT_MANAGER_ROLES.indexOf(val.toLowerCase()) > -1)
  const hasProjectManagementAccess = canManageProject(project, tokenData.userId)

  return isAdmin || ((isCopilot || isManager || isTalentManager) && hasProjectManagementAccess)
}

/**
 * Checks whether the caller may create a project in Work Manager.
 *
 * Project creation remains broader than edit permissions. Project Managers
 * should still be able to create projects even though billing-account edits
 * are limited to admins and Full Access members.
 *
 * @param  token
 * @returns {boolean} Whether the caller can create a project.
 */
export const checkCanCreateProject = (token) => {
  return checkAdmin(token) || checkManager(token) || checkCopilot(token)
}

/**
 * Checks whether the caller may edit a project's billing account.
 *
 * This is intentionally stricter than general project-management checks:
 * only admins or project members with Full Access (`manager`) qualify.
 *
 * @param  token
 * @param  project
 * @returns {boolean} Whether the caller can edit the project's billing account.
 */
export const checkCanManageProjectBillingAccount = (token, project) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles', [])
  const isAdmin = roles.some(val => ADMIN_ROLES.indexOf(val.toLowerCase()) > -1)

  if (isAdmin) {
    return true
  }

  return _.get(getProjectMember(project, tokenData.userId), 'role') === PROJECT_ROLES.MANAGER
}

export const checkProjectMembership = (project, userId) => {
  return !!getProjectMember(project, userId)
}

export const getProjectMemberRole = (project, userId) => {
  return _.get(getProjectMember(project, userId), 'role', null)
}

/**
 * Returns the matching project member for the provided user id, if present.
 *
 * @param {Object|Object[]} projectDetail Project detail payload with `members`,
 *   or a raw members array.
 * @param {String|Number} userId Authenticated user id to match.
 * @returns {Object|null} Matching member record or `null`.
 */
export const getProjectMemberByUserId = (projectDetail, userId) => {
  const normalizedUserId = normalizeUserId(userId)
  const members = Array.isArray(projectDetail)
    ? projectDetail
    : _.get(projectDetail, 'members', [])

  if (!normalizedUserId || !Array.isArray(members)) {
    return null
  }

  return _.find(
    members,
    member => normalizeUserId(member.userId) === normalizedUserId
  ) || null
}

export const checkAdminOrPmOrTaskManager = (token, project) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  const userId = tokenData.userId

  const isAdmin = roles.some(val => ADMIN_ROLES.indexOf(val.toLowerCase()) > -1)
  const isManager = roles.some(val => MANAGER_ROLES.indexOf(val.toLowerCase()) > -1)
  const isTaskManager = roles.some(val => TASK_MANAGER_ROLES.indexOf(val.toLowerCase()) > -1)

  const isProjectManager = project && !_.isEmpty(project) &&
    project.members && project.members.some(member =>
    normalizeUserId(member.userId) === normalizeUserId(userId) &&
      member.role === PROJECT_ROLES.MANAGER
  )

  return isAdmin || isManager || isTaskManager || isProjectManager
}
/**
 * Checks if token has any of the copilot roles
 * @param  token
 */
export const checkCopilot = (token, project) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  const isCopilot = roles.some(val => COPILOT_ROLES.indexOf(val.toLowerCase()) > -1)

  return isCopilot && canManageProject(project, tokenData.userId)
}

/**
 * Checks if token has any of the admin or copilot roles
 * @param  token
 */
export const checkAdminOrCopilot = (token, project) => {
  const tokenData = decodeToken(token)
  const roles = _.get(tokenData, 'roles')
  const isAdmin = roles.some(val => ADMIN_ROLES.indexOf(val.toLowerCase()) > -1)
  const isCopilot = roles.some(val => COPILOT_ROLES.indexOf(val.toLowerCase()) > -1)

  return isAdmin || (isCopilot && canManageProject(project, tokenData.userId))
}

/**
 * Checks whether the authenticated user is a member of the specified project.
 * This project-level check grants access regardless of the user's global JWT roles.
 *
 * @param {String} token JWT token for the authenticated user.
 * @param {Object} projectDetail Project detail payload that includes `members`.
 * @returns {Boolean} `true` when `projectDetail.members` contains the token's `userId`.
 */
export const checkIsProjectMember = (token, projectDetail) => {
  const tokenData = decodeToken(token)
  return !!getProjectMemberByUserId(projectDetail, _.get(tokenData, 'userId'))
}

/**
 * Checks whether the authenticated user can view the project assets library.
 *
 * Asset Library access is granted to admins, global copilots, and any member
 * of the project regardless of project role.
 *
 * @param {String} token JWT token for the authenticated user.
 * @param {Object} projectDetail Project detail payload that includes `members`.
 * @returns {Boolean} `true` when the user can view the project assets library.
 */
export const checkCanViewProjectAssets = (token, projectDetail) => {
  if (!token) {
    return false
  }

  return checkAdmin(token) || checkCopilot(token) || checkIsProjectMember(token, projectDetail)
}

/**
 * Checks if token has any of the admin, copilot, or manager roles
 * When `project` is omitted or empty, the check is based solely on the user's global JWT roles.
 * @param  token
 * @param  project
 */
export const checkAdminOrCopilotOrManager = (token, project) => {
  return checkManager(token) || checkAdminOrCopilot(token, project)
}

/**
 * Returns the authenticated user's pending invite for a project, if one exists.
 *
 * Accepted or declined historical invites are intentionally ignored so callers
 * only trigger the invitation flow for actionable invitations.
 */
export const checkIsUserInvitedToProject = (token, project) => {
  if (!token) {
    return
  }

  const tokenData = decodeToken(token)
  return project && !_.isEmpty(project) && (_.find(
    project.invites,
    d => (
      d.status === PROJECT_MEMBER_INVITE_STATUS_PENDING &&
      (
        normalizeUserId(d.userId) === normalizeUserId(tokenData.userId) ||
        normalizeEmail(d.email) === normalizeEmail(tokenData.email)
      )
    )
  ))
}

/**
 * Get resource role by name
 *
 * @param {Object[]} resourceRoles list of resource roles
 * @param {String}   name          resource role name
 *
 * @returns {Object} resource role or `null`
 */
export const getResourceRoleByName = (resourceRoles, name) => {
  // there are multiple junk resource roles with 'Submitter' name,
  // so we use `id` from config to find the correct one
  if (name === 'Submitter') {
    return _.find(resourceRoles, { id: SUBMITTER_ROLE_UUID }) || null
  } else {
    return _.find(resourceRoles, { name }) || null
  }
}

/**
 * check edit permission
 * @param {number}   challengeId  challenge Id
 *
 * @returns {boolean} hasPermission
 */
export const checkChallengeEditPermission = async challengeId => {
  const state = store.getState()
  const token = state.auth.token
  const loggedInUser = state.auth.user
  const hasProjectAccess = state.projects.hasProjectAccess

  const isAdmin = checkAdmin(token)
  if (isAdmin) {
    return true
  }
  if (!hasProjectAccess) {
    return false
  }

  return Promise.all([fetchResources(challengeId), fetchResourceRoles()]).then(
    ([challengeResources, resourceRoles]) => {
      const userRoles = _.filter(
        challengeResources,
        cr => cr.memberId === `${loggedInUser.userId}`
      )
      const userResourceRoles = _.filter(resourceRoles, rr =>
        _.some(userRoles, ur => ur.roleId === rr.id)
      )
      return _.some(
        userResourceRoles,
        urr => urr.fullWriteAccess && urr.isActive
      )
    }
  )
}

/**
 * Get provisional score of submission
 * @param submission
 */
export function getProvisionalScore (submission) {
  const { submissions: subs } = submission
  if (!subs || subs.length === 0) {
    return 0
  }
  const { provisionalScore } = subs[0]
  if (!provisionalScore || provisionalScore < 0) {
    return 0
  }
  return provisionalScore
}

/**
 * Get final score of submission
 * @param submission
 */
export function getFinalScore (submission) {
  const { submissions: subs } = submission
  if (!subs || subs.length === 0) {
    return 0
  }
  const { finalScore } = subs[0]
  if (!finalScore || finalScore < 0) {
    return 0
  }
  return finalScore
}

/**
 * Get challenge type abbreviation
 * @param {Object} challenge challenge info
 */
export function getChallengeTypeAbbr (typeOrName, challengeTypes) {
  const typeName = typeof typeOrName === 'string' ? typeOrName : _.get(typeOrName, 'name')
  const type = _.find(
    challengeTypes,
    (t) => t.name === typeName || t.id === _.get(typeOrName, 'id') || t.abbreviation === _.get(typeOrName, 'abbreviation')
  )
  if (type) {
    return type.abbreviation
  }
  return null
}

/**
 * Check if challenge is 2 rounds challenge or not
 * @param {Object} challenge challenge info
 */
export function is2RoundsChallenge (challenge) {
  return !!_.find(challenge.phases, { name: 'Checkpoint Submission' })
}

/**
 * Get full name of user
 * @param {Object} user user info
 * @returns
 */
export function getFullNameWithFallback (user) {
  if (!user) return ''
  let userFullName = user.firstName
  if (userFullName && user.lastName) {
    userFullName += ' ' + user.lastName
  }
  userFullName =
    userFullName && userFullName.trim().length > 0 ? userFullName : user.handle
  userFullName =
    userFullName && userFullName.trim().length > 0
      ? userFullName
      : 'Connect user'
  return userFullName
}
