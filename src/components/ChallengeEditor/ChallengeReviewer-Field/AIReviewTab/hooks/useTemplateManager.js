import { useState, useMemo } from 'react'
import { createTemplateManager } from '../../../../../services/aiReviewTemplateHelpers'

/**
 * Custom hook for managing AI Review templates
 * Handles template loading, selection, and state management
 */
const useTemplateManager = () => {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [error, setError] = useState(null)

  const templateManager = useMemo(() => createTemplateManager(false), [])

  /**
   * Load templates based on challenge track and type
   */
  const loadTemplates = async (challengeTrack, challengeType) => {
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
  }

  /**
   * Select a template by ID
   */
  const selectTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
    return template || null
  }

  /**
   * Clear selected template
   */
  const clearSelection = () => {
    setSelectedTemplate(null)
  }

  /**
   * Reset all state
   */
  const reset = () => {
    setTemplates([])
    setSelectedTemplate(null)
    setTemplatesLoading(false)
    setError(null)
  }

  return {
    templates,
    selectedTemplate,
    templatesLoading,
    error,
    loadTemplates,
    selectTemplate,
    clearSelection,
    reset
  }
}

export default useTemplateManager
