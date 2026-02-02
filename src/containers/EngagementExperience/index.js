import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment-timezone'

import Loader from '../../components/Loader'
import MemberExperienceList from '../../components/MemberExperienceList'
import { loadProject } from '../../actions/projects'
import { loadEngagementDetails } from '../../actions/engagements'
import { checkAdmin, checkManager } from '../../util/tc'
import { PROJECT_ROLES } from '../../config/constants'
import { fetchMemberExperiences } from '../../services/engagements'
import styles from './styles.module.scss'

const EngagementExperience = ({
  projectId,
  engagementId,
  match,
  engagementDetails,
  projectDetail,
  isLoading,
  auth,
  loadProject,
  loadEngagementDetails
}) => {
  const resolvedProjectId = useMemo(() => {
    const value = projectId || _.get(match, 'params.projectId')
    return value ? parseInt(value, 10) : null
  }, [projectId, match])

  const resolvedEngagementId = useMemo(() => {
    return engagementId || _.get(match, 'params.engagementId') || null
  }, [engagementId, match])

  const assignments = useMemo(() => {
    const rawAssignments = _.get(engagementDetails, 'assignments', [])
    if (!Array.isArray(rawAssignments)) {
      return []
    }
    return rawAssignments
      .map((assignment, index) => {
        if (!assignment) {
          return null
        }
        const handle = assignment.memberHandle != null
          ? String(assignment.memberHandle).trim()
          : ''
        const memberId = assignment.memberId != null
          ? String(assignment.memberId).trim()
          : ''
        let label = ''
        if (handle && memberId) {
          label = `${handle} (${memberId})`
        } else if (handle) {
          label = handle
        } else if (memberId) {
          label = `Member ${memberId}`
        } else {
          label = `Assignment ${index + 1}`
        }
        return {
          id: assignment.id,
          label,
          handle,
          memberId
        }
      })
      .filter(Boolean)
  }, [engagementDetails])

  const canViewExperiences = useMemo(() => {
    const isAdmin = checkAdmin(auth.token)
    const isManager = checkManager(auth.token)
    const members = _.get(projectDetail, 'members', [])
    const userId = _.get(auth, 'user.userId')
    const isProjectManager = members.some(member => member.userId === userId && member.role === PROJECT_ROLES.MANAGER)
    return isAdmin || isManager || isProjectManager
  }, [auth, projectDetail])

  const [memberExperiences, setMemberExperiences] = useState({})
  const [memberExperiencesLoading, setMemberExperiencesLoading] = useState({})
  const [memberExperiencesError, setMemberExperiencesError] = useState({})

  useEffect(() => {
    if (resolvedProjectId) {
      loadProject(resolvedProjectId)
    }
    if (resolvedEngagementId) {
      loadEngagementDetails(resolvedProjectId, resolvedEngagementId)
    }
  }, [resolvedProjectId, resolvedEngagementId, loadProject, loadEngagementDetails])

  useEffect(() => {
    setMemberExperiences({})
    setMemberExperiencesLoading({})
    setMemberExperiencesError({})
  }, [resolvedEngagementId])

  const fetchExperiences = useCallback(async (assignmentId) => {
    if (!resolvedEngagementId || !assignmentId) {
      return
    }
    setMemberExperiencesLoading((prevState) => ({
      ...prevState,
      [assignmentId]: true
    }))
    setMemberExperiencesError((prevState) => ({
      ...prevState,
      [assignmentId]: ''
    }))

    try {
      const response = await fetchMemberExperiences(resolvedEngagementId, assignmentId)
      const data = _.get(response, 'data', [])
      setMemberExperiences((prevState) => ({
        ...prevState,
        [assignmentId]: Array.isArray(data) ? data : []
      }))
    } catch (error) {
      const errorMessage = _.get(error, 'response.data.message') ||
        (error && error.message) ||
        'Unable to load member experiences.'
      setMemberExperiencesError((prevState) => ({
        ...prevState,
        [assignmentId]: errorMessage
      }))
    } finally {
      setMemberExperiencesLoading((prevState) => ({
        ...prevState,
        [assignmentId]: false
      }))
    }
  }, [resolvedEngagementId])

  useEffect(() => {
    if (!canViewExperiences || !resolvedEngagementId || !assignments.length) {
      return
    }
    assignments.forEach((assignment) => {
      if (!assignment || !assignment.id) {
        return
      }
      if (Object.prototype.hasOwnProperty.call(memberExperiences, assignment.id)) {
        return
      }
      if (memberExperiencesError[assignment.id]) {
        return
      }
      if (memberExperiencesLoading[assignment.id]) {
        return
      }
      fetchExperiences(assignment.id)
    })
  }, [
    assignments,
    canViewExperiences,
    resolvedEngagementId,
    fetchExperiences,
    memberExperiences,
    memberExperiencesError,
    memberExperiencesLoading
  ])

  const experienceTitle = engagementDetails && engagementDetails.title
    ? `${engagementDetails.title} Experience`
    : 'Experience'

  const pendingAssignment = engagementDetails && engagementDetails.status === 'Pending Assignment'

  const renderExperienceContent = () => {
    if (!canViewExperiences) {
      return (
        <div className={styles.emptyState}>
          Member experiences are available to project managers and admins only.
        </div>
      )
    }

    if (!assignments.length) {
      return (
        <div className={styles.emptyState}>
          No assignments available yet.
        </div>
      )
    }

    return (
      <div className={styles.memberList}>
        {assignments.map((assignment, index) => {
          const assignmentId = assignment.id
          const hasExperiences = assignmentId != null &&
            Object.prototype.hasOwnProperty.call(memberExperiences, assignmentId)
          const isLoading = assignmentId != null
            ? Boolean(memberExperiencesLoading[assignmentId]) ||
              (!hasExperiences && !memberExperiencesError[assignmentId])
            : false
          const experiences = assignmentId && hasExperiences ? memberExperiences[assignmentId] : []
          const experienceError = assignmentId
            ? memberExperiencesError[assignmentId]
            : 'Unable to load member experiences.'
          const retryHandler = assignmentId ? () => fetchExperiences(assignmentId) : null
          const memberLabel = assignment.label || `Assignment ${index + 1}`
          return (
            <div key={assignmentId || memberLabel} className={styles.memberSection}>
              <div className={styles.memberHeader}>
                <div className={styles.memberName}>{memberLabel}</div>
                {assignmentId ? (
                  <div className={styles.memberMeta}>{`Assignment ID: ${assignmentId}`}</div>
                ) : (
                  <div className={styles.memberMeta}>Assignment ID unavailable</div>
                )}
              </div>
              <MemberExperienceList
                experiences={experiences}
                isLoading={isLoading}
                error={experienceError}
                onRetry={retryHandler}
              />
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading && !_.get(engagementDetails, 'id')) {
    return <Loader />
  }

  if (!_.get(engagementDetails, 'id') && !isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Engagement not found.</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{experienceTitle}</div>
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status:</span>
            <span>{engagementDetails && engagementDetails.status ? engagementDetails.status : '-'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Last updated:</span>
            <span>
              {engagementDetails && engagementDetails.updatedAt
                ? moment(engagementDetails.updatedAt).format('MMM DD, YYYY')
                : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Member Experiences</div>
            <div className={styles.panelDescription}>
              Review member experience logs for each assignment.
            </div>
          </div>
        </div>

        {pendingAssignment && (
          <div className={styles.notice}>
            This engagement has not been assigned yet. Member experiences will be available once a member is assigned.
          </div>
        )}

        {renderExperienceContent()}
      </div>
    </div>
  )
}

EngagementExperience.defaultProps = {
  projectId: null,
  engagementId: null,
  match: null,
  engagementDetails: null,
  projectDetail: null,
  isLoading: false
}

EngagementExperience.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  engagementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string,
      engagementId: PropTypes.string
    })
  }),
  engagementDetails: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    updatedAt: PropTypes.string,
    assignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      memberHandle: PropTypes.string
    }))
  }),
  projectDetail: PropTypes.shape({
    members: PropTypes.arrayOf(PropTypes.shape())
  }),
  isLoading: PropTypes.bool,
  auth: PropTypes.shape({
    token: PropTypes.string,
    user: PropTypes.shape({
      userId: PropTypes.number
    })
  }).isRequired,
  loadProject: PropTypes.func.isRequired,
  loadEngagementDetails: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  engagementDetails: state.engagements.engagementDetails,
  projectDetail: state.projects.projectDetail,
  isLoading: state.engagements.isLoading,
  auth: state.auth
})

const mapDispatchToProps = {
  loadProject,
  loadEngagementDetails
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EngagementExperience)
)
