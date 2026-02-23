import React, { useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import ConfigurationSourceSelector from '../components/ConfigurationSourceSelector'
import ReviewSettingsSection from '../components/ReviewSettingsSection'
import SummarySection from '../components/SummarySection'
import WeightValidationCard from '../components/WeightValidationCard'
import ManualWorkflowCard from '../components/ManualWorkflowCard'
import styles from '../AiReviewTab.module.scss'
import ConfirmationModal from '../../../../Modal/ConfirmationModal'
import { configHasChanges } from '../../../../../services/aiReviewConfigHelpers'
import AiWorkflowsTableListing from '../components/AiWorkflowsTableListing'

/**
 * Manual Configuration View - Manually configure AI review settings and workflows
 */
const ManualConfigurationView = ({
  challenge,
  configuration,
  availableWorkflows,
  onUpdateConfiguration,
  onAddWorkflow,
  onUpdateWorkflow,
  onRemoveWorkflow,
  onSwitchMode,
  onRemoveConfig,
  readOnly,
}) => {
  const origConfig = useRef(configuration);
  const [showSwitchConfirmModal, setShowSwitchConfirmModal] = useState(false)
  
  const handleConfirmSwitch = useCallback(() => {
    onRemoveConfig();
    onSwitchMode('template');
  }, [onSwitchMode, onRemoveConfig]);
  
  const handleOnSwitchConfig = useCallback(() => {
    if (configHasChanges(origConfig.current, configuration)) {
      setShowSwitchConfirmModal(true);
    } else {
      handleConfirmSwitch();
    }
  }, [
    configuration, setShowSwitchConfirmModal, handleConfirmSwitch
  ]);

  return (
    <div className={styles.manualConfiguration}>
      {/* Configuration Source Selector */}
      {!readOnly && (
        <ConfigurationSourceSelector
          mode='manual'
          onSwitch={handleOnSwitchConfig}
          readOnly={readOnly}
        />
      )}

      {/* Review Settings Section */}
      {!readOnly && (
        <ReviewSettingsSection
          configuration={configuration}
          onUpdateConfiguration={onUpdateConfiguration}
          showTitle
        />
      )}

      {/* Manual Workflows Section */}
      {!readOnly && (
        <div className={styles.manualWorkflowsSection}>
          <h3>AI Workflows <span className={styles.workflowsNote}>(editable)</span></h3>

          {configuration.workflows.map((workflow, index) => (
            <ManualWorkflowCard
              key={`manual-workflow-${index}`}
              workflow={workflow}
              index={index}
              availableWorkflows={availableWorkflows}
              challenge={challenge}
              onUpdate={onUpdateWorkflow}
              onRemove={() => onRemoveWorkflow(index)}
              readOnly={readOnly}
            />
          ))}

          {!readOnly && (
            <button
              className={styles.addWorkflowButton}
              onClick={onAddWorkflow}
            >
              + Add AI Workflow
            </button>
          )}
        </div>
      )}

      {/* Weight Validation Section */}
      {!readOnly && (
        <WeightValidationCard workflows={configuration.workflows} />
      )}

      {readOnly && (
        <AiWorkflowsTableListing
          workflows={configuration.workflows}
          challenge={challenge}
        />
      )}

      {/* Summary Section */}
      <SummarySection configuration={configuration} />

      {/* Action Buttons Section */}
      {!readOnly && (
        <div className={styles.actionButtonsSection}>
          {/* <button
            className={styles.saveConfigButton}
            onClick={onSaveConfiguration}
          >
            Save AI Review Configuration
          </button> */}
          <div className={styles.removeConfigSection}>
            <button
              className={styles.removeConfigButton}
              onClick={onRemoveConfig}
            >
              Remove AI Review Config
            </button>
          </div>
        </div>
      )}

      {showSwitchConfirmModal && (
        <ConfirmationModal
          title='Switch to Template Configuration?'
          message={(
            <div>
              <p>Your current manual configuration will be discarded.</p>
              <p>You can then select a template from a pre-defined list specific to your challenge type.</p>
            </div>
          )}
          cancelText='Cancel'
          confirmText='Switch to Template'
          onCancel={() => setShowSwitchConfirmModal(false)}
          onConfirm={handleConfirmSwitch}
        />
      )}
    </div>
  )
}

ManualConfigurationView.propTypes = {
  challenge: PropTypes.object.isRequired,
  configuration: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    minPassingThreshold: PropTypes.number.isRequired,
    autoFinalize: PropTypes.bool.isRequired,
    workflows: PropTypes.array.isRequired
  }).isRequired,
  availableWorkflows: PropTypes.array.isRequired,
  onUpdateConfiguration: PropTypes.func.isRequired,
  onAddWorkflow: PropTypes.func.isRequired,
  onUpdateWorkflow: PropTypes.func.isRequired,
  onRemoveWorkflow: PropTypes.func.isRequired,
  onSwitchMode: PropTypes.func.isRequired,
  onRemoveConfig: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
}

ManualConfigurationView.defaultProps = {
  readOnly: false
}

export default ManualConfigurationView
