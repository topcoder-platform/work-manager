import _ from 'lodash'
import {
  fetchEngagements,
  fetchEngagement,
  createEngagement as createEngagementAPI,
  updateEngagement as updateEngagementAPI,
  patchEngagement,
  deleteEngagement as deleteEngagementAPI
} from '../services/engagements'
import { fetchProjectById } from '../services/projects'
import { fetchSkillsByIds } from '../services/skills'
import {
  normalizeEngagement,
  normalizeEngagements,
  toEngagementStatusApi
} from '../util/engagements'
import { paginationHeaders } from '../util/pagination'
import {
  ENGAGEMENTS_PAGE_SIZE,
  LOAD_ENGAGEMENTS_PENDING,
  LOAD_ENGAGEMENTS_SUCCESS,
  LOAD_ENGAGEMENTS_FAILURE,
  LOAD_ENGAGEMENT_DETAILS_PENDING,
  LOAD_ENGAGEMENT_DETAILS_SUCCESS,
  LOAD_ENGAGEMENT_DETAILS_FAILURE,
  CREATE_ENGAGEMENT_PENDING,
  CREATE_ENGAGEMENT_SUCCESS,
  CREATE_ENGAGEMENT_FAILURE,
  UPDATE_ENGAGEMENT_DETAILS_PENDING,
  UPDATE_ENGAGEMENT_DETAILS_SUCCESS,
  UPDATE_ENGAGEMENT_DETAILS_FAILURE,
  DELETE_ENGAGEMENT_PENDING,
  DELETE_ENGAGEMENT_SUCCESS,
  DELETE_ENGAGEMENT_FAILURE
} from '../config/constants'

const projectNameCache = {}

const getSkillId = (skill) => {
  if (!skill) {
    return null
  }
  if (typeof skill === 'string') {
    return skill
  }
  return skill.id || skill.value || null
}

const getEngagementSkills = (engagement) => {
  if (!engagement) {
    return []
  }
  const skills = Array.isArray(engagement.skills) ? engagement.skills : []
  if (skills.length) {
    return skills
  }
  return Array.isArray(engagement.requiredSkills) ? engagement.requiredSkills : []
}

const buildSkillsMap = (skills = []) => (
  skills.reduce((acc, skill) => {
    if (skill && skill.id) {
      acc[skill.id] = skill
    }
    return acc
  }, {})
)

const withSkillDetails = (engagement, skillsMap) => {
  if (!engagement) {
    return engagement
  }
  const skills = getEngagementSkills(engagement)
    .map((skill) => {
      const id = getSkillId(skill)
      if (!id) {
        return null
      }
      const mapped = skillsMap[id]
      const rawName = skill && typeof skill === 'object' ? (skill.name || skill.label) : null
      const name = rawName && rawName !== id
        ? rawName
        : (mapped && mapped.name) || 'Unknown skill'
      return {
        ...(mapped || {}),
        ...(skill && typeof skill === 'object' ? skill : {}),
        id,
        name
      }
    })
    .filter(Boolean)

  return {
    ...engagement,
    skills
  }
}

const getProjectId = (engagement) => {
  if (!engagement || !engagement.projectId) {
    return null
  }
  return String(engagement.projectId)
}

const getProjectName = (project) => {
  if (!project || typeof project !== 'object') {
    return null
  }
  if (typeof project.name === 'string' && project.name.trim()) {
    return project.name
  }
  if (typeof project.projectName === 'string' && project.projectName.trim()) {
    return project.projectName
  }
  return null
}

const hydrateEngagementProjectNames = async (engagements = []) => {
  if (!Array.isArray(engagements) || !engagements.length) {
    return []
  }

  const projectIds = Array.from(new Set(
    engagements
      .map(getProjectId)
      .filter(Boolean)
  ))

  if (!projectIds.length) {
    return engagements
  }

  const uncachedProjectIds = projectIds.filter((projectId) => !projectNameCache[projectId])
  if (uncachedProjectIds.length) {
    const projectNameEntries = await Promise.all(
      uncachedProjectIds.map(async (projectId) => {
        try {
          const project = await fetchProjectById(projectId)
          return [projectId, getProjectName(project)]
        } catch (error) {
          return [projectId, null]
        }
      })
    )

    projectNameEntries.forEach(([projectId, projectName]) => {
      if (projectName) {
        projectNameCache[projectId] = projectName
      }
    })
  }

  return engagements.map((engagement) => {
    const projectId = getProjectId(engagement)
    return {
      ...engagement,
      projectName: (projectId && projectNameCache[projectId]) || engagement.projectName || null
    }
  })
}

const hydrateEngagementSkills = async (engagements = []) => {
  if (!Array.isArray(engagements) || !engagements.length) {
    return []
  }

  const skillIds = new Set()
  engagements.forEach((engagement) => {
    getEngagementSkills(engagement).forEach((skill) => {
      const id = getSkillId(skill)
      if (id) {
        skillIds.add(id)
      }
    })
  })

  const uniqueIds = Array.from(skillIds)
  if (!uniqueIds.length) {
    return engagements.map((engagement) => withSkillDetails(engagement, {}))
  }

  try {
    const skills = await fetchSkillsByIds(uniqueIds)
    const skillsMap = buildSkillsMap(skills)
    return engagements.map((engagement) => withSkillDetails(engagement, skillsMap))
  } catch (error) {
    return engagements.map((engagement) => withSkillDetails(engagement, {}))
  }
}

/**
 * Loads engagements for a project
 * @param {String|Number} projectId
 * @param {String} status
 * @param {String} filterName
 * @param {Boolean} includePrivate
 */
export function loadEngagements (projectId, status = 'all', filterName = '', includePrivate = false) {
  return async (dispatch) => {
    dispatch({
      type: LOAD_ENGAGEMENTS_PENDING
    })

    const filters = {}
    if (projectId) {
      filters.projectId = projectId
    }
    if (status && status !== 'all') {
      filters.status = toEngagementStatusApi(status)
    }
    if (!_.isEmpty(filterName)) {
      filters.title = filterName
    }
    if (includePrivate) {
      filters.includePrivate = true
    }

    try {
      const engagements = []
      let page = 1
      let totalPages
      let perPage = ENGAGEMENTS_PAGE_SIZE

      do {
        const response = await fetchEngagements(filters, { page, perPage })
        const responseData = _.get(response, 'data', [])
        const nestedData = _.get(responseData, 'data', [])
        const pageEngagements = Array.isArray(responseData)
          ? responseData
          : Array.isArray(nestedData)
            ? nestedData
            : []
        const meta = _.get(responseData, 'meta', {})
        const headers = paginationHeaders(response)
        const metaPerPage = Number(meta.perPage)
        const metaTotalPages = Number(meta.totalPages)
        const metaTotalCount = Number(meta.totalCount)
        const metaPage = Number(meta.page)
        const headerPerPage = Number.isFinite(headers.xPerPage) ? headers.xPerPage : undefined
        const headerTotalPages = Number.isFinite(headers.xTotalPages) ? headers.xTotalPages : undefined
        const headerTotal = Number.isFinite(headers.xTotal) ? headers.xTotal : undefined
        const headerPage = Number.isFinite(headers.xPage) ? headers.xPage : undefined
        const resolvedPerPage = Number.isFinite(metaPerPage) ? metaPerPage : (headerPerPage || perPage)
        const resolvedTotalPages = Number.isFinite(metaTotalPages)
          ? metaTotalPages
          : (headerTotalPages || (headerTotal && resolvedPerPage ? Math.ceil(headerTotal / resolvedPerPage) : undefined))
        const hasPagingMeta = Number.isFinite(metaPerPage) ||
          Number.isFinite(metaTotalPages) ||
          Number.isFinite(metaTotalCount) ||
          Number.isFinite(metaPage) ||
          Number.isFinite(headerPerPage) ||
          Number.isFinite(headerTotalPages) ||
          Number.isFinite(headerTotal) ||
          Number.isFinite(headerPage)

        engagements.push(...pageEngagements)
        perPage = resolvedPerPage || perPage
        totalPages = resolvedTotalPages

        if (!hasPagingMeta) {
          break
        }

        if (totalPages) {
          page += 1
        } else {
          page += 1
          if (pageEngagements.length < perPage) {
            break
          }
        }
      } while (!totalPages || page <= totalPages)

      const hydratedEngagements = await hydrateEngagementSkills(engagements)
      const engagementsWithProjectNames = await hydrateEngagementProjectNames(hydratedEngagements)
      const normalizedEngagements = normalizeEngagements(engagementsWithProjectNames)
      dispatch({
        type: LOAD_ENGAGEMENTS_SUCCESS,
        engagements: normalizedEngagements
      })
    } catch (error) {
      dispatch({
        type: LOAD_ENGAGEMENTS_FAILURE,
        error
      })
    }
  }
}

/**
 * Loads engagement details
 * @param {String|Number} projectId
 * @param {String|Number} engagementId
 */
export function loadEngagementDetails (projectId, engagementId) {
  return async (dispatch) => {
    void projectId
    if (!engagementId) {
      return dispatch({
        type: LOAD_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails: {}
      })
    }

    dispatch({
      type: LOAD_ENGAGEMENT_DETAILS_PENDING
    })

    try {
      const response = await fetchEngagement(engagementId)
      const [hydratedEngagement] = await hydrateEngagementSkills([_.get(response, 'data', {})])
      const engagementDetails = normalizeEngagement(hydratedEngagement || {})
      return dispatch({
        type: LOAD_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails
      })
    } catch (error) {
      dispatch({
        type: LOAD_ENGAGEMENT_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Creates engagement
 * @param {Object} engagementDetails
 * @param {String|Number} projectId
 */
export function createEngagement (engagementDetails, projectId) {
  return async (dispatch) => {
    dispatch({
      type: CREATE_ENGAGEMENT_PENDING
    })

    if (!projectId) {
      const error = new Error('Project ID is required to create engagement.')
      dispatch({
        type: CREATE_ENGAGEMENT_FAILURE,
        error
      })
      return Promise.reject(error)
    }

    const payload = {
      ...engagementDetails,
      projectId: String(projectId)
    }

    try {
      const response = await createEngagementAPI(payload)
      const [hydratedEngagement] = await hydrateEngagementSkills([_.get(response, 'data', {})])
      const engagementDetails = normalizeEngagement(hydratedEngagement || {})
      return dispatch({
        type: CREATE_ENGAGEMENT_SUCCESS,
        engagementDetails
      })
    } catch (error) {
      dispatch({
        type: CREATE_ENGAGEMENT_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Updates engagement details
 * @param {String|Number} engagementId
 * @param {Object} engagementDetails
 * @param {String|Number} projectId
 */
export function updateEngagementDetails (engagementId, engagementDetails, projectId) {
  return async (dispatch) => {
    void projectId
    dispatch({
      type: UPDATE_ENGAGEMENT_DETAILS_PENDING
    })

    try {
      const response = await updateEngagementAPI(engagementId, engagementDetails)
      const [hydratedEngagement] = await hydrateEngagementSkills([_.get(response, 'data', {})])
      const updatedDetails = normalizeEngagement(hydratedEngagement || {})
      return dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails: updatedDetails
      })
    } catch (error) {
      dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Partially updates engagement details
 * @param {String|Number} engagementId
 * @param {Object} partialDetails
 * @param {String|Number} projectId
 */
export function partiallyUpdateEngagementDetails (engagementId, partialDetails, projectId) {
  return async (dispatch) => {
    void projectId
    dispatch({
      type: UPDATE_ENGAGEMENT_DETAILS_PENDING
    })

    try {
      const response = await patchEngagement(engagementId, partialDetails)
      const [hydratedEngagement] = await hydrateEngagementSkills([_.get(response, 'data', {})])
      const updatedDetails = normalizeEngagement(hydratedEngagement || {})
      return dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_SUCCESS,
        engagementDetails: updatedDetails
      })
    } catch (error) {
      dispatch({
        type: UPDATE_ENGAGEMENT_DETAILS_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}

/**
 * Deletes engagement
 * @param {String|Number} engagementId
 * @param {String|Number} projectId
 */
export function deleteEngagement (engagementId, projectId) {
  return async (dispatch) => {
    void projectId
    dispatch({
      type: DELETE_ENGAGEMENT_PENDING
    })

    try {
      const response = await deleteEngagementAPI(engagementId)
      const [hydratedEngagement] = await hydrateEngagementSkills([_.get(response, 'data', {})])
      const engagementDetails = normalizeEngagement(hydratedEngagement || {})
      return dispatch({
        type: DELETE_ENGAGEMENT_SUCCESS,
        engagementDetails,
        engagementId
      })
    } catch (error) {
      dispatch({
        type: DELETE_ENGAGEMENT_FAILURE,
        error
      })
      return Promise.reject(error)
    }
  }
}
