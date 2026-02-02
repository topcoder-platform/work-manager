import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { Link } from 'react-router-dom'
import { PrimaryButton, OutlineButton } from '../Buttons'
import Tooltip from '../Tooltip'
import Loader from '../Loader'
import Select from '../Select'
import { formatTimeZoneList } from '../../util/timezones'
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
  { label: 'Anticipated Start', value: 'anticipatedStart' },
  { label: 'Created Date', value: 'createdAt' }
]

const SORT_ORDER_OPTIONS = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' }
]

const DEFAULT_STATUS_OPTION = STATUS_OPTIONS.find((option) => option.value === 'Open') || STATUS_OPTIONS[0]

const ANTICIPATED_START_LABELS = {
  IMMEDIATE: 'Immediate',
  FEW_DAYS: 'In a few days',
  FEW_WEEKS: 'In a few weeks'
}

const ANTICIPATED_START_ORDER = {
  Immediate: 1,
  'In a few days': 2,
  'In a few weeks': 3,
  ...Object.keys(ANTICIPATED_START_LABELS).reduce((acc, key, index) => {
    acc[key] = index + 1
    return acc
  }, {})
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }
  return moment(value).format('MMM DD, YYYY')
}

const formatAnticipatedStart = (value) => {
  if (!value) {
    return '-'
  }
  return ANTICIPATED_START_LABELS[value] || value
}

const getSortValue = (engagement, sortBy) => {
  if (sortBy === 'anticipatedStart') {
    const anticipatedStart = engagement.anticipatedStart || engagement.anticipated_start || null
    if (!anticipatedStart) {
      return null
    }
    return ANTICIPATED_START_ORDER[anticipatedStart] || 0
  }
  return engagement.createdAt || engagement.createdOn || engagement.created || null
}

const getSortComparable = (value) => {
  if (value == null) {
    return null
  }
  if (typeof value === 'number') {
    return value
  }
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? null : parsed
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
  const normalizeValues = (values) => (
    Array.isArray(values)
      ? values.map(value => String(value).trim()).filter(Boolean)
      : []
  )
  const isAnyValue = (value) => value.toLowerCase() === 'any'

  const rawTimezones = normalizeValues(engagement.timezones)
  const rawCountries = normalizeValues(engagement.countries)
  const hasAnyLocation = rawTimezones.some(isAnyValue) || rawCountries.some(isAnyValue)
  const filteredTimezones = rawTimezones.filter(value => !isAnyValue(value))
  const filteredCountries = rawCountries.filter(value => !isAnyValue(value))

  const timezones = formatTimeZoneList(filteredTimezones, '')
  const countryLabel = hasAnyLocation || (!filteredCountries.length && !timezones)
    ? 'Remote'
    : (filteredCountries.length ? filteredCountries.join(', ') : '')

  if (timezones && countryLabel) {
    return `${timezones} / ${countryLabel}`
  }
  if (timezones) {
    return timezones
  }
  if (countryLabel) {
    return countryLabel
  }
  return 'Remote'
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
    return Array.from(new Set(assignments.map((assignment) => getMemberHandle(assignment)).filter(Boolean)))
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

const EngagementsList = ({
  engagements,
  projectId,
  projectDetail,
  isLoading,
  canManage
}) => {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_OPTION)
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0])
  const [sortOrder, setSortOrder] = useState(SORT_ORDER_OPTIONS[0])

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
      const comparableA = getSortComparable(valueA)
      const comparableB = getSortComparable(valueB)
      const normalizedA = comparableA == null ? 0 : comparableA
      const normalizedB = comparableB == null ? 0 : comparableB
      return sortOrder.value === 'asc' ? normalizedA - normalizedB : normalizedB - normalizedA
    })
    return sorted
  }, [engagements, statusFilter, searchText, sortBy, sortOrder])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className={styles.container}>
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
              <th>Anticipated Start</th>
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
                  <td>{engagement.title || '-'}</td>
                  <td>{duration}</td>
                  <td>{location}</td>
                  <td>{formatAnticipatedStart(engagement.anticipatedStart)}</td>
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
                      {engagement.id && assignedMembersCount > 0 ? (
                        <Tooltip content={assignedMembersTooltip}>
                          <span>
                            <Link
                              className={styles.applicationsLink}
                              to={`/projects/${projectId}/engagements/${engagement.id}/assignments`}
                            >
                              {assignedMembersCount}
                            </Link>
                          </span>
                        </Tooltip>
                      ) : (
                        assignedMembersCount
                      )}
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
  canManage: false
}

EngagementsList.propTypes = {
  engagements: PropTypes.arrayOf(PropTypes.shape()),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  projectDetail: PropTypes.shape({
    name: PropTypes.string
  }),
  isLoading: PropTypes.bool,
  canManage: PropTypes.bool
}

export default EngagementsList
