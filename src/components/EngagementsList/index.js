import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { PrimaryButton, OutlineButton } from '../Buttons'
import ConfirmationModal from '../Modal/ConfirmationModal'
import Loader from '../Loader'
import Select from '../Select'
import styles from './EngagementsList.module.scss'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'Open' },
  { label: 'Pending Assignment', value: 'Pending Assignment' },
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

const EngagementsList = ({
  engagements,
  projectId,
  projectDetail,
  isLoading,
  canManage,
  onDeleteEngagement
}) => {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0])
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0])
  const [sortOrder, setSortOrder] = useState(SORT_ORDER_OPTIONS[0])
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredEngagements = useMemo(() => {
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
          <PrimaryButton
            text='New Engagement'
            type='info'
            link={`/projects/${projectId}/engagements/new`}
          />
        )}
      </div>
      <div className={styles.filters}>
        <input
          className={styles.filterInput}
          type='text'
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder='Search by title'
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(option) => setStatusFilter(option || STATUS_OPTIONS[0])}
          isClearable={false}
        />
        <Select
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={(option) => setSortBy(option || SORT_OPTIONS[0])}
          isClearable={false}
        />
        <Select
          options={SORT_ORDER_OPTIONS}
          value={sortOrder}
          onChange={(option) => setSortOrder(option || SORT_ORDER_OPTIONS[0])}
          isClearable={false}
        />
      </div>

      {filteredEngagements.length === 0 ? (
        <div className={styles.emptyState}>No engagements found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Duration</th>
              <th>Location</th>
              <th>Skills</th>
              <th>Application Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEngagements.map((engagement) => {
              const hasDateRange = engagement.startDate && engagement.endDate
              const duration = hasDateRange
                ? `${formatDate(engagement.startDate)} - ${formatDate(engagement.endDate)}`
                : engagement.duration && engagement.duration.amount
                  ? `${engagement.duration.amount} ${engagement.duration.unit}`
                  : engagement.durationAmount
                    ? `${engagement.durationAmount} ${engagement.durationUnit || ''}`.trim()
                    : '-'
              const timezones = (engagement.timezones || []).length ? engagement.timezones.join(', ') : 'Any'
              const countries = (engagement.countries || []).length ? engagement.countries.join(', ') : 'Any'
              const skills = (engagement.skills || []).map(skill => skill.name || skill).join(', ')
              const statusClass = engagement.status === 'Open'
                ? styles.statusOpen
                : engagement.status === 'Pending Assignment'
                  ? styles.statusPendingAssignment
                  : styles.statusClosed

              return (
                <tr key={engagement.id || engagement.title}>
                  <td>{engagement.title || '-'}</td>
                  <td>{duration}</td>
                  <td>{`${timezones}${countries !== 'Any' ? ` / ${countries}` : ''}`}</td>
                  <td>{skills || '-'}</td>
                  <td>{formatDate(engagement.applicationDeadline)}</td>
                  <td>
                    <span className={`${styles.status} ${statusClass}`}>
                      {engagement.status || '-'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <OutlineButton
                        text='Edit'
                        type='info'
                        link={`/projects/${projectId}/engagements/${engagement.id}`}
                      />
                      {canManage && (
                        <OutlineButton
                          text='Delete'
                          type='danger'
                          onClick={() => setPendingDelete(engagement)}
                        />
                      )}
                      <OutlineButton
                        text='View Applications'
                        type='info'
                        link={`/projects/${projectId}/engagements/${engagement.id}/applications`}
                      />
                    </div>
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
