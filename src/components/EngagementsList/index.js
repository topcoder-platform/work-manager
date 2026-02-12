import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { PrimaryButton, OutlineButton } from '../Buttons'
import Tooltip from '../Tooltip'
import Loader from '../Loader'
import Select from '../Select'
import { ENGAGEMENTS_APP_URL } from '../../config/constants'
import { getCountableAssignments } from '../../util/engagements'
import styles from './EngagementsList.module.scss'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'Open' },
  { label: 'Active', value: 'Active' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Closed', value: 'Closed' }
]

const VISIBILITY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' }
]

const DEFAULT_STATUS_OPTION = STATUS_OPTIONS.find((option) => option.value === 'Open') || STATUS_OPTIONS[0]
const ALL_STATUS_OPTION = STATUS_OPTIONS.find((option) => option.value === 'all') || STATUS_OPTIONS[0]
const DEFAULT_VISIBILITY_OPTION = VISIBILITY_OPTIONS[0]

const getStatusClass = (status) => {
  if (status === 'Open') {
    return styles.statusOpen
  }
  if (status === 'Pending Assignment') {
    return styles.statusPendingAssignment
  }
  if (status === 'Active') {
    return styles.statusActive
  }
  if (status === 'Cancelled') {
    return styles.statusCancelled
  }
  return styles.statusClosed
}

const getApplicationsCount = (engagement) => {
  if (!engagement) {
    return 0
  }
  if (typeof engagement.applicationsCount === 'number') {
    return engagement.applicationsCount
  }
  if (typeof engagement.applicationCount === 'number') {
    return engagement.applicationCount
  }
  if (engagement._count && typeof engagement._count.applications === 'number') {
    return engagement._count.applications
  }
  if (Array.isArray(engagement.applications)) {
    return engagement.applications.length
  }
  return 0
}

const getAssignedMembersCount = (engagement) => {
  if (!engagement) {
    return 0
  }
  if (Array.isArray(engagement.assignments) && engagement.assignments.length > 0) {
    return getCountableAssignments(engagement.assignments).length
  }
  if (Array.isArray(engagement.assignedMembers) && engagement.assignedMembers.length > 0) {
    return engagement.assignedMembers.length
  }
  if (Array.isArray(engagement.assignedMemberHandles) && engagement.assignedMemberHandles.length > 0) {
    return engagement.assignedMemberHandles.length
  }
  if (engagement.assignedMemberId || engagement.assignedMemberHandle) {
    return 1
  }
  return 0
}

const getMemberHandle = (member) => {
  if (!member) {
    return null
  }
  if (typeof member === 'string') {
    return member
  }
  if (typeof member !== 'object') {
    return null
  }
  return member.handle || member.memberHandle || member.username || member.name || member.userHandle || member.userName || null
}

const getAssignedMemberHandles = (engagement) => {
  if (!engagement) {
    return []
  }
  const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []
  if (assignments.length) {
    const countableAssignments = getCountableAssignments(assignments)
    return Array.from(new Set(countableAssignments.map((assignment) => getMemberHandle(assignment)).filter(Boolean)))
  }
  const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles)
    ? engagement.assignedMemberHandles
    : []
  if (assignedMemberHandles.length) {
    return Array.from(new Set(assignedMemberHandles.map((handle) => getMemberHandle(handle)).filter(Boolean)))
  }
  const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
  if (assignedMembers.length) {
    return Array.from(new Set(assignedMembers.map((member) => getMemberHandle(member)).filter(Boolean)))
  }
  if (engagement.assignedMemberHandle) {
    return [engagement.assignedMemberHandle]
  }
  return []
}

const getEngagementProjectId = (engagement, fallbackProjectId = null) => {
  if (engagement && engagement.projectId) {
    return engagement.projectId
  }
  return fallbackProjectId
}

const getEngagementProjectName = (engagement, fallbackProjectName = null) => {
  if (engagement && engagement.projectName) {
    return engagement.projectName
  }
  if (engagement && engagement.project && engagement.project.name) {
    return engagement.project.name
  }
  if (fallbackProjectName) {
    return fallbackProjectName
  }
  return null
}

const EngagementsList = ({
  engagements,
  projectId,
  projectDetail,
  allEngagements,
  isLoading,
  canManage
}) => {
  const [searchProjectName, setSearchProjectName] = useState('')
  const [statusFilter, setStatusFilter] = useState(allEngagements ? ALL_STATUS_OPTION : DEFAULT_STATUS_OPTION)
  const [visibilityFilter, setVisibilityFilter] = useState(DEFAULT_VISIBILITY_OPTION)

  const filteredOpportunities = useMemo(() => {
    const fallbackProjectName = !allEngagements && projectDetail && projectDetail.name
      ? projectDetail.name
      : null
    let results = engagements || []

    if (statusFilter && statusFilter.value !== 'all') {
      results = results.filter(engagement => (engagement.status || '') === statusFilter.value)
    }

    if (visibilityFilter && visibilityFilter.value !== 'all') {
      const isPrivate = visibilityFilter.value === 'private'
      results = results.filter(engagement => Boolean(engagement.isPrivate) === isPrivate)
    }

    if (searchProjectName.trim()) {
      const query = searchProjectName.trim().toLowerCase()
      results = results.filter((engagement) => {
        const projectName = getEngagementProjectName(engagement, fallbackProjectName) || ''
        return projectName.toLowerCase().includes(query)
      })
    }

    return results
  }, [engagements, statusFilter, visibilityFilter, searchProjectName, projectDetail, allEngagements])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          {allEngagements
            ? 'All Engagements'
            : (projectDetail && projectDetail.name ? `${projectDetail.name} Engagements` : 'Engagements')}
        </div>
        {canManage && projectId && (
          <div className={styles.headerAction}>
            <PrimaryButton
              text='New Engagement'
              type='info'
              link={`/projects/${projectId}/engagements/new`}
            />
          </div>
        )}
      </div>
      <div className={styles.filters}>
        <div className={styles.filterSearch}>
          <input
            className={styles.filterInput}
            type='text'
            value={searchProjectName}
            onChange={(event) => setSearchProjectName(event.target.value)}
            placeholder='Search by project name'
          />
        </div>
        <div className={styles.filterItem}>
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(option) => setStatusFilter(option || STATUS_OPTIONS[0])}
            isClearable={false}
          />
        </div>
        <div className={styles.filterItem}>
          <Select
            options={VISIBILITY_OPTIONS}
            value={visibilityFilter}
            onChange={(option) => setVisibilityFilter(option || DEFAULT_VISIBILITY_OPTION)}
            isClearable={false}
          />
        </div>
      </div>

      {filteredOpportunities.length === 0 ? (
        <div className={styles.emptyState}>No engagements found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Engagement Title</th>
              <th>Visibility</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Members Assigned</th>
              <th className={styles.actionsColumn}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.map((engagement) => {
              const fallbackProjectName = !allEngagements && projectDetail && projectDetail.name
                ? projectDetail.name
                : null
              const applicationsCount = getApplicationsCount(engagement)
              const statusClass = getStatusClass(engagement.status)
              const engagementProjectId = getEngagementProjectId(engagement, projectId)
              const projectName = getEngagementProjectName(engagement, fallbackProjectName) || engagementProjectId || '-'
              const assignedMembersCount = getAssignedMembersCount(engagement)
              const assignedMemberHandles = getAssignedMemberHandles(engagement)
              const assignedMembersTooltip = assignedMemberHandles.length ? (
                <div className={styles.assignedMembersTooltip}>
                  {assignedMemberHandles.map((handle) => (
                    <div key={handle}>{handle}</div>
                  ))}
                </div>
              ) : (
                'Assigned members unavailable'
              )

              return (
                <tr key={engagement.id || engagement.title}>
                  <td>
                    {engagementProjectId ? (
                      <Link
                        className={styles.projectLink}
                        to={`/projects/${engagementProjectId}/challenges`}
                      >
                        {projectName}
                      </Link>
                    ) : (
                      projectName
                    )}
                  </td>
                  <td>{engagement.title || '-'}</td>
                  <td>{engagement.isPrivate ? 'Private' : 'Public'}</td>
                  <td>
                    <span className={`${styles.status} ${statusClass}`}>
                      {engagement.status || '-'}
                    </span>
                  </td>
                  <td>
                    {engagement.id && engagementProjectId ? (
                      <Link
                        className={styles.applicationsLink}
                        to={`/projects/${engagementProjectId}/engagements/${engagement.id}/applications`}
                      >
                        {applicationsCount}
                      </Link>
                    ) : (
                      applicationsCount
                    )}
                  </td>
                  <td>
                    {engagement.id && engagementProjectId && assignedMembersCount > 0 ? (
                      <Tooltip content={assignedMembersTooltip}>
                        <span>
                          <Link
                            className={styles.applicationsLink}
                            to={`/projects/${engagementProjectId}/engagements/${engagement.id}/assignments`}
                          >
                            {assignedMembersCount}
                          </Link>
                        </span>
                      </Tooltip>
                    ) : (
                      assignedMembersCount
                    )}
                  </td>
                  <td className={styles.actionsColumn}>
                    {canManage ? (
                      <div className={styles.actions}>
                        {engagement.id && (
                          <OutlineButton
                            text='View'
                            type='info'
                            url={`${ENGAGEMENTS_APP_URL}/${engagement.id}`}
                            target='_blank'
                          />
                        )}
                        <OutlineButton
                          text='Edit'
                          type='info'
                          link={engagementProjectId && engagement.id ? `/projects/${engagementProjectId}/engagements/${engagement.id}` : null}
                          disabled={!engagementProjectId || !engagement.id}
                        />
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

EngagementsList.defaultProps = {
  engagements: [],
  projectId: null,
  projectDetail: null,
  allEngagements: false,
  isLoading: false,
  canManage: false
}

EngagementsList.propTypes = {
  engagements: PropTypes.arrayOf(PropTypes.shape()),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  projectDetail: PropTypes.shape({
    name: PropTypes.string
  }),
  allEngagements: PropTypes.bool,
  isLoading: PropTypes.bool,
  canManage: PropTypes.bool
}

export default EngagementsList
