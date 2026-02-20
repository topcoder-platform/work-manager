import cn from 'classnames'
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { isAIReviewer } from './utils';
import styles from './AiReviewTab.module.scss'
import sharedStyles from '../shared.module.scss'
import useConfigurationState from './hooks/useConfigurationState';
import InitialStateView from './views/InitialStateView';
import TemplateConfigurationView from './views/TemplateConfigurationView';
import ManualConfigurationView from './views/ManualConfigurationView';

/**
 * AiReviewTab - Main component for managing AI review configuration
 * Orchestrates between different views: initial state, template, manual, and legacy
 */
const AiReviewTab = ({ challenge, onUpdateReviewers, metadata = {}, isLoading, readOnly = false }) => {
  const {
    configuration,
    configurationMode,
    setConfigurationMode,
    updateConfiguration,
    addWorkflow,
    updateWorkflow,
    removeWorkflow,
    resetConfiguration,
    applyTemplate
  } = useConfigurationState(challenge.id)

  const aiReviewers = useMemo(() => (
    (challenge.reviewers || []).filter(isAIReviewer)
  ), [challenge.reviewers]);

  const removeAIReviewer = useCallback((index) => {
    const allChallengeReviewers = challenge.reviewers || []
    // Map the AI reviewer index to the actual index in the full reviewers array
    const reviewerToRemove = aiReviewers[index]
    const actualIndex = allChallengeReviewers.indexOf(reviewerToRemove)
    
    if (actualIndex !== -1) {
      const updatedReviewers = allChallengeReviewers.filter((_, i) => i !== actualIndex)
      onUpdateReviewers({ field: 'reviewers', value: updatedReviewers })
    }
  }, [challenge.reviewers, onUpdateReviewers])

  const handleRemoveConfiguration = useCallback(() => {
    setConfigurationMode(null)
    resetConfiguration()
  }, [setConfigurationMode, resetConfiguration])

  const handleSwitchConfigurationMode = useCallback((mode, template) => {
    if (mode === 'manual') {
      console.log('switch to manual', template)
      if (template) {
        resetConfiguration(template);
      }
    } else {
      resetConfiguration()
    }
    setConfigurationMode(mode);
  }, [setConfigurationMode]);
  
  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  // Show template configuration if in template mode
  if (configurationMode === 'template') {
    return (
      <div className={sharedStyles.tabContent}>
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
      </div>
    )
  }

  // Show manual configuration if in manual mode
  if (configurationMode === 'manual') {
    return (
      <div className={sharedStyles.tabContent}>
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
      </div>
    )
  }

  // initial state (no configuration mode was selected: template/manual)
  return (
    <div className={sharedStyles.tabContent}>
      <InitialStateView
        aiReviewers={aiReviewers}
        metadata={metadata}
        onSelectTemplate={() => setConfigurationMode('template')}
        onSelectManual={() => setConfigurationMode('manual')}
        onRemoveReviewer={removeAIReviewer}
        readOnly={readOnly}
      />
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
