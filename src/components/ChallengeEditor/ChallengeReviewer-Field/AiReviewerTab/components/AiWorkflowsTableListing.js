import React from 'react';
import styles from '../AiReviewTab.module.scss'
import PropTypes from 'prop-types';

const AiWorkflowsTableListing = ({
  challenge,
  workflows,
}) => {
  return (
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
            {workflows.map((workflow, index) => {
              const isAssigned = (challenge.reviewers || []).some(r => r.aiWorkflowId === workflow.workflowId)
              const workflowDetails = workflows.find(w => w.id === workflow.workflowId) || {}

              return (
                <tr key={index}>
                  <td>
                    <span className={styles.workflowIcon}>🤖</span>
                    <span className={styles.workflowName}>{workflowDetails.name}</span>
                    {/* <div className={styles.workflowDescription}>
                      {workflowDetails.description}
                    </div> */}
                  </td>
                  <td className={styles.weight}>
                    {workflow.weightPercent}%
                  </td>
                  <td className={styles.type}>
                    {workflow.isGating ? (
                      <span className={styles.gatingBadge}>⚡ GATE</span>
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
  );
};

AiWorkflowsTableListing.propTypes = {
  challenge: PropTypes.object.isRequired,
  workflows: PropTypes.arrayOf(
    PropTypes.shape({
      weightPercent: PropTypes.number,
      isGating: PropTypes.bool,
      workflowId: PropTypes.string,
    })
  ).isRequired
}

AiWorkflowsTableListing.defaultProps = {
}

export default AiWorkflowsTableListing
