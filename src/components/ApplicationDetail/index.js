import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import Modal from '../Modal'
import { OutlineButton } from '../Buttons'
import styles from './ApplicationDetail.module.scss'
import { PROFILE_URL } from '../../config/constants'
import { downloadMemberProfile } from '../../services/user'
import { isValidDownloadFile } from '../../util/topcoder-react-lib'

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

const formatMobileNumber = (value) => {
  if (!value) {
    return '-'
  }

  const rawValue = value.toString().trim()
  if (!rawValue) {
    return '-'
  }

  let digits = rawValue.replace(/\D/g, '')
  if (!digits) {
    return '-'
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  if (digits.length > 10) {
    const countryCode = digits.slice(0, digits.length - 10)
    const nationalNumber = digits.slice(-10)
    return `+${countryCode} (${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6)}`
  }

  if (digits.length === 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return digits
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

const getApplicationHandle = (application) => {
  if (!application) {
    return null
  }
  return [
    application.handle,
    application.memberHandle,
    application.userHandle,
    application.username,
    application.userName,
    application.member && application.member.handle,
    application.user && application.user.handle
  ].find(Boolean) || null
}

const ApplicationDetail = ({ application, engagement, onClose }) => {
  if (!application) {
    return null
  }

  const statusLabel = getStatusLabel(application.status)
  const statusClass = getStatusClass(application.status)
  const portfolioUrls = Array.isArray(application.portfolioUrls) ? application.portfolioUrls : []
  const applicationHandle = getApplicationHandle(application)
  const profileUrl = applicationHandle ? `${PROFILE_URL}${applicationHandle}` : null

  const handleProfileDownload = async () => {
    if (!applicationHandle) {
      return
    }

    try {
      const blob = await downloadMemberProfile(applicationHandle)
      const validation = await isValidDownloadFile(blob)
      if (!validation.success) {
        if (validation.message) {
          console.error(validation.message)
        }
        return
      }

      const url = window.URL.createObjectURL(new window.Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${applicationHandle}-profile.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download member profile.', error)
    }
  }

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
              <div className={styles.label}>Handle</div>
              <div className={styles.value}>
                {applicationHandle ? (
                  <div className={styles.handleRow}>
                    <a
                      className={styles.handleLink}
                      href={profileUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {applicationHandle}
                    </a>
                    <button
                      className={styles.downloadButton}
                      type='button'
                      onClick={handleProfileDownload}
                      aria-label='Download profile PDF'
                      title='Download profile PDF'
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.label}>Mobile Number</div>
              <div className={styles.value}>{formatMobileNumber(application.mobileNumber)}</div>
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
  onClose: () => {}
}

ApplicationDetail.propTypes = {
  application: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    mobileNumber: PropTypes.string,
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
  onClose: PropTypes.func
}

export default ApplicationDetail
