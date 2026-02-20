import { useState, useCallback, useEffect } from 'react'
import { fetchAIReviewConfigByChallenge } from '../../../../../services/aiReviewConfigs';

/**
 * Custom hook for managing AI Review configuration state
 * Handles configuration object with mode, threshold, autoFinalize, and workflows
 */
const useConfigurationState = (
  challengeId,
  initialConfig = {
    mode: 'AI_GATING',
    minPassingThreshold: 75,
    autoFinalize: false,
    workflows: []
  },
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [configuration, setConfiguration] = useState(initialConfig)
  const [configurationMode, setConfigurationMode] = useState(null)

  /**
   * Update a single field in the configuration
   */
  const updateConfiguration = useCallback((field, value) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  /**
   * Add a new workflow to the configuration
   */
  const addWorkflow = useCallback(() => {
    setConfiguration(prev => ({
      ...prev,
      workflows: prev.workflows.concat([
        { workflowId: '', weightPercent: 0, isGating: false }
      ])
    }))
  }, [setConfiguration])

  /**
   * Update a specific workflow in the configuration
   */
  const updateWorkflow = useCallback((index, field, value) => {
    setConfiguration(prev => {
      const workflows = prev.workflows.map((workflow, idx) => {
        if (idx !== index) {
          return workflow
        }

        const nextWorkflow = {
          ...workflow,
          [field]: value
        }

        // Reset weight if workflow becomes gating
        if (field === 'isGating' && value) {
          nextWorkflow.weightPercent = 0
        }

        return nextWorkflow
      })

      return {
        ...prev,
        workflows
      }
    })
  }, [setConfiguration])

  /**
   * Remove a workflow from the configuration
   */
  const removeWorkflow = useCallback((index) => {
    setConfiguration(prev => ({
      ...prev,
      workflows: prev.workflows.filter((_, idx) => idx !== index)
    }))
  }, [setConfiguration])

  /**
   * Reset configuration to default or provided state
   */
  const resetConfiguration = useCallback((newConfig = initialConfig) => {
    setConfiguration(newConfig)
  }, [setConfiguration])

  /**
   * Apply a template to the configuration
   */
  const applyTemplate = useCallback((template) => {
    if (!template) return

    const newConfiguration = {
      mode: template.mode || 'AI_GATING',
      minPassingThreshold: template.minPassingThreshold || 75,
      autoFinalize: template.autoFinalize || false,
      workflows: template.workflows || []
    }

    setConfiguration(newConfiguration)
  }, [setConfiguration])


  // Fetch AI review config when component loads
  useEffect(() => {
    const loadAIReviewConfig = async () => {
      setIsLoading(true);
      try {
        if (challengeId) {
          const config = await fetchAIReviewConfigByChallenge(challengeId)
          if (config) {
            // Load the config into the configuration state
            setConfigurationMode(config.templateId ? 'template' : 'manual')
            resetConfiguration(config)
          }
        }
      } catch (err) {
        console.error('Error loading AI review configuration:', err)
      } finally {
        setIsLoading(false);
      }
    }

    loadAIReviewConfig()
  }, [challengeId, updateConfiguration])

  return {
    isLoading,
    configuration,
    configurationMode,
    setConfigurationMode,
    updateConfiguration,
    addWorkflow,
    updateWorkflow,
    removeWorkflow,
    resetConfiguration,
    applyTemplate
  }
}

export default useConfigurationState
