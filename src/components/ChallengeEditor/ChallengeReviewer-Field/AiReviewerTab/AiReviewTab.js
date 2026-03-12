import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { isAIReviewer } from './utils'
import { deleteAIReviewConfig } from '../../../../services/aiReviewConfigs'
import styles from './AiReviewTab.module.scss'
import sharedStyles from '../shared.module.scss'
import useConfigurationState from './hooks/useConfigurationState'
import InitialStateView from './views/InitialStateView'
import TemplateConfigurationView from './views/TemplateConfigurationView'
import ManualConfigurationView from './views/ManualConfigurationView'
import { pick } from 'lodash'

/**
 * AiReviewTab - Main component for managing AI review configuration
 * Orchestrates between different views: initial state, template, manual, and legacy
 */
const AiReviewTab = ({ challenge, onUpdateReviewers, metadata = {}, isLoading, readOnly = false }) => {
  const {
    isLoading: isLoadingConfigs,
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
  } = useConfigurationState(challenge.id)

  const aiReviewers = useMemo(() => (
    (challenge.reviewers || []).filter(isAIReviewer)
  ), [challenge.reviewers])

  const removeAIReviewer = useCallback((index) => {
    const allChallengeReviewers = challenge.reviewers || []
    // Map the AI reviewer index to the actual index in the full reviewers array
    const reviewerToRemove = aiReviewers[index]
    const actualIndex = allChallengeReviewers.indexOf(reviewerToRemove)

    if (actualIndex !== -1) {
      const updatedReviewers = allChallengeReviewers.filter((_, i) => i !== actualIndex)
      onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
    }
  }, [challenge.reviewers, onUpdateReviewers, aiReviewers])

  const handleRemoveConfiguration = useCallback(() => {
    // Call delete API if config exists
    if (configId) {
      deleteAIReviewConfig(configId).catch(err => {
        console.error('Error deleting AI review configuration:', err)
      })
    }
    setConfigurationMode(null)
    resetConfiguration()
  }, [setConfigurationMode, resetConfiguration, configId])

  const handleSwitchConfigurationMode = useCallback((mode, template) => {
    if (mode === 'manual') {
      if (template) {
        applyTemplate(pick(template, [
          'mode',
          'minPassingThreshold',
          'autoFinalize',
          'formula',
          'workflows'
        ]))
      }
    } else {
      resetConfiguration()
    }
    setConfigurationMode(mode)
  }, [setConfigurationMode, applyTemplate, resetConfiguration])

  if (isLoading || isLoadingConfigs) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={sharedStyles.tabContent}>
      {isSaving && <div className={styles.autoSaveIndicator}>💾 Saving...</div>}

      {/* initial state (no configuration mode was selected: template/manual) */}
      {configurationMode === null && (
        <InitialStateView
          aiReviewers={aiReviewers}
          metadata={metadata}
          onSelectTemplate={() => setConfigurationMode('template')}
          onSelectManual={() => setConfigurationMode('manual')}
          onRemoveReviewer={removeAIReviewer}
          readOnly={readOnly}
        />
      )}

      {/* Show template configuration if in template mode */}
      {configurationMode === 'template' && (
        <TemplateConfigurationView
          challenge={challenge}
          configuration={configuration}
          onTemplateChange={applyTemplate}
          onUpdateConfiguration={updateConfiguration}
          onSwitchMode={handleSwitchConfigurationMode}
          onRemoveConfig={handleRemoveConfiguration}
          readOnly={readOnly}
          availableWorkflows={metadata.workflows || []}
        />
      )}

      {/* Show manual configuration if in manual mode */}
      {configurationMode === 'manual' && (
        <ManualConfigurationView
          challenge={challenge}
          configuration={configuration}
          availableWorkflows={metadata.workflows || []}
          onUpdateConfiguration={updateConfiguration}
          onAddWorkflow={addWorkflow}
          onUpdateWorkflow={updateWorkflow}
          onRemoveWorkflow={removeWorkflow}
          onSwitchMode={handleSwitchConfigurationMode}
          onRemoveConfig={handleRemoveConfiguration}
          readOnly={readOnly}
        />
      )}
    </div>
  )
}

AiReviewTab.propTypes = {
  challenge: PropTypes.object.isRequired,
  onUpdateReviewers: PropTypes.func.isRequired,
  metadata: PropTypes.shape({
    workflows: PropTypes.array,
    challengeTracks: PropTypes.array
  }),
  isLoading: PropTypes.bool,
  readOnly: PropTypes.bool
}

AiReviewTab.defaultProps = {
  metadata: {},
  isLoading: false,
  readOnly: false
}

export default AiReviewTab
