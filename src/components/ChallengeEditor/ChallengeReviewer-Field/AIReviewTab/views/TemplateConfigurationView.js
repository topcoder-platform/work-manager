import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationSourceSelector from '../components/ConfigurationSourceSelector'
import ReviewSettingsSection from '../components/ReviewSettingsSection'
import SummarySection from '../components/SummarySection'
import styles from '../AIReviewTab.module.scss'

/**
 * Template Configuration View - Select and configure using a template
 */
const TemplateConfigurationView = ({
  challenge,
  configuration,
  templates,
  selectedTemplate,
  templatesLoading,
  onTemplateChange,
  onUpdateConfiguration,
  onSwitchMode,
  onRemoveConfig,
  readOnly,
  isAIReviewer
}) => {
  return (
    <div className={styles.templateConfiguration}>
      {/* Configuration Source Selector */}
      <ConfigurationSourceSelector
        mode='template'
        onSwitch={() => onSwitchMode('manual')}
        readOnly={readOnly}
      />

      {/* Template Selection Section */}
      <div className={styles.templateSection}>
        <h3>📋 AI Review Template</h3>

        <div className={styles.templateSelector}>
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => onTemplateChange(e.target.value)}
            disabled={readOnly || templatesLoading}
            className={styles.templateDropdown}
          >
            <option value=''>Select a template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        </div>

        {selectedTemplate && (
          <div className={styles.templateDescription}>
            <p>{selectedTemplate.description}</p>
          </div>
        )}
      </div>

      {/* Review Settings Section */}
      {selectedTemplate && (
        <ReviewSettingsSection
          configuration={configuration}
          onUpdateConfiguration={onUpdateConfiguration}
          readOnly={readOnly}
        />
      )}

      {/* AI Workflows Section */}
      {selectedTemplate && configuration.workflows && configuration.workflows.length > 0 && (
        <div className={styles.workflowsSection}>
          <h3>AI Workflows <span className={styles.workflowsNote}>(from template)</span></h3>

          <div className={styles.workflowsTable}>
            <table>
              <thead>
                <tr>
                  <th>Workflow</th>
                  <th>Weight</th>
                  <th>Type</th>
                  <th>Challenge Match</th>
                </tr>
              </thead>
              <tbody>
                {configuration.workflows.map((workflow, index) => {
                  const isAssigned = (challenge.reviewers || []).some(r =>
                    isAIReviewer(r) && r.aiWorkflowId === workflow.workflowId
                  )
                  const workflowDetails = workflow.workflow || {}

                  return (
                    <tr key={index}>
                      <td>
                        <span className={styles.workflowIcon}>🤖</span>
                        <span className={styles.workflowName}>{workflowDetails.name}</span>
                        <div className={styles.workflowDescription}>
                          {workflowDetails.description}
                        </div>
                      </td>
                      <td className={styles.weight}>
                        {workflow.weightPercent}%
                      </td>
                      <td className={styles.type}>
                        {workflow.isGating ? (
                          <span className={styles.gatingBadge}>⚡GATE</span>
                        ) : (
                          <span className={styles.normalBadge}>✓ Review</span>
                        )}
                      </td>
                      <td className={styles.match}>
                        {isAssigned ? (
                          <span className={styles.assignedBadge}>✅ Assigned</span>
                        ) : (
                          <span className={styles.notAssignedBadge}>⚠️ Not assigned</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className={styles.workflowsInfo}>
            ✅ = Also assigned as AI Reviewer in this challenge<br />
            ⚠️ = Not assigned — will be auto-added on save
          </p>
        </div>
      )}

      {/* Summary Section */}
      {selectedTemplate && (
        <SummarySection configuration={configuration} />
      )}

      {/* Remove Configuration Button */}
      {!readOnly && selectedTemplate && (
        <div className={styles.removeConfigSection}>
          <button
            className={styles.removeConfigButton}
            onClick={onRemoveConfig}
          >
            ✕ Remove AI Review Config
          </button>
        </div>
      )}

      {templatesLoading && (
        <div className={styles.loading}>Loading templates...</div>
      )}
    </div>
  )
}

TemplateConfigurationView.propTypes = {
  challenge: PropTypes.object.isRequired,
  configuration: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    minPassingThreshold: PropTypes.number.isRequired,
    autoFinalize: PropTypes.bool.isRequired,
    workflows: PropTypes.array.isRequired
  }).isRequired,
  templates: PropTypes.array.isRequired,
  selectedTemplate: PropTypes.object,
  templatesLoading: PropTypes.bool.isRequired,
  onTemplateChange: PropTypes.func.isRequired,
  onUpdateConfiguration: PropTypes.func.isRequired,
  onSwitchMode: PropTypes.func.isRequired,
  onRemoveConfig: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  isAIReviewer: PropTypes.func.isRequired
}

TemplateConfigurationView.defaultProps = {
  readOnly: false,
  selectedTemplate: null
}

export default TemplateConfigurationView
