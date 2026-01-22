import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { OutlineButton } from '../Buttons'
import Loader from '../Loader'
import Select from '../Select'
import ApplicationDetail from '../ApplicationDetail'
import styles from './ApplicationsList.module.scss'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' }
]

const STATUS_UPDATE_OPTIONS = STATUS_OPTIONS.filter(option => option.value !== 'all')

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }
  return moment(value).format('MMM DD, YYYY HH:mm')
}

const getStatusClass = (status) => {
  const normalized = (status || '').toString().toLowerCase().replace(/\s+/g, '_')
  if (normalized === 'submitted') {
    return styles.statusSubmitted
  }
  if (normalized === 'under_review') {
    return styles.statusUnderReview
  }
  if (normalized === 'accepted') {
    return styles.statusAccepted
  }
  if (normalized === 'rejected') {
    return styles.statusRejected
  }
  return styles.statusSubmitted
}

const getStatusLabel = (status) => {
  const match = STATUS_UPDATE_OPTIONS.find(option => option.value === status)
  if (match) {
    return match.label
  }
  if (!status) {
    return '-'
  }
  return status.toString().replace(/_/g, ' ')
}

const ApplicationsList = ({
  applications,
  engagement,
  isLoading,
  canManage,
  onUpdateStatus
}) => {
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const menuPortalTarget = typeof document === 'undefined' ? undefined : document.body

  const filteredApplications = useMemo(() => {
    let results = applications || []
    if (statusFilter && statusFilter.value !== 'all') {
      results = results.filter(app => app.status === statusFilter.value)
    }
    return results
  }, [applications, statusFilter])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className={styles.container}>
      {selectedApplication && (
        <ApplicationDetail
          application={selectedApplication}
          engagement={engagement}
          canManage={canManage}
          onUpdateStatus={onUpdateStatus}
          onClose={() => setSelectedApplication(null)}
        />
      )}
      <div className={styles.header}>
        <div>
          <div className={styles.title}>
            {engagement && engagement.title
              ? `${engagement.title} Applications`
              : 'Applications'}
          </div>
          {engagement && engagement.description && (
            <div className={styles.subtitle}>{engagement.description}</div>
          )}
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status:</span>
            <span>{engagement && engagement.status ? engagement.status : '-'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Application Deadline:</span>
            <span>{formatDateTime(engagement && engagement.applicationDeadline)}</span>
          </div>
        </div>
      </div>
      <div className={styles.filters}>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(option) => setStatusFilter(option || STATUS_OPTIONS[0])}
          isClearable={false}
        />
      </div>

      {filteredApplications.length === 0 ? (
        <div className={styles.emptyState}>No applications found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Applicant Name</th>
              <th>Email</th>
              <th>Applied Date</th>
              <th>Years of Experience</th>
              <th>Availability</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application) => {
              const statusLabel = getStatusLabel(application.status)
              const statusClass = getStatusClass(application.status)
              const statusOption = STATUS_UPDATE_OPTIONS.find(option => option.value === application.status) || null

              return (
                <tr key={application.id || application.email}>
                  <td>{application.name || '-'}</td>
                  <td>{application.email || '-'}</td>
                  <td>{formatDateTime(application.createdAt)}</td>
                  <td>{application.yearsOfExperience != null ? application.yearsOfExperience : '-'}</td>
                  <td>{application.availability || '-'}</td>
                  <td>
                    <span className={`${styles.status} ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <OutlineButton
                        text='View Details'
                        type='info'
                        onClick={() => setSelectedApplication(application)}
                      />
                      {canManage && (
                        <div className={styles.statusSelect}>
                          <Select
                            options={STATUS_UPDATE_OPTIONS}
                            value={statusOption}
                            onChange={(option) => option && onUpdateStatus(application.id, option.value)}
                            isClearable={false}
                            menuPortalTarget={menuPortalTarget}
                          />
                        </div>
                      )}
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

ApplicationsList.defaultProps = {
  applications: [],
  engagement: null,
  isLoading: false,
  canManage: false,
  onUpdateStatus: () => {}
}

ApplicationsList.propTypes = {
  applications: PropTypes.arrayOf(PropTypes.shape()),
  engagement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    applicationDeadline: PropTypes.any
  }),
  isLoading: PropTypes.bool,
  canManage: PropTypes.bool,
  onUpdateStatus: PropTypes.func
}

export default ApplicationsList
