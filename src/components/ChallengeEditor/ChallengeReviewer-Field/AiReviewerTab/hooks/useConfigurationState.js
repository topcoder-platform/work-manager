import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchAIReviewConfigByChallenge, createAIReviewConfig, updateAIReviewConfig, deleteAIReviewConfig } from '../../../../../services/aiReviewConfigs';
import { validateConfigData, configHasChanges } from '../../../../../services/aiReviewConfigHelpers';
import { toastFailure } from '../../../../../util/toaster';

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
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedConfigRef = useRef(initialConfig)
  const saveTimeoutRef = useRef(null)
  const configId = configuration?.id;

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
      id: configId,
      mode: template.mode || 'AI_GATING',
      minPassingThreshold: template.minPassingThreshold || 75,
      autoFinalize: template.autoFinalize || false,
      workflows: template.workflows || [],
      templateId: template.id || '',
    }

    setConfiguration(newConfiguration)
  }, [setConfiguration, configId])


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
            setConfiguration(config)
            lastSavedConfigRef.current = config
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

  /**
   * Autosave configuration changes with debouncing
   */
  useEffect(() => {
    // Only autosave if configuration mode is set (meaning user has started configuring)
    if (!configurationMode || !challengeId) {
      return
    }

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Check if there are changes
    if (!configHasChanges(lastSavedConfigRef.current, configuration)) {
      return
    }

    // Debounce save by 1.5 seconds
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true)

      try {
        // Prepare config data for saving
        const configData = {
          challengeId,
          mode: configuration.mode,
          minPassingThreshold: configuration.minPassingThreshold,
          autoFinalize: configuration.autoFinalize,
          workflows: configuration.workflows,
          templateId: configuration.templateId
        }

        // Validate before saving
        const validation = validateConfigData(configData)
        if (!validation.isValid) {
          console.warn('Configuration validation warnings:', validation.errors)
          // Don't save - let user continue editing
          return;
        }

        let savedConfig
        if (!configId) {
          // Create new config
          savedConfig = await createAIReviewConfig(configData)
          updateConfiguration('id', savedConfig.id)
        } else {
          // Update existing config
          await updateAIReviewConfig(configId, configData)
          savedConfig = configData
        }

        // Update the last saved config reference
        lastSavedConfigRef.current = savedConfig
      } catch (error) {
        console.error('Error autosaving AI review configuration:', error)
        toastFailure(`⚠️ Autosave error: ${error.message}`)
        // Don't re-throw - let component continue functioning
      } finally {
        setIsSaving(false)
      }
    }, 1500)

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [configuration, configurationMode, challengeId, configId])

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
    applyTemplate,
    isSaving,
    configId
  }
}

export default useConfigurationState
