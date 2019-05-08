import { axiosInstance } from './axiosWithAuth'
import { SUBMISSION_REVIEW_API_URL } from '../config/constants'

/**
 * Api request for fetching challenge submissions
 * @param challengeId
 * @returns {Promise<*>}
 */
export async function fetchChallengeSubmissions (challengeId) {
  const response = await axiosInstance.get(`${SUBMISSION_REVIEW_API_URL}/challengeSubmissions?challengeId=${challengeId}`)
  return response.data
}

/**
 * Api request for fetching submission reviews
 * @param {String} submissionId - UUID of the submission
 * @returns {Promise<*>}
 */
export async function fetchSubmissionReviews (submissionId) {
  const response = await axiosInstance.get(`${SUBMISSION_REVIEW_API_URL}/challengeSubmissions/${submissionId}/reviews`)
  return response.data
}

/**
 * Api request for fetching submission artifacts
 * @param {String} submissionId - UUID of the submission
 * @returns {Promise<*>}
 */
export async function fetchSubmissionArtifacts (submissionId) {
  const response = await axiosInstance.get(`${SUBMISSION_REVIEW_API_URL}/challengeSubmissions/${submissionId}/artifacts`)
  return response.data
}
