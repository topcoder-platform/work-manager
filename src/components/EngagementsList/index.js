import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { Link } from 'react-router-dom'
import { PrimaryButton, OutlineButton } from '../Buttons'
import ConfirmationModal from '../Modal/ConfirmationModal'
import Loader from '../Loader'
import Select from '../Select'
import styles from './EngagementsList.module.scss'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'Open' },
  { label: 'Pending Assignment', value: 'Pending Assignment' },
  { label: 'Active', value: 'Active' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Closed', value: 'Closed' }
]

const SORT_OPTIONS = [
  { label: 'Application Deadline', value: 'deadline' },
  { label: 'Created Date', value: 'createdAt' }
]

const SORT_ORDER_OPTIONS = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' }
]

const DEFAULT_STATUS_OPTION = STATUS_OPTIONS.find((option) => option.value === 'Open') || STATUS_OPTIONS[0]

const formatDate = (value) => {
  if (!value) {
    return '-'
  }
  return moment(value).format('MMM DD, YYYY')
}

const getSortValue = (engagement, sortBy) => {
  if (sortBy === 'deadline') {
    return engagement.applicationDeadline || engagement.application_deadline || null
  }
  return engagement.createdAt || engagement.createdOn || engagement.created || null
}

const getDurationLabel = (engagement) => {
  if (!engagement) {
    return '-'
  }
  const hasDateRange = engagement.startDate && engagement.endDate
  if (hasDateRange) {
    return `${formatDate(engagement.startDate)} - ${formatDate(engagement.endDate)}`
  }
  if (engagement.duration && engagement.duration.amount) {
    return `${engagement.duration.amount} ${engagement.duration.unit}`
  }
  if (engagement.durationAmount) {
    return `${engagement.durationAmount} ${engagement.durationUnit || ''}`.trim()
  }
  return '-'
}

const getLocationLabel = (engagement) => {
  if (!engagement) {
    return '-'
  }
  const timezones = (engagement.timezones || []).length ? engagement.timezones.join(', ') : 'Any'
  const countries = (engagement.countries || []).length ? engagement.countries.join(', ') : 'Any'
  return `${timezones}${countries !== 'Any' ? ` / ${countries}` : ''}`
}

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
    return engagement.assignments.length
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

const EngagementsList = ({
  engagements,
  projectId,
  projectDetail,
  isLoading,
  canManage,
  onDeleteEngagement
}) => {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_OPTION)
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0])
  const [sortOrder, setSortOrder] = useState(SORT_ORDER_OPTIONS[0])
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredOpportunities = useMemo(() => {
    let results = engagements || []
    if (statusFilter && statusFilter.value !== 'all') {
      results = results.filter(engagement => (engagement.status || '') === statusFilter.value)
    }
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase()
      results = results.filter(engagement => (engagement.title || '').toLowerCase().includes(query))
    }
    const sorted = [...results].sort((a, b) => {
      const valueA = getSortValue(a, sortBy.value)
      const valueB = getSortValue(b, sortBy.value)
      const dateA = valueA ? new Date(valueA).getTime() : 0
      const dateB = valueB ? new Date(valueB).getTime() : 0
      return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
    })
    return sorted
  }, [engagements, statusFilter, searchText, sortBy, sortOrder])

  const handleDelete = async () => {
    if (!pendingDelete) {
      return
    }
    try {
      setIsDeleting(true)
      await onDeleteEngagement(pendingDelete.id, projectId)
      setIsDeleting(false)
      setPendingDelete(null)
    } catch (error) {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className={styles.container}>
      {pendingDelete && (
        <ConfirmationModal
          title='Confirm Delete'
          message={`Do you want to delete "${pendingDelete.title || 'this engagement'}"?`}
          isProcessing={isDeleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
      <div className={styles.header}>
        <div className={styles.title}>
          {projectDetail && projectDetail.name ? `${projectDetail.name} Engagements` : 'Engagements'}
        </div>
        {canManage && (
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
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder='Search by title'
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
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(option) => setSortBy(option || SORT_OPTIONS[0])}
            isClearable={false}
          />
        </div>
        <div className={styles.filterItem}>
          <Select
            options={SORT_ORDER_OPTIONS}
            value={sortOrder}
            onChange={(option) => setSortOrder(option || SORT_ORDER_OPTIONS[0])}
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
              <th>Title</th>
              <th>Duration</th>
              <th>Location</th>
              <th>Application Deadline</th>
              {canManage && <th>Applications</th>}
              {canManage && <th>Visibility</th>}
              {canManage && <th>Members Required</th>}
              {canManage && <th>Members Assigned</th>}
              <th>Status</th>
              {canManage && <th className={styles.actionsColumn}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.map((engagement) => {
              const duration = getDurationLabel(engagement)
              const location = getLocationLabel(engagement)
              const applicationsCount = getApplicationsCount(engagement)
              const statusClass = getStatusClass(engagement.status)
              const assignedMembersCount = getAssignedMembersCount(engagement)

              return (
                <tr key={engagement.id || engagement.title}>
                  <td>{engagement.title || '-'}</td>
                  <td>{duration}</td>
                  <td>{location}</td>
                  <td>{formatDate(engagement.applicationDeadline)}</td>
                  {canManage && (
                    <td>
                      {engagement.id ? (
                        <Link
                          className={styles.applicationsLink}
                          to={`/projects/${projectId}/engagements/${engagement.id}/applications`}
                        >
                          {applicationsCount}
                        </Link>
                      ) : (
                        applicationsCount
                      )}
                    </td>
                  )}
                  {canManage && (
                    <td>
                      {engagement.isPrivate ? 'Private' : 'Public'}
                    </td>
                  )}
                  {canManage && (
                    <td>
                      {engagement.requiredMemberCount != null ? engagement.requiredMemberCount : '-'}
                    </td>
                  )}
                  {canManage && (
                    <td>
                      {assignedMembersCount}
                    </td>
                  )}
                  <td>
                    <span className={`${styles.status} ${statusClass}`}>
                      {engagement.status || '-'}
                    </span>
                  </td>
                  {canManage && (
                    <td className={styles.actionsColumn}>
                      <div className={styles.actions}>
                        <OutlineButton
                          text='Edit'
                          type='info'
                          link={`/projects/${projectId}/engagements/${engagement.id}`}
                        />
                        <OutlineButton
                          text='Feedback'
                          type='info'
                          link={`/projects/${projectId}/engagements/${engagement.id}/feedback`}
                        />
                        {assignedMembersCount > 0 && (
                          <OutlineButton
                            text='Pay'
                            type='info'
                            link={`/projects/${projectId}/engagements/${engagement.id}/pay`}
                          />
                        )}
                        <OutlineButton
                          text='Delete'
                          type='danger'
                          onClick={() => setPendingDelete(engagement)}
                        />
                      </div>
                    </td>
                  )}
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
  projectDetail: null,
  isLoading: false,
  canManage: false,
  onDeleteEngagement: () => {}
}

EngagementsList.propTypes = {
  engagements: PropTypes.arrayOf(PropTypes.shape()),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  projectDetail: PropTypes.shape({
    name: PropTypes.string
  }),
  isLoading: PropTypes.bool,
  canManage: PropTypes.bool,
  onDeleteEngagement: PropTypes.func
}

export default EngagementsList
