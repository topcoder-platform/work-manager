import _ from 'lodash'
import {
  SKILLS_V5_API_URL,
  SKILLS_V5_SKILLS_URL
} from '../config/constants'
import { axiosInstance } from './axiosWithAuth'
import * as queryString from 'query-string'

/**
 * Api request for fetching skills
 *
 * @param {String} term search key
 *
 * @returns {Promise<*>}
 */
export async function searchSkills (term) {
  const skills = await axiosInstance.get(`${SKILLS_V5_API_URL}?${queryString.stringify({
    term
  })}`)
  return _.get(skills, 'data', [])
}

export async function fetchSkillsByIds (skillIds = []) {
  const ids = Array.isArray(skillIds) ? skillIds : [skillIds]
  const uniqueIds = _.uniq(ids.filter(Boolean))
  if (!uniqueIds.length) {
    return []
  }
  const query = queryString.stringify({
    skillId: uniqueIds,
    disablePagination: true
  })
  const skills = await axiosInstance.get(`${SKILLS_V5_SKILLS_URL}?${query}`)
  return _.get(skills, 'data', [])
}
