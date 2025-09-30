/* global fetch */

import { SUBMISSIONS_API_URL } from '../config/constants'

const SUBMISSIONS_BASE_URL = SUBMISSIONS_API_URL.replace(/\/$/, '')

const buildHeaders = (token, extraHeaders = {}) => {
  const headers = { ...extraHeaders }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const handleJsonResponse = async (response) => {
  if (!response.ok) {
    const error = new Error(response.statusText || 'Request failed')
    error.status = response.status
    try {
      error.data = await response.json()
    } catch (err) {
      error.data = null
    }
    throw error
  }
  return response.json()
}

const handleBlobResponse = async (response) => {
  if (!response.ok) {
    const error = new Error(response.statusText || 'Request failed')
    error.status = response.status
    throw error
  }
  return response.blob()
}

const fetchWithAuth = (token, path, options = {}) => {
  const headers = buildHeaders(token, options.headers)
  return fetch(`${SUBMISSIONS_BASE_URL}${path}`, {
    ...options,
    headers
  })
}

export const getSubmissionsService = (token) => ({
  async getSubmissionArtifacts (submissionId) {
    const response = await fetchWithAuth(token, `/${submissionId}/artifacts`)
    return handleJsonResponse(response)
  },

  async downloadSubmissionArtifact (submissionId, fileName) {
    const encodedFileName = encodeURIComponent(fileName)
    const response = await fetchWithAuth(token, `/${submissionId}/artifacts/${encodedFileName}/download`, {
      headers: {
        Accept: 'application/zip, application/octet-stream'
      }
    })
    return handleBlobResponse(response)
  },

  async getSubmissionInformation (submissionId) {
    const response = await fetchWithAuth(token, `/${submissionId}`)
    return handleJsonResponse(response)
  },

  async downloadSubmission (submissionId) {
    const response = await fetchWithAuth(token, `/${submissionId}/download`, {
      headers: {
        Accept: 'application/zip, application/octet-stream'
      }
    })
    return handleBlobResponse(response)
  }
})

export default getSubmissionsService
