import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { OutlineButton, PrimaryButton } from '../Buttons'
import Loader from '../Loader'
import Select from '../Select'
import ApplicationDetail from '../ApplicationDetail'
import Modal from '../Modal'
import DateInput from '../DateInput'
import Handle from '../Handle'
import styles from './ApplicationsList.module.scss'
import { PROFILE_URL } from '../../config/constants'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Selected', value: 'SELECTED' },
  { label: 'Rejected', value: 'REJECTED' }
]

const STATUS_UPDATE_OPTIONS = STATUS_OPTIONS.filter(option => option.value !== 'all')
const INPUT_DATE_FORMAT = 'MM/dd/yyyy'
const INPUT_TIME_FORMAT = 'HH:mm'

const ANTICIPATED_START_LABELS = {
  IMMEDIATE: 'Immediate',
  FEW_DAYS: 'In a few days',
  FEW_WEEKS: 'In a few weeks'
}

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }
  return moment(value).format('MMM DD, YYYY HH:mm')
}

const formatAnticipatedStart = (value) => {
  if (!value) {
    return '-'
  }
  return ANTICIPATED_START_LABELS[value] || value
}

const getStatusClass = (status) => {
  const normalized = (status || '').toString().toLowerCase().replace(/\s+/g, '_')
  if (normalized === 'submitted') {
    return styles.statusSubmitted
  }
  if (normalized === 'under_review') {
    return styles.statusUnderReview
  }
  if (normalized === 'selected') {
    return styles.statusSelected
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

const getApplicationName = (application) => {
  if (!application) {
    return null
  }
  const fullName = [application.firstName, application.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return fullName || application.name || application.email || null
}

const getApplicationRating = (application) => {
  if (!application) {
    return undefined
  }
  const rating = [
    application.rating,
    application.maxRating,
    application.memberRating,
    application.member && application.member.rating,
    application.member && application.member.maxRating && application.member.maxRating.rating,
    application.member && application.member.maxRating,
    application.user && application.user.rating,
    application.user && application.user.maxRating && application.user.maxRating.rating,
    application.user && application.user.maxRating
  ].find(value => value !== undefined && value !== null && value !== '')

  if (rating === undefined || rating === null || rating === '') {
    return undefined
  }

  const parsed = Number(rating)
  return Number.isFinite(parsed) ? parsed : undefined
}

const normalizeAssignmentStatus = (status) => {
  if (!status) {
    return ''
  }
  return status
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
}

const toValidMoment = (value) => {
  if (!value) {
    return null
  }
  if (moment.isMoment(value)) {
    return value.isValid() ? value : null
  }
  const parsed = moment(value)
  return parsed.isValid() ? parsed : null
}

const isActiveAssignmentStatus = (status) => {
  const normalized = normalizeAssignmentStatus(status)
  return normalized === 'ASSIGNED' || normalized === 'ACTIVE'
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
  const [acceptApplication, setAcceptApplication] = useState(null)
  const [acceptSuccess, setAcceptSuccess] = useState(null)
  const [acceptStartDate, setAcceptStartDate] = useState(null)
  const [acceptEndDate, setAcceptEndDate] = useState(null)
  const [acceptRate, setAcceptRate] = useState('')
  const [acceptOtherRemarks, setAcceptOtherRemarks] = useState('')
  const [acceptErrors, setAcceptErrors] = useState({})
  const [isAccepting, setIsAccepting] = useState(false)
  const menuPortalTarget = typeof document === 'undefined' ? undefined : document.body
  const acceptHandle = getApplicationHandle(acceptApplication)
  const acceptRating = getApplicationRating(acceptApplication)
  const acceptHandleColor = Number.isFinite(acceptRating) ? undefined : '#000'
  const acceptName = getApplicationName(acceptApplication) || 'Selected applicant'
  const acceptSuccessLabel = acceptSuccess ? acceptSuccess.memberLabel : null
  const today = moment().startOf('day')
  const parsedAcceptStart = acceptStartDate ? moment(acceptStartDate) : null
  const parsedAcceptStartDay = parsedAcceptStart && parsedAcceptStart.isValid()
    ? parsedAcceptStart.clone().startOf('day')
    : null
  const minEndDay = parsedAcceptStartDay && parsedAcceptStartDay.isAfter(today) ? parsedAcceptStartDay : today
  const isAcceptStartDateValid = (current) => {
    const currentMoment = toValidMoment(current)
    if (!currentMoment) {
      return false
    }
    return currentMoment.isSameOrAfter(today, 'day')
  }
  const isAcceptEndDateValid = (current) => {
    const currentMoment = toValidMoment(current)
    if (!currentMoment) {
      return false
    }
    return currentMoment.isSameOrAfter(minEndDay, 'day')
  }
  const getMinStartDateTime = () => moment().toDate()
  const getMinEndDateTime = () => {
    const now = moment()
    if (parsedAcceptStart && parsedAcceptStart.isValid() && parsedAcceptStart.isAfter(now)) {
      return parsedAcceptStart.toDate()
    }
    return now.toDate()
  }
  const acceptSubtitle = acceptHandle ? (
    <div className={styles.acceptHandleLine}>
      <Handle
        handle={acceptHandle}
        rating={acceptRating}
        color={acceptHandleColor}
        className={styles.acceptHandle}
      />
      {acceptName && (
        <span className={styles.acceptDivider}>/</span>
      )}
      <span>{acceptName}</span>
    </div>
  ) : acceptName

  const activeAssignmentMemberIds = useMemo(() => {
    const assignments = Array.isArray(engagement && engagement.assignments)
      ? engagement.assignments
      : []
    const activeAssignmentIds = assignments
      .filter((assignment) => {
        if (!assignment) {
          return false
        }
        return isActiveAssignmentStatus(assignment.status || assignment.assignmentStatus)
      })
      .map((assignment) => assignment.memberId)
      .filter(Boolean)
    return new Set(activeAssignmentIds.map((memberId) => String(memberId)))
  }, [engagement])

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

  const resetAcceptState = () => {
    setAcceptApplication(null)
    setAcceptStartDate(null)
    setAcceptEndDate(null)
    setAcceptRate('')
    setAcceptOtherRemarks('')
    setAcceptErrors({})
    setIsAccepting(false)
  }

  const handleCloseAcceptModal = () => {
    resetAcceptState()
  }

  const handleCloseAcceptSuccessModal = () => {
    setAcceptSuccess(null)
  }

  const openAcceptModal = (application) => {
    setAcceptApplication(application)
    setAcceptStartDate(null)
    setAcceptEndDate(null)
    setAcceptRate('')
    setAcceptOtherRemarks('')
    setAcceptErrors({})
    setIsAccepting(false)
  }

  const handleAcceptSubmit = async () => {
    if (!acceptApplication || isAccepting) {
      return
    }

    const nextErrors = {}
    const parsedStart = acceptStartDate ? moment(acceptStartDate) : null
    const parsedEnd = acceptEndDate ? moment(acceptEndDate) : null
    const normalizedRate = acceptRate != null ? String(acceptRate).trim() : ''
    const normalizedOtherRemarks = acceptOtherRemarks != null ? String(acceptOtherRemarks).trim() : ''

    if (!parsedStart || !parsedStart.isValid()) {
      nextErrors.startDate = 'Start date is required.'
    }
    if (!parsedEnd || !parsedEnd.isValid()) {
      nextErrors.endDate = 'End date is required.'
    }
    if (!normalizedRate) {
      nextErrors.rate = 'Assignment rate is required.'
    }
    if (parsedStart && parsedEnd && parsedStart.isValid() && parsedEnd.isValid() && parsedEnd.isBefore(parsedStart)) {
      nextErrors.endDate = 'End date must be after start date.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setAcceptErrors(nextErrors)
      return
    }

    setIsAccepting(true)
    try {
      await onUpdateStatus(acceptApplication.id, 'SELECTED', {
        startDate: parsedStart.toISOString(),
        endDate: parsedEnd.toISOString(),
        agreementRate: normalizedRate,
        ...(normalizedOtherRemarks ? { otherRemarks: normalizedOtherRemarks } : {})
      })
      const memberHandle = getApplicationHandle(acceptApplication)
      const memberName = getApplicationName(acceptApplication) || 'Selected applicant'
      const memberLabel = memberHandle && memberName
        ? `${memberHandle} / ${memberName}`
        : (memberHandle || memberName)
      setAcceptSuccess({ memberLabel })
      resetAcceptState()
    } catch (error) {
      setIsAccepting(false)
    }
  }

  const handleStatusChange = (application, option) => {
    if (!option) {
      return
    }
    if (option.value === 'SELECTED') {
      if (application.status === 'SELECTED') {
        return
      }
      openAcceptModal(application)
      return
    }
    onUpdateStatus(application.id, option.value)
  }

  return (
    <div className={styles.container}>
      {selectedApplication && (
        <ApplicationDetail
          application={selectedApplication}
          engagement={engagement}
          onClose={() => setSelectedApplication(null)}
        />
      )}
      {acceptApplication && (
        <Modal onCancel={handleCloseAcceptModal}>
          <div className={styles.acceptModal}>
            <div className={styles.acceptTitle}>Accept Application</div>
            <div className={styles.acceptSubtitle}>
              {acceptSubtitle}
            </div>
            <div className={styles.acceptGrid}>
              <div className={styles.acceptField}>
                <label className={styles.acceptLabel}>
                  Tentative start date
                  <span className={styles.acceptRequired}>*</span>
                </label>
                <DateInput
                  className={styles.acceptDateInput}
                  value={acceptStartDate}
                  dateFormat={INPUT_DATE_FORMAT}
                  timeFormat={INPUT_TIME_FORMAT}
                  minDateTime={getMinStartDateTime}
                  isValidDate={isAcceptStartDateValid}
                  onChange={(value) => {
                    setAcceptStartDate(value)
                    if (acceptErrors.startDate) {
                      setAcceptErrors(prev => ({ ...prev, startDate: '' }))
                    }
                  }}
                />
                {acceptErrors.startDate && (
                  <div className={styles.acceptError}>{acceptErrors.startDate}</div>
                )}
              </div>
              <div className={styles.acceptField}>
                <label className={styles.acceptLabel}>
                  Tentative end date
                  <span className={styles.acceptRequired}>*</span>
                </label>
                <DateInput
                  className={styles.acceptDateInput}
                  value={acceptEndDate}
                  dateFormat={INPUT_DATE_FORMAT}
                  timeFormat={INPUT_TIME_FORMAT}
                  minDateTime={getMinEndDateTime}
                  isValidDate={isAcceptEndDateValid}
                  onChange={(value) => {
                    setAcceptEndDate(value)
                    if (acceptErrors.endDate) {
                      setAcceptErrors(prev => ({ ...prev, endDate: '' }))
                    }
                  }}
                />
                {acceptErrors.endDate && (
                  <div className={styles.acceptError}>{acceptErrors.endDate}</div>
                )}
              </div>
              <div className={styles.acceptFieldFull}>
                <label className={styles.acceptLabel}>
                  Assignment rate (per week)
                  <span className={styles.acceptRequired}>*</span>
                </label>
                <input
                  className={styles.acceptInput}
                  type='number'
                  min='0'
                  step='0.01'
                  value={acceptRate}
                  onChange={(event) => {
                    setAcceptRate(event.target.value)
                    if (acceptErrors.rate) {
                      setAcceptErrors(prev => ({ ...prev, rate: '' }))
                    }
                  }}
                />
                {acceptErrors.rate && (
                  <div className={styles.acceptError}>{acceptErrors.rate}</div>
                )}
              </div>
              <div className={styles.acceptFieldFull}>
                <label className={styles.acceptLabel}>Other remarks</label>
                <textarea
                  className={styles.acceptTextarea}
                  rows={3}
                  value={acceptOtherRemarks}
                  onChange={(event) => setAcceptOtherRemarks(event.target.value)}
                />
              </div>
            </div>
            <div className={styles.acceptActions}>
              <OutlineButton
                text='Cancel'
                type='info'
                onClick={handleCloseAcceptModal}
                disabled={isAccepting}
              />
              <PrimaryButton
                text={isAccepting ? 'Saving...' : 'Confirm'}
                type='info'
                onClick={handleAcceptSubmit}
                disabled={isAccepting}
              />
            </div>
          </div>
        </Modal>
      )}
      {acceptSuccess && (
        <Modal onCancel={handleCloseAcceptSuccessModal}>
          <div className={styles.acceptModal}>
            <div className={styles.acceptTitle}>Application Selected</div>
            <div className={styles.acceptSuccessMessage}>
              The application has been selected and member {acceptSuccessLabel} has been notified. The next step is that they will either accept or reject the application.
            </div>
            <div className={styles.acceptActions}>
              <PrimaryButton text='Close' type='info' onClick={handleCloseAcceptSuccessModal} />
            </div>
          </div>
        </Modal>
      )}
      <div className={styles.header}>
        <div>
          <div className={styles.title}>
            {engagement && engagement.title
              ? `${engagement.title} Applications`
              : 'Applications'}
          </div>
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status:</span>
            <span>{engagement && engagement.status ? engagement.status : '-'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Anticipated Start:</span>
            <span>{formatAnticipatedStart(engagement && engagement.anticipatedStart)}</span>
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
              <th className={styles.assignedHeader}>Active</th>
              <th className={styles.handleHeader}>Handle</th>
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
              const applicationUserId = application.userId || application.user_id || application.memberId || application.member_id
              const isActive = applicationUserId != null && activeAssignmentMemberIds.has(String(applicationUserId))
              const applicationHandle = getApplicationHandle(application)

              return (
                <tr key={application.id || application.email}>
                  <td className={styles.assignedCell}>
                    {isActive && (
                      <span className={styles.assignedIndicator} title='Active'>
                        <FontAwesomeIcon className={styles.assignedIcon} icon={faCheck} />
                      </span>
                    )}
                  </td>
                  <td className={styles.handleCell}>
                    {applicationHandle ? (
                      <a
                        className={styles.handleLink}
                        href={`${PROFILE_URL}${applicationHandle}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {applicationHandle}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
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
                            onChange={(option) => handleStatusChange(application, option)}
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
    anticipatedStart: PropTypes.string,
    assignedMembers: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    assignments: PropTypes.arrayOf(PropTypes.shape({
      memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      assignmentStatus: PropTypes.string
    }))
  }),
  isLoading: PropTypes.bool,
  canManage: PropTypes.bool,
  onUpdateStatus: PropTypes.func
}

export default ApplicationsList
