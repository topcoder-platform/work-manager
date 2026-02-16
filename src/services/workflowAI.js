import {
  TC_AI_API_BASE_URL,
  TC_AI_SKILLS_EXTRACTION_WORKFLOW_ID,
  AI_WORKFLOW_POLL_INTERVAL,
  AI_WORKFLOW_POLL_TIMEOUT
} from '../config/constants'

import { axiosInstance } from './axiosWithAuth'

/**
 * Start an AI workflow run
 *
 * @param {String} workflowId - The ID of the workflow to run
 * @param {String} input - The input data for the workflow
 * @returns {Promise<String>} - The run ID
 */
async function startWorkflowRun (workflowId, input) {
  try {
    // Step 1: Create the run
    const runResponse = await axiosInstance.post(
      `${TC_AI_API_BASE_URL}/workflows/${workflowId}/create-run`
    )
    const runId = runResponse.data && runResponse.data.runId

    if (!runId) {
      throw new Error('No runId returned from workflow creation')
    }

    // Step 2: Start the run with input
    await axiosInstance.post(
      `${TC_AI_API_BASE_URL}/workflows/${workflowId}/start?runId=${runId}`,
      { inputData: { jobDescription: input } }
    )

    return runId
  } catch (error) {
    console.error('Failed to start workflow run:', error.message)
    throw error
  }
}

/**
 * Poll for workflow run status
 *
 * @param {String} workflowId - The ID of the workflow
 * @param {String} runId - The ID of the run to check
 * @param {Number} maxAttempts - Maximum polling attempts
 * @returns {Promise<Object>} - The final run result
 */
async function pollWorkflowRunStatus (workflowId, runId, maxAttempts = null) {
  const pollInterval = AI_WORKFLOW_POLL_INTERVAL
  const pollTimeout = AI_WORKFLOW_POLL_TIMEOUT

  // Calculate max attempts based on timeout if not provided
  if (maxAttempts === null) {
    maxAttempts = Math.ceil(pollTimeout / pollInterval)
  }

  let attempt = 0
  const startTime = Date.now()

  while (attempt < maxAttempts) {
    try {
      const response = await axiosInstance.get(
        `${TC_AI_API_BASE_URL}/workflows/${workflowId}/runs/${runId}`
      )

      const result = response.data || {}
      const status = result.status

      if (status === 'success') {
        return result
      }

      if (status === 'failed') {
        const errorMsg = (result.error && result.error.message) || 'Workflow execution failed'
        throw new Error(`Workflow failed: ${errorMsg}`)
      }

      const elapsed = Date.now() - startTime
      if (elapsed > pollTimeout) {
        throw new Error(`Workflow polling timeout after ${elapsed}ms`)
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval))
      attempt++
    } catch (error) {
      // If it's a network error or timeout, try again
      if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
        const elapsed = Date.now() - startTime
        if (elapsed > pollTimeout) {
          throw new Error(`Workflow polling timeout after ${elapsed}ms`)
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        attempt++
      } else {
        // For other errors, re-throw immediately
        console.error('Error polling workflow status:', error.message)
        throw error
      }
    }
  }

  throw new Error(`Workflow polling exceeded maximum attempts (${maxAttempts})`)
}

/**
 * Extract skills from text using AI workflow
 *
 * @example
 * try {
 *   const result = await extractSkillsFromText('I have experience with JavaScript, React, and Node.js')
 *   console.log('Extracted skills:', result.matches) // {id: string; name: string}[]
 * } catch (error) {
 *   console.error('Skills extraction failed:', error.message)
 * }
 */
export async function extractSkillsFromText (description, workflowId = null) {
  if (!description || typeof description !== 'string') {
    throw new Error('Description must be a non-empty string')
  }

  const workflowIdToUse = workflowId || TC_AI_SKILLS_EXTRACTION_WORKFLOW_ID

  try {
    // Step 1: Start the workflow run
    console.log(`Starting workflow run for: ${workflowIdToUse}`)
    const runId = await startWorkflowRun(workflowIdToUse, description)
    console.log(`Workflow started with runId: ${runId}`)

    // Step 2: Poll for completion
    console.log('Polling for workflow completion...')
    const result = await pollWorkflowRunStatus(workflowIdToUse, runId)
    console.log('Workflow completed successfully')

    return result.result || {}
  } catch (error) {
    console.error('Skills extraction workflow failed:', error.message)
    throw error
  }
}
