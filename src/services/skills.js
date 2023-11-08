import _ from 'lodash'
import {
  SKILLS_V5_API_URL
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
