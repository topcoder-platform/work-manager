import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import moment from 'moment-timezone'
import cn from 'classnames'
import { PrimaryButton, OutlineButton } from '../Buttons'
import DescriptionField from './DescriptionField'
import Select from '../Select'
import SkillsField from '../ChallengeEditor/SkillsField'
import ConfirmationModal from '../Modal/ConfirmationModal'
import Loader from '../Loader'
import Modal from '../Modal'
import DateInput from '../DateInput'
import Handle from '../Handle'
import { JOB_ROLE_OPTIONS, JOB_WORKLOAD_OPTIONS } from '../../config/constants'
import { suggestProfiles } from '../../services/user'
import { getCountableAssignments } from '../../util/engagements'
import { formatTimeZoneLabel, formatTimeZoneList } from '../../util/timezones'
import styles from './EngagementEditor.module.scss'

const ANY_OPTION = { label: 'Any', value: 'Any' }
const INPUT_DATE_FORMAT = 'MM/dd/yyyy'
const INPUT_TIME_FORMAT = 'HH:mm'
const ANTICIPATED_START_OPTIONS = [
  { label: 'Immediate', value: 'Immediate' },
  { label: 'In a few days', value: 'In a few days' },
  { label: 'In a few weeks', value: 'In a few weeks' }
]

const getEmptyEngagement = () => ({
  title: '',
  description: '',
  timezones: [],
  countries: [],
  skills: [],
  durationWeeks: '',
  role: null,
  workload: null,
  compensationRange: '',
  anticipatedStart: null,
  status: 'Open',
  isPrivate: false,
  requiredMemberCount: '',
  assignedMemberHandles: [],
  assignmentDetails: []
})

const normalizeAnySelection = (selectedOptions) => {
  if (!selectedOptions || !selectedOptions.length) {
    return []
  }
  const hasAny = selectedOptions.some(option => option.value === ANY_OPTION.value)
  if (hasAny) {
    return [ANY_OPTION]
  }
  return selectedOptions
}

const normalizeMemberInfo = (member, index) => {
  if (!member) {
    return { id: null, handle: '-', key: `member-${index}` }
  }
  if (typeof member === 'string') {
    return { id: null, handle: member, key: member }
  }
  const handle = member.handle || member.memberHandle || member.username || member.name || member.userHandle || member.userName || '-'
  const id = member.id || member.memberId || member.userId || null
  const assignmentId = member.assignmentId || null
  return {
    id,
    handle,
    key: id || handle || `member-${index}`,
    assignmentId
  }
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

const formatAssignmentDate = (value) => {
  if (!value) {
    return '-'
  }
  return moment(value).format('MMM DD, YYYY HH:mm')
}

const EngagementEditor = ({
  engagement,
  projectId,
  isNew,
  isLoading,
  isSaving,
  canEdit,
  submitTriggered,
  validationErrors,
  showDeleteModal,
  onToggleDelete,
  onUpdateInput,
  onUpdateDescription,
  onUpdateSkills,
  onSavePublish,
  onCancel,
  onDelete,
  resolvedAssignedMembers
}) => {
  const [assignModal, setAssignModal] = useState(null)
  const [assignStartDate, setAssignStartDate] = useState(null)
  const [assignEndDate, setAssignEndDate] = useState(null)
  const [assignRate, setAssignRate] = useState('')
  const [assignOtherRemarks, setAssignOtherRemarks] = useState('')
  const [assignErrors, setAssignErrors] = useState({})
  const { timeZoneOptions, timeZoneOptionByZone } = useMemo(() => {
    const optionByLabel = new Map()
    moment.tz.names().forEach((zone) => {
      const label = formatTimeZoneLabel(zone)
      if (!label) {
        return
      }
      const normalizedLabel = label.toLowerCase()
      let option = optionByLabel.get(normalizedLabel)
      if (!option) {
        option = { label, value: label, zones: [] }
        optionByLabel.set(normalizedLabel, option)
      }
      option.zones.push(zone)
    })

    const options = Array.from(optionByLabel.values())
    const optionByZone = new Map()
    options.forEach((option) => {
      option.zones.forEach((zone) => {
        optionByZone.set(zone, option)
      })
    })

    return {
      timeZoneOptions: [ANY_OPTION, ...options],
      timeZoneOptionByZone: optionByZone
    }
  }, [])

  const countryOptions = useMemo(() => {
    const displayNames = typeof Intl !== 'undefined' && Intl.DisplayNames
      ? new Intl.DisplayNames(['en'], { type: 'region' })
      : null
    const countries = moment.tz.countries().map(code => ({
      label: displayNames ? displayNames.of(code) : code,
      value: code
    }))
    countries.sort((a, b) => a.label.localeCompare(b.label))
    return [ANY_OPTION, ...countries]
  }, [])

  const countryOptionsByValue = useMemo(() => {
    return countryOptions.reduce((acc, option) => {
      acc[option.value] = option
      return acc
    }, {})
  }, [countryOptions])

  const selectedTimeZones = useMemo(() => {
    const timeZones = Array.isArray(engagement.timezones) ? engagement.timezones : []
    if (timeZones.includes(ANY_OPTION.value)) {
      return [ANY_OPTION]
    }

    const selected = []
    const seen = new Set()
    timeZones.forEach((zone) => {
      const option = timeZoneOptionByZone.get(zone)
      if (option) {
        const key = option.value.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          selected.push(option)
        }
        return
      }
      const label = formatTimeZoneLabel(zone)
      if (!label) {
        return
      }
      const normalizedLabel = label.toLowerCase()
      if (seen.has(normalizedLabel)) {
        return
      }
      seen.add(normalizedLabel)
      selected.push({ label, value: label, zones: [zone] })
    })

    return selected
  }, [engagement.timezones, timeZoneOptionByZone])

  const selectedCountries = (engagement.countries || []).map(code => {
    return countryOptionsByValue[code] || { label: code, value: code }
  })
  const selectedRoleOption = useMemo(() => {
    if (!engagement.role) {
      return null
    }
    return JOB_ROLE_OPTIONS.find(option => option.value === engagement.role || option.label === engagement.role) || null
  }, [engagement.role])

  const selectedWorkloadOption = useMemo(() => {
    if (!engagement.workload) {
      return null
    }
    return JOB_WORKLOAD_OPTIONS.find(option => option.value === engagement.workload || option.label === engagement.workload) || null
  }, [engagement.workload])

  const selectedAnticipatedStartOption = useMemo(() => {
    if (!engagement.anticipatedStart) {
      return null
    }
    return ANTICIPATED_START_OPTIONS.find(option => option.value === engagement.anticipatedStart || option.label === engagement.anticipatedStart) || null
  }, [engagement.anticipatedStart])

  const roleLabel = selectedRoleOption ? selectedRoleOption.label : engagement.role
  const workloadLabel = selectedWorkloadOption ? selectedWorkloadOption.label : engagement.workload
  const anticipatedStartLabel = selectedAnticipatedStartOption ? selectedAnticipatedStartOption.label : engagement.anticipatedStart
  const assignments = Array.isArray(engagement.assignments) ? engagement.assignments : []
  const countableAssignments = useMemo(() => {
    return getCountableAssignments(assignments)
  }, [assignments])
  const assignedMembers = Array.isArray(engagement.assignedMembers) ? engagement.assignedMembers : []
  const assignedMemberHandles = Array.isArray(engagement.assignedMemberHandles) ? engagement.assignedMemberHandles : []
  const assignmentDetails = Array.isArray(engagement.assignmentDetails) ? engagement.assignmentDetails : []
  const assignmentDetailsByHandle = useMemo(() => {
    return assignmentDetails.reduce((acc, detail) => {
      const handle = detail && detail.memberHandle
      if (!handle) {
        return acc
      }
      const key = handle.toLowerCase()
      if (!acc[key]) {
        acc[key] = detail
      }
      return acc
    }, {})
  }, [assignmentDetails])
  const assignedMemberList = useMemo(() => {
    if (countableAssignments.length > 0) {
      return countableAssignments.map((assignment, index) => ({
        id: assignment.memberId,
        handle: assignment.memberHandle,
        key: assignment.id || `assignment-${index}`,
        assignmentId: assignment.id
      }))
    }
    if (resolvedAssignedMembers.length) {
      return resolvedAssignedMembers
    }
    if (assignedMembers.length) {
      return assignedMembers.map((member, index) => normalizeMemberInfo(member, index))
    }
    return assignedMemberHandles.map((member, index) => normalizeMemberInfo(member, index))
  }, [countableAssignments, resolvedAssignedMembers, assignedMembers, assignedMemberHandles])
  const showAssignedMembers = assignedMemberList.length > 0
  const assignedMemberCount = assignedMemberList.length
  const requiredMemberCountValue = Number(engagement.requiredMemberCount)
  const assignmentFieldCount = Math.max(1, requiredMemberCountValue || 1)
  const assignmentFieldIndices = Array.from({ length: assignmentFieldCount }, (_, index) => index)
  const hasRequiredMemberCount = Number.isInteger(requiredMemberCountValue) && requiredMemberCountValue > 0
  const isFullyStaffed = hasRequiredMemberCount && assignedMemberCount >= requiredMemberCountValue
  const assignedMemberLabel = assignedMemberCount === 1 ? 'member' : 'members'
  const requiredMemberLabel = requiredMemberCountValue === 1 ? 'member' : 'members'
  let assignmentProgressText = 'No members assigned'

  if (assignedMemberCount > 0) {
    if (!hasRequiredMemberCount) {
      assignmentProgressText = `${assignedMemberCount} ${assignedMemberLabel} assigned (no limit set)`
    } else if (isFullyStaffed) {
      assignmentProgressText = `Fully staffed (${assignedMemberCount} ${assignedMemberLabel})`
    } else {
      assignmentProgressText = `${assignedMemberCount} of ${requiredMemberCountValue} ${requiredMemberLabel} assigned`
    }
  }

  const assignmentProgressClassName = cn(
    styles.assignmentProgress,
    isFullyStaffed ? styles.assignmentProgressComplete : styles.assignmentProgressPartial
  )
  const assignHandle = assignModal ? assignModal.handle : null
  const assignHandleColor = assignHandle ? '#000' : undefined
  const today = moment().startOf('day')
  const parsedAssignStart = assignStartDate ? moment(assignStartDate) : null
  const parsedAssignStartDay = parsedAssignStart && parsedAssignStart.isValid()
    ? parsedAssignStart.clone().startOf('day')
    : null
  const minAssignEndDay = parsedAssignStartDay && parsedAssignStartDay.isAfter(today) ? parsedAssignStartDay : today
  const isAssignStartDateValid = (current) => {
    const currentMoment = toValidMoment(current)
    if (!currentMoment) {
      return false
    }
    return currentMoment.isSameOrAfter(today, 'day')
  }
  const isAssignEndDateValid = (current) => {
    const currentMoment = toValidMoment(current)
    if (!currentMoment) {
      return false
    }
    return currentMoment.isSameOrAfter(minAssignEndDay, 'day')
  }
  const getMinAssignStartDateTime = () => moment().toDate()
  const getMinAssignEndDateTime = () => {
    const now = moment()
    if (parsedAssignStart && parsedAssignStart.isValid() && parsedAssignStart.isAfter(now)) {
      return parsedAssignStart.toDate()
    }
    return now.toDate()
  }
  const assignSubtitle = assignHandle ? (
    <div className={styles.acceptHandleLine}>
      <Handle
        handle={assignHandle}
        color={assignHandleColor}
        className={styles.acceptHandle}
      />
    </div>
  ) : null

  const loadMemberOptions = (inputValue) => {
    if (!inputValue) {
      return Promise.resolve([])
    }
    return suggestProfiles(inputValue).then((profiles = []) => {
      return profiles
        .map((profile) => {
          const handle = typeof profile === 'string' ? profile : profile.handle
          return handle ? { label: handle, value: handle } : null
        })
        .filter(Boolean)
    })
  }

  const resetAssignState = () => {
    setAssignModal(null)
    setAssignStartDate(null)
    setAssignEndDate(null)
    setAssignRate('')
    setAssignOtherRemarks('')
    setAssignErrors({})
  }

  const openAssignModal = (index, handle) => {
    const normalizedHandle = handle ? handle.toLowerCase() : null
    const existingDetails = normalizedHandle ? assignmentDetailsByHandle[normalizedHandle] : null
    setAssignModal({ index, handle })
    setAssignStartDate(existingDetails ? existingDetails.startDate || null : null)
    setAssignEndDate(existingDetails ? existingDetails.endDate || null : null)
    setAssignRate(existingDetails ? existingDetails.agreementRate || '' : '')
    setAssignOtherRemarks(existingDetails ? existingDetails.otherRemarks || '' : '')
    setAssignErrors({})
  }

  const handleCloseAssignModal = () => {
    resetAssignState()
  }

  const handleAssignSubmit = () => {
    if (!assignModal) {
      return
    }

    const nextErrors = {}
    const parsedStart = assignStartDate ? moment(assignStartDate) : null
    const parsedEnd = assignEndDate ? moment(assignEndDate) : null
    const normalizedRate = assignRate != null ? String(assignRate).trim() : ''
    const normalizedOtherRemarks = assignOtherRemarks != null ? String(assignOtherRemarks).trim() : ''

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
      setAssignErrors(nextErrors)
      return
    }

    const nextAssignedMemberHandles = Array.from(
      { length: assignmentFieldCount },
      (_, handleIndex) => assignedMemberHandles[handleIndex] || ''
    )
    const nextAssignmentDetails = Array.from(
      { length: assignmentFieldCount },
      (_, detailIndex) => assignmentDetails[detailIndex] || null
    )
    nextAssignedMemberHandles[assignModal.index] = assignModal.handle
    nextAssignmentDetails[assignModal.index] = {
      memberHandle: assignModal.handle,
      startDate: parsedStart.toISOString(),
      endDate: parsedEnd.toISOString(),
      agreementRate: normalizedRate,
      otherRemarks: normalizedOtherRemarks
    }

    onUpdateInput({
      target: {
        name: 'assignedMemberHandles',
        value: nextAssignedMemberHandles
      }
    })
    onUpdateInput({
      target: {
        name: 'assignmentDetails',
        value: nextAssignmentDetails
      }
    })
    resetAssignState()
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className={styles.wrapper}>
      <Helmet title={isNew ? 'Create Engagement' : 'Edit Engagement'} />
      {showDeleteModal && (
        <ConfirmationModal
          title='Confirm Delete'
          message={`Do you want to delete "${engagement.title || 'this engagement'}"?`}
          isProcessing={isSaving}
          onCancel={onToggleDelete}
          onConfirm={onDelete}
        />
      )}
      {assignModal && (
        <Modal onCancel={handleCloseAssignModal}>
          <div className={styles.acceptModal}>
            <div className={styles.acceptTitle}>Assign Member</div>
            {assignSubtitle && (
              <div className={styles.acceptSubtitle}>
                {assignSubtitle}
              </div>
            )}
            <div className={styles.acceptGrid}>
              <div className={styles.acceptField}>
                <label className={styles.acceptLabel}>
                  Tentative start date
                  <span className={styles.acceptRequired}>*</span>
                </label>
                <DateInput
                  className={styles.acceptDateInput}
                  value={assignStartDate}
                  dateFormat={INPUT_DATE_FORMAT}
                  timeFormat={INPUT_TIME_FORMAT}
                  minDateTime={getMinAssignStartDateTime}
                  isValidDate={isAssignStartDateValid}
                  onChange={(value) => {
                    setAssignStartDate(value)
                    if (assignErrors.startDate) {
                      setAssignErrors(prev => ({ ...prev, startDate: '' }))
                    }
                  }}
                />
                {assignErrors.startDate && (
                  <div className={styles.acceptError}>{assignErrors.startDate}</div>
                )}
              </div>
              <div className={styles.acceptField}>
                <label className={styles.acceptLabel}>
                  Tentative end date
                  <span className={styles.acceptRequired}>*</span>
                </label>
                <DateInput
                  className={styles.acceptDateInput}
                  value={assignEndDate}
                  dateFormat={INPUT_DATE_FORMAT}
                  timeFormat={INPUT_TIME_FORMAT}
                  minDateTime={getMinAssignEndDateTime}
                  isValidDate={isAssignEndDateValid}
                  onChange={(value) => {
                    setAssignEndDate(value)
                    if (assignErrors.endDate) {
                      setAssignErrors(prev => ({ ...prev, endDate: '' }))
                    }
                  }}
                />
                {assignErrors.endDate && (
                  <div className={styles.acceptError}>{assignErrors.endDate}</div>
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
                  value={assignRate}
                  onChange={(event) => {
                    setAssignRate(event.target.value)
                    if (assignErrors.rate) {
                      setAssignErrors(prev => ({ ...prev, rate: '' }))
                    }
                  }}
                />
                {assignErrors.rate && (
                  <div className={styles.acceptError}>{assignErrors.rate}</div>
                )}
              </div>
              <div className={styles.acceptFieldFull}>
                <label className={styles.acceptLabel}>Other remarks</label>
                <textarea
                  className={styles.acceptTextarea}
                  rows={3}
                  value={assignOtherRemarks}
                  onChange={(event) => setAssignOtherRemarks(event.target.value)}
                />
              </div>
            </div>
            <div className={styles.acceptActions}>
              <OutlineButton
                text='Cancel'
                type='info'
                onClick={handleCloseAssignModal}
              />
              <PrimaryButton
                text='Confirm'
                type='info'
                onClick={handleAssignSubmit}
              />
            </div>
          </div>
        </Modal>
      )}
      <div className={styles.topContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.title}>
            {isNew ? 'New Engagement' : (engagement.title || 'Engagement')}
          </div>
        </div>
        <div className={styles.actions}>
          <OutlineButton
            text='Cancel'
            type='info'
            onClick={onCancel}
            disabled={isSaving}
          />
          {canEdit && (
            <PrimaryButton
              text='Publish'
              type='info'
              onClick={onSavePublish}
              disabled={isSaving}
            />
          )}
        </div>
      </div>
      <div className={styles.textRequired}>* Required</div>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <form>
            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='title'>Title <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='title'
                    name='title'
                    type='text'
                    value={engagement.title}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{engagement.title || '-'}</div>
                )}
                {submitTriggered && validationErrors.title && (
                  <div className={styles.error}>{validationErrors.title}</div>
                )}
              </div>
            </div>

            <div className={cn(styles.row, styles.descriptionRow)}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='description'>Description <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                <DescriptionField
                  key={engagement.id || 'new-engagement'}
                  engagement={engagement}
                  onUpdateDescription={onUpdateDescription}
                  readOnly={!canEdit}
                  isPrivate={engagement.isPrivate}
                />
                {submitTriggered && validationErrors.description && (
                  <div className={styles.error}>{validationErrors.description}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='durationWeeks'>Duration (Weeks) <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='durationWeeks'
                    name='durationWeeks'
                    type='number'
                    min='4'
                    step='1'
                    value={engagement.durationWeeks}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {engagement.durationWeeks ? `${engagement.durationWeeks} weeks` : '-'}
                  </div>
                )}
                {submitTriggered && validationErrors.durationWeeks && (
                  <div className={styles.error}>{validationErrors.durationWeeks}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='role'>Role :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    className={styles.selectInput}
                    useBottomBorder
                    options={JOB_ROLE_OPTIONS}
                    value={selectedRoleOption}
                    onChange={(option) => onUpdateInput({
                      target: {
                        name: 'role',
                        value: option && option.value ? option.label : null
                      }
                    })}
                    isClearable
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{roleLabel || 'Not specified'}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor='workload'>Workload :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    className={styles.selectInput}
                    useBottomBorder
                    options={JOB_WORKLOAD_OPTIONS}
                    value={selectedWorkloadOption}
                    onChange={(option) => onUpdateInput({
                      target: {
                        name: 'workload',
                        value: option && option.value ? option.label : null
                      }
                    })}
                    isClearable
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{workloadLabel || 'Not specified'}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label className={styles.wrapLabel} htmlFor='compensationRange'>Weekly Compensation Range :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='compensationRange'
                    name='compensationRange'
                    type='text'
                    placeholder='e.g., $600-$700 USD'
                    value={engagement.compensationRange}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {engagement.compensationRange || 'Not specified'}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Time Zone <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    isMulti
                    options={timeZoneOptions}
                    value={selectedTimeZones}
                    onChange={(values) => {
                      const normalized = normalizeAnySelection(values)
                      const timezones = []
                      const seen = new Set()
                      normalized.forEach((option) => {
                        if (!option) {
                          return
                        }
                        if (option.value === ANY_OPTION.value) {
                          timezones.length = 0
                          timezones.push(ANY_OPTION.value)
                          return
                        }
                        if (!Array.isArray(option.zones) || option.zones.length === 0) {
                          return
                        }
                        option.zones.forEach((zone) => {
                          if (seen.has(zone)) {
                            return
                          }
                          seen.add(zone)
                          timezones.push(zone)
                        })
                      })
                      onUpdateInput({
                        target: {
                          name: 'timezones',
                          value: timezones
                        }
                      })
                    }}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {formatTimeZoneList(engagement.timezones, 'Any')}
                  </div>
                )}
                {submitTriggered && validationErrors.timezones && (
                  <div className={styles.error}>{validationErrors.timezones}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Country <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    isMulti
                    options={countryOptions}
                    value={selectedCountries}
                    onChange={(values) => {
                      const normalized = normalizeAnySelection(values)
                      onUpdateInput({
                        target: {
                          name: 'countries',
                          value: normalized.map(option => option.value)
                        }
                      })
                    }}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {(engagement.countries || []).length
                      ? engagement.countries
                        .map(code => (countryOptionsByValue[code] ? countryOptionsByValue[code].label : code))
                        .join(', ')
                      : 'Any'}
                  </div>
                )}
                {submitTriggered && validationErrors.countries && (
                  <div className={styles.error}>{validationErrors.countries}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Required Skills <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                <SkillsField
                  embedded
                  readOnly={!canEdit}
                  challenge={{
                    ...engagement,
                    submitTriggered
                  }}
                  onUpdateSkills={onUpdateSkills}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Anticipated Start <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    className={styles.selectInput}
                    useBottomBorder
                    options={ANTICIPATED_START_OPTIONS}
                    value={selectedAnticipatedStartOption}
                    onChange={(option) => onUpdateInput({
                      target: {
                        name: 'anticipatedStart',
                        value: option ? option.value : null
                      }
                    })}
                    isClearable={false}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {anticipatedStartLabel || '-'}
                  </div>
                )}
                {submitTriggered && validationErrors.anticipatedStart && (
                  <div className={styles.error}>{validationErrors.anticipatedStart}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label>Status <span>*</span> :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <Select
                    className={styles.selectInput}
                    useBottomBorder
                    value={engagement.status ? {
                      label: engagement.status,
                      value: engagement.status
                    } : null}
                    options={['Open', 'Active', 'Cancelled', 'Closed'].map(status => ({
                      label: status,
                      value: status
                    }))}
                    onChange={(option) => onUpdateInput({
                      target: {
                        name: 'status',
                        value: option ? option.value : ''
                      }
                    })}
                    isClearable={false}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>{engagement.status || '-'}</div>
                )}
                {submitTriggered && validationErrors.status && (
                  <div className={styles.error}>{validationErrors.status}</div>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={cn(styles.field, styles.col1)}>
                <label htmlFor={canEdit ? 'requiredMemberCount' : undefined}>Required Members :</label>
              </div>
              <div className={cn(styles.field, styles.col2)}>
                {canEdit ? (
                  <input
                    className={styles.input}
                    id='requiredMemberCount'
                    name='requiredMemberCount'
                    type='number'
                    min='1'
                    step='1'
                    value={engagement.requiredMemberCount}
                    onChange={onUpdateInput}
                  />
                ) : (
                  <div className={styles.readOnlyValue}>
                    {hasRequiredMemberCount ? requiredMemberCountValue : 'Not specified'}
                  </div>
                )}
                <div className={assignmentProgressClassName}>{assignmentProgressText}</div>
                {canEdit && submitTriggered && validationErrors.requiredMemberCount && (
                  <div className={styles.error}>{validationErrors.requiredMemberCount}</div>
                )}
              </div>
            </div>
            {showAssignedMembers && (
              <div className={styles.row}>
                <div className={cn(styles.field, styles.col1)}>
                  <label>Assigned Members :</label>
                </div>
                <div className={cn(styles.field, styles.col2)}>
                  <div className={styles.memberList}>
                    {assignedMemberList.map((member) => (
                      <div key={member.key} className={styles.memberRow}>
                        <div className={styles.memberHandle}>
                          {member.handle || member.memberHandle || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {canEdit && (
              <div className={styles.row}>
                <div className={cn(styles.field, styles.col1)}>
                  <label htmlFor='isPrivate'>Private Engagement :</label>
                </div>
                <div className={cn(styles.field, styles.col2)}>
                  <input
                    id='isPrivate'
                    name='isPrivate'
                    type='checkbox'
                    checked={Boolean(engagement.isPrivate)}
                    onChange={(event) => onUpdateInput({
                      target: {
                        name: 'isPrivate',
                        value: event.target.checked
                      }
                    })}
                  />
                </div>
              </div>
            )}

            {canEdit && engagement.isPrivate && assignmentFieldIndices.map((index) => {
              const assignmentLabel = assignmentFieldCount > 1
                ? `Assign to Member ${index + 1}`
                : 'Assign to Member'
              const selectedHandle = assignedMemberHandles[index]
              const assignmentDetail = selectedHandle
                ? assignmentDetailsByHandle[selectedHandle.toLowerCase()]
                : null
              const hasAssignmentDetail = Boolean(
                assignmentDetail &&
                (assignmentDetail.startDate || assignmentDetail.endDate || assignmentDetail.agreementRate)
              )
              const fieldError = validationErrors[`assignedMemberHandle${index}`]
              const nextAssignedMemberHandles = Array.from(
                { length: assignmentFieldCount },
                (_, handleIndex) => assignedMemberHandles[handleIndex] || ''
              )
              const nextAssignmentDetails = Array.from(
                { length: assignmentFieldCount },
                (_, detailIndex) => assignmentDetails[detailIndex] || null
              )
              return (
                <div key={`assign-member-${index}`} className={styles.row}>
                  <div className={cn(styles.field, styles.col1)}>
                    <label>{assignmentLabel} <span>*</span> :</label>
                  </div>
                  <div className={cn(styles.field, styles.col2)}>
                    <Select
                      className={styles.selectInput}
                      useBottomBorder
                      isAsync
                      loadOptions={loadMemberOptions}
                      placeholder='Type to search for a member...'
                      value={selectedHandle
                        ? {
                          label: selectedHandle,
                          value: selectedHandle
                        }
                        : null}
                      onChange={(option) => {
                        if (!option) {
                          const updatedHandles = [...nextAssignedMemberHandles]
                          const updatedDetails = [...nextAssignmentDetails]
                          updatedHandles[index] = ''
                          updatedDetails[index] = null
                          onUpdateInput({
                            target: {
                              name: 'assignedMemberHandles',
                              value: updatedHandles
                            }
                          })
                          onUpdateInput({
                            target: {
                              name: 'assignmentDetails',
                              value: updatedDetails
                            }
                          })
                          return
                        }
                        if (option.value === selectedHandle) {
                          return
                        }
                        openAssignModal(index, option.value)
                      }}
                      isClearable
                    />
                    {hasAssignmentDetail && (
                      <div className={styles.assignmentDetails}>
                        <div className={styles.assignmentDetailsText}>
                          <span>
                            <span className={styles.assignmentDetailLabel}>Start:</span>
                            {' '}
                            {formatAssignmentDate(assignmentDetail.startDate)}
                          </span>
                          <span>
                            <span className={styles.assignmentDetailLabel}>End:</span>
                            {' '}
                            {formatAssignmentDate(assignmentDetail.endDate)}
                          </span>
                          <span>
                            <span className={styles.assignmentDetailLabel}>Rate:</span>
                            {' '}
                            {assignmentDetail.agreementRate || '-'}
                          </span>
                        </div>
                        <button
                          type='button'
                          className={styles.assignmentEditButton}
                          onClick={() => openAssignModal(index, selectedHandle)}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                    {submitTriggered && fieldError && (
                      <div className={styles.error}>{fieldError}</div>
                    )}
                  </div>
                </div>
              )
            })}
            {canEdit && engagement.isPrivate && submitTriggered && validationErrors.assignedMemberHandles && (
              <div className={styles.row}>
                <div className={cn(styles.field, styles.col1)} />
                <div className={cn(styles.field, styles.col2)}>
                  <div className={styles.error}>{validationErrors.assignedMemberHandles}</div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

EngagementEditor.defaultProps = {
  engagement: getEmptyEngagement(),
  projectId: null,
  isNew: true,
  isLoading: false,
  isSaving: false,
  canEdit: true,
  submitTriggered: false,
  validationErrors: {},
  showDeleteModal: false,
  onToggleDelete: () => {},
  onUpdateInput: () => {},
  onUpdateDescription: () => {},
  onUpdateSkills: () => {},
  onSavePublish: () => {},
  onCancel: () => {},
  onDelete: () => {},
  resolvedAssignedMembers: []
}

EngagementEditor.propTypes = {
  engagement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    durationWeeks: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    role: PropTypes.string,
    workload: PropTypes.string,
    compensationRange: PropTypes.string,
    isPrivate: PropTypes.bool,
    requiredMemberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      engagementId: PropTypes.string,
      memberId: PropTypes.string,
      memberHandle: PropTypes.string,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string
    })),
    assignedMembers: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        handle: PropTypes.string,
        memberHandle: PropTypes.string,
        username: PropTypes.string,
        name: PropTypes.string,
        userHandle: PropTypes.string,
        userName: PropTypes.string
      })
    ])),
    assignedMemberHandles: PropTypes.arrayOf(PropTypes.string),
    assignmentDetails: PropTypes.arrayOf(PropTypes.shape({
      memberHandle: PropTypes.string,
      startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
      endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
      agreementRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      otherRemarks: PropTypes.string
    })),
    timezones: PropTypes.arrayOf(PropTypes.string),
    countries: PropTypes.arrayOf(PropTypes.string),
    skills: PropTypes.arrayOf(PropTypes.shape()),
    anticipatedStart: PropTypes.string,
    status: PropTypes.string
  }),
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isNew: PropTypes.bool,
  isLoading: PropTypes.bool,
  isSaving: PropTypes.bool,
  canEdit: PropTypes.bool,
  submitTriggered: PropTypes.bool,
  validationErrors: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    durationWeeks: PropTypes.string,
    anticipatedStart: PropTypes.string,
    skills: PropTypes.string,
    timezones: PropTypes.string,
    countries: PropTypes.string,
    assignedMemberHandles: PropTypes.string,
    requiredMemberCount: PropTypes.string,
    status: PropTypes.string
  }),
  showDeleteModal: PropTypes.bool,
  onToggleDelete: PropTypes.func,
  onUpdateInput: PropTypes.func,
  onUpdateDescription: PropTypes.func,
  onUpdateSkills: PropTypes.func,
  onSavePublish: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  resolvedAssignedMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    memberHandle: PropTypes.string,
    username: PropTypes.string,
    name: PropTypes.string,
    userHandle: PropTypes.string,
    userName: PropTypes.string,
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    assignmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }))
}

export default EngagementEditor
