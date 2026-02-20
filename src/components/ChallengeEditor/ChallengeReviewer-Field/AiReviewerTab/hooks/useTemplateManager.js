import { useState, useMemo, useCallback, useEffect } from 'react'
import { createTemplateManager } from '../../../../../services/aiReviewTemplateHelpers'

/**
 * Custom hook for managing AI Review templates
 * Handles template loading, selection, and state management
 */
const useTemplateManager = (templateId, challengeTrack, challengeType) => {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState()
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [error, setError] = useState(null)

  const templateManager = useMemo(() => createTemplateManager(true), [])

  /**
   * Select a template by ID
   */
  const selectTemplate = useCallback((templateId) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
    return template || null
  }, [templates, setSelectedTemplate])

  /**
   * Clear selected template
   */
  const clearSelection = useCallback(() => {
    setSelectedTemplate(null)
  }, [setSelectedTemplate])

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setTemplates([])
    setSelectedTemplate(null)
    setTemplatesLoading(false)
    setError(null)
  }, [setTemplates, setSelectedTemplate, setTemplatesLoading, setError])

  useEffect(() => {
    selectTemplate(templateId);
  }, [selectTemplate, templateId]);

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    setError(null)

    try {
      const fetchedTemplates = await templateManager.fetchAll({
        challengeTrack,
        challengeType
      })

      setTemplates(fetchedTemplates || [])
      setTemplatesLoading(false)
    } catch (err) {
      console.error('Error loading templates:', err)
      setError('Failed to load templates')
      setTemplatesLoading(false)
    }
  }, [setTemplates, setTemplatesLoading, setError, templateManager, challengeTrack, challengeType])

  useEffect(() => {
    if (challengeTrack && challengeType) {
      loadTemplates();
    }
  }, [loadTemplates, challengeTrack, challengeType]);

  return {
    templates,
    selectedTemplate,
    templatesLoading,
    error,
    selectTemplate,
    clearSelection,
    reset
  }
}

export default useTemplateManager
