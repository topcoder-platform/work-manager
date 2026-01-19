import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import Modal from '../Modal'
import Select from '../Select'
import { OutlineButton } from '../Buttons'
import styles from './ApplicationDetail.module.scss'

const STATUS_OPTIONS = [
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' }
]

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
  const match = STATUS_OPTIONS.find(option => option.value === status)
  if (match) {
    return match.label
  }
  if (!status) {
    return '-'
  }
  return status.toString().replace(/_/g, ' ')
}

const ApplicationDetail = ({ application, engagement, canManage, onUpdateStatus, onClose }) => {
  if (!application) {
    return null
  }

  const statusLabel = getStatusLabel(application.status)
  const statusClass = getStatusClass(application.status)
  const statusOption = STATUS_OPTIONS.find(option => option.value === application.status) || null
  const portfolioUrls = Array.isArray(application.portfolioUrls) ? application.portfolioUrls : []

  return (
    <Modal onCancel={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Application Details</div>
          {engagement && engagement.title && (
            <div className={styles.subtitle}>{engagement.title}</div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Applicant</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.label}>Name</div>
              <div className={styles.value}>{application.name || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.label}>Email</div>
              <div className={styles.value}>{application.email || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.label}>Address</div>
              <div className={styles.value}>{application.address || '-'}</div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Application</div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.label}>Applied Date</div>
              <div className={styles.value}>{formatDateTime(application.createdAt)}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.label}>Years of Experience</div>
              <div className={styles.value}>
                {application.yearsOfExperience != null ? application.yearsOfExperience : '-'}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.label}>Availability</div>
              <div className={styles.value}>{application.availability || '-'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.label}>Status</div>
              <div className={styles.value}>
                <span className={`${styles.status} ${statusClass}`}>{statusLabel}</span>
              </div>
            </div>
            {canManage && (
              <div className={styles.detailItem}>
                <div className={styles.label}>Update Status</div>
                <div className={styles.statusControl}>
                  <Select
                    options={STATUS_OPTIONS}
                    value={statusOption}
                    onChange={(option) => option && onUpdateStatus(application.id, option.value)}
                    isClearable={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Links</div>
          <div className={styles.links}>
            <div className={styles.linkRow}>
              <span className={styles.linkLabel}>Resume</span>
              {application.resumeUrl ? (
                <a href={application.resumeUrl} target='_blank' rel='noopener noreferrer'>
                  {application.resumeUrl}
                </a>
              ) : (
                <span className={styles.value}>-</span>
              )}
            </div>
            <div className={styles.linkRow}>
              <span className={styles.linkLabel}>Portfolio</span>
              {portfolioUrls.length ? (
                <div className={styles.linkList}>
                  {portfolioUrls.map((url, index) => (
                    <a key={`${url}-${index}`} href={url} target='_blank' rel='noopener noreferrer'>
                      {url}
                    </a>
                  ))}
                </div>
              ) : (
                <span className={styles.value}>-</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Cover Letter</div>
          <div className={styles.coverLetter}>{application.coverLetter || '-'}</div>
        </div>

        <div className={styles.footer}>
          <OutlineButton text='Close' type='info' onClick={onClose} />
        </div>
      </div>
    </Modal>
  )
}

ApplicationDetail.defaultProps = {
  application: null,
  engagement: null,
  canManage: false,
  onUpdateStatus: () => {},
  onClose: () => {}
}

ApplicationDetail.propTypes = {
  application: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    coverLetter: PropTypes.string,
    resumeUrl: PropTypes.string,
    portfolioUrls: PropTypes.arrayOf(PropTypes.string),
    yearsOfExperience: PropTypes.number,
    availability: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.any
  }),
  engagement: PropTypes.shape({
    title: PropTypes.string
  }),
  canManage: PropTypes.bool,
  onUpdateStatus: PropTypes.func,
  onClose: PropTypes.func
}

export default ApplicationDetail
