import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { PrimaryButton, OutlineButton } from '../Buttons'
import DateInput from '../DateInput'
import Select from '../Select'
import styles from './PaymentForm.module.scss'

const getMemberHandle = (member) => {
  if (!member) {
    return '-'
  }
  return member.handle || member.memberHandle || member.username || member.name || '-'
}

const getMemberId = (member) => {
  if (!member) {
    return null
  }
  return member.id || member.memberId || member.userId || null
}

const getAgreementRate = (member) => {
  if (!member || typeof member !== 'object') {
    return null
  }
  return member.agreementRate ||
    member.agreement_rate ||
    member.rate ||
    member.agreedRate ||
    null
}

/**
 * Normalizes a positive numeric value for input display.
 *
 * @param {string|number|null|undefined} value Value from assignment or payment data.
 * @returns {string} Normalized numeric string, or an empty string when the
 * value is missing or invalid.
 */
const normalizePositiveValue = (value) => {
  if (value == null || value === '') {
    return ''
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toString() : ''
  }
  const trimmed = String(value).trim()
  if (!trimmed) {
    return ''
  }
  const sanitized = trimmed.replace(/[^0-9.-]/g, '')
  if (!sanitized) {
    return ''
  }
  const parsed = Number(sanitized)
  if (!Number.isFinite(parsed)) {
    return ''
  }
  return parsed.toString()
}

/**
 * Reads the assignment standard hours value from a member object.
 *
 * @param {Object|null|undefined} member Selected assignment/member record.
 * @returns {string|number|null} Standard hours per week, when available.
 */
const getStandardHoursPerWeek = (member) => {
  if (!member || typeof member !== 'object') {
    return null
  }

  return member.standardHoursPerWeek != null
    ? member.standardHoursPerWeek
    : member.standard_hours_per_week != null
      ? member.standard_hours_per_week
      : null
}

/**
 * Resolves the hourly assignment rate for payment calculation.
 *
 * @param {Object|null|undefined} member Selected assignment/member record.
 * @returns {number|null} Hourly pay rate, or `null` when it cannot be derived.
 */
const getRatePerHour = (member) => {
  if (!member || typeof member !== 'object') {
    return null
  }

  const directRate = Number(member.ratePerHour || member.rate_per_hour)
  if (Number.isFinite(directRate) && directRate > 0) {
    return directRate
  }

  const standardHours = Number(getStandardHoursPerWeek(member))
  const agreementRate = Number(getAgreementRate(member))
  if (
    Number.isFinite(standardHours) &&
    standardHours > 0 &&
    Number.isFinite(agreementRate) &&
    agreementRate > 0
  ) {
    return agreementRate / standardHours
  }

  return null
}

/**
 * Calculates the payment amount from hours worked and hourly pay rate.
 *
 * @param {string|number|null|undefined} hoursWorked Worked hours for the payment week.
 * @param {number|null} ratePerHour Assignment hourly pay rate.
 * @returns {string} Calculated amount with two decimal places, or an empty
 * string when the inputs are incomplete or invalid.
 */
const calculatePaymentAmount = (hoursWorked, ratePerHour) => {
  const parsedHoursWorked = Number(hoursWorked)

  if (
    !Number.isFinite(parsedHoursWorked) ||
    parsedHoursWorked <= 0 ||
    !Number.isFinite(ratePerHour) ||
    ratePerHour <= 0
  ) {
    return ''
  }

  return (parsedHoursWorked * ratePerHour).toFixed(2)
}

/**
 * Reads the default hours-worked value from the selected assignment.
 *
 * @param {Object|null|undefined} member Selected assignment/member record.
 * @returns {string} Default hours-worked input value.
 */
const getDefaultHoursWorked = (member) => normalizePositiveValue(
  getStandardHoursPerWeek(member)
)

const normalizeMember = (member) => {
  if (!member) {
    return null
  }
  return {
    ...member,
    id: getMemberId(member),
    handle: getMemberHandle(member)
  }
}

const isSameMember = (left, right) => {
  if (!left || !right) {
    return false
  }
  const leftId = getMemberId(left)
  const rightId = getMemberId(right)
  if (leftId && rightId && `${leftId}` === `${rightId}`) {
    return true
  }
  const leftHandle = getMemberHandle(left)
  const rightHandle = getMemberHandle(right)
  return leftHandle && rightHandle && leftHandle === rightHandle
}

const formatWeekEndingTitle = (value) => {
  if (!value) {
    return ''
  }
  return `Week Ending: ${moment(value).format('MMM DD, YYYY')}`
}

const normalizeTitleSegment = (value) => {
  if (value == null) {
    return ''
  }
  return String(value).trim()
}

const getEngagementName = (engagement) => {
  if (!engagement || typeof engagement !== 'object') {
    return ''
  }
  return normalizeTitleSegment(
    engagement.title || engagement.name || engagement.role || ''
  )
}

const buildPaymentTitle = (projectName, engagementName, weekEndingTitle) => {
  return [
    normalizeTitleSegment(projectName),
    normalizeTitleSegment(engagementName),
    normalizeTitleSegment(weekEndingTitle)
  ]
    .filter(Boolean)
    .join(' - ')
}

const getDefaultWeekEndingDate = () => {
  const today = moment().startOf('day')
  let nextSaturday = moment(today).isoWeekday(6)
  if (nextSaturday.isBefore(today, 'day')) {
    nextSaturday = nextSaturday.add(1, 'week')
  }
  return nextSaturday.toDate()
}

const normalizeWeekEndingDate = (value) => {
  if (!value) {
    return null
  }
  if (moment.isMoment(value)) {
    return value.toDate()
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const isWeekEndingSaturday = (value) => {
  if (!value) {
    return false
  }
  const parsed = moment(value)
  if (!parsed.isValid()) {
    return false
  }
  return parsed.isoWeekday() === 6
}

const PaymentForm = ({
  member,
  availableMembers,
  engagement,
  projectName,
  isProcessing,
  onSubmit,
  onCancel
}) => {
  const defaultWeekEndingDate = useMemo(() => getDefaultWeekEndingDate(), [])
  const weekEndingInputId = useRef(`week-ending-input-${Math.random().toString(36).slice(2, 9)}`)
  const [weekEndingDate, setWeekEndingDate] = useState(defaultWeekEndingDate)
  const [hoursWorked, setHoursWorked] = useState('')
  const [remarks, setRemarks] = useState('')
  const [validationError, setValidationError] = useState('')
  const [memberError, setMemberError] = useState('')
  const [titleError, setTitleError] = useState('')
  const normalizedMembers = useMemo(() => {
    if (!Array.isArray(availableMembers)) {
      return []
    }
    return availableMembers
      .map(normalizeMember)
      .filter((item) => item && item.handle && item.handle !== '-')
  }, [availableMembers])
  const [selectedMember, setSelectedMember] = useState(() => {
    const normalized = normalizeMember(member)
    if (normalized) {
      return normalized
    }
    return normalizedMembers.length ? normalizedMembers[0] : null
  })

  const memberOptions = useMemo(() => {
    return normalizedMembers.map((item) => ({
      value: item.id ? `${item.id}` : item.handle,
      label: item.handle,
      member: item
    }))
  }, [normalizedMembers])

  const selectedMemberOption = useMemo(() => {
    if (!selectedMember) {
      return null
    }
    return memberOptions.find((option) => {
      return isSameMember(option.member, selectedMember)
    }) || {
      value: getMemberId(selectedMember) ? `${getMemberId(selectedMember)}` : getMemberHandle(selectedMember),
      label: getMemberHandle(selectedMember),
      member: selectedMember
    }
  }, [memberOptions, selectedMember])

  useEffect(() => {
    setWeekEndingDate(defaultWeekEndingDate)
    setHoursWorked(getDefaultHoursWorked(member))
    setRemarks('')
    setValidationError('')
    setTitleError('')
  }, [defaultWeekEndingDate, member])

  useEffect(() => {
    if (!selectedMember) {
      setHoursWorked('')
      return
    }
    setHoursWorked(getDefaultHoursWorked(selectedMember))
    setValidationError('')
  }, [selectedMember])

  useEffect(() => {
    setSelectedMember((prev) => {
      const normalized = normalizeMember(member)
      if (normalized) {
        const matched = normalizedMembers.find((item) => isSameMember(item, normalized))
        const nextMember = matched || normalized
        return prev && isSameMember(prev, nextMember) ? prev : nextMember
      }
      if (!normalizedMembers.length) {
        return null
      }
      if (prev) {
        const matched = normalizedMembers.find((item) => isSameMember(item, prev))
        const nextMember = matched || normalizedMembers[0]
        return isSameMember(prev, nextMember) ? prev : nextMember
      }
      return normalizedMembers[0]
    })
  }, [member, normalizedMembers])

  const memberHandle = getMemberHandle(selectedMember)
  const ratePerHour = getRatePerHour(selectedMember)
  const amount = calculatePaymentAmount(hoursWorked, ratePerHour)
  const parsedAmount = Number(amount)
  const parsedHoursWorked = Number(hoursWorked)
  const isHoursWorkedValid = Number.isFinite(parsedHoursWorked) && parsedHoursWorked > 0
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0
  const hasHourlyRate = Number.isFinite(ratePerHour) && ratePerHour > 0
  const isWeekEndingValid = isWeekEndingSaturday(weekEndingDate)
  const weekEndingTitle = isWeekEndingValid ? formatWeekEndingTitle(weekEndingDate) : ''
  const engagementName = getEngagementName(engagement)
  const paymentTitle = buildPaymentTitle(projectName, engagementName, weekEndingTitle)
  const trimmedTitle = paymentTitle.trim()
  const isTitleValid = isWeekEndingValid && trimmedTitle.length > 0

  const onSubmitForm = (event) => {
    event.preventDefault()
    if (isProcessing) {
      return
    }
    if (!selectedMember || !memberHandle || memberHandle === '-') {
      setMemberError('Select a member to pay')
      return
    }
    if (!weekEndingDate) {
      setTitleError('Week ending date is required')
      return
    }
    if (!isWeekEndingValid) {
      setTitleError('Week ending date must be a Saturday')
      return
    }
    if (!isHoursWorkedValid) {
      setValidationError('Hours Worked must be greater than 0')
      return
    }
    if (!hasHourlyRate) {
      setValidationError('Hourly Pay Rate is required to calculate payment amount')
      return
    }
    if (!isAmountValid) {
      setValidationError('Amount must be greater than 0')
      return
    }
    setValidationError('')
    setMemberError('')
    setTitleError('')
    onSubmit(
      selectedMember,
      trimmedTitle,
      parsedAmount,
      remarks.trim(),
      parsedHoursWorked
    )
  }

  const onHoursWorkedChange = (event) => {
    setHoursWorked(event.target.value)
    if (validationError) {
      setValidationError('')
    }
  }

  const onMemberChange = (option) => {
    setSelectedMember(option ? normalizeMember(option.member) : null)
    if (memberError) {
      setMemberError('')
    }
    if (validationError) {
      setValidationError('')
    }
  }

  const onWeekEndingChange = (value) => {
    setWeekEndingDate(normalizeWeekEndingDate(value))
    if (titleError) {
      setTitleError('')
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmitForm}>
      <div className={styles.title}>Create Payment</div>
      <div className={styles.row}>
        <div className={styles.label}>Select Member</div>
        <div className={styles.field}>
          <Select
            className={styles.selectInput}
            value={selectedMemberOption}
            options={memberOptions}
            onChange={onMemberChange}
            isClearable={false}
            placeholder='Select a member'
          />
          {memberError && <div className={styles.error}>{memberError}</div>}
        </div>
      </div>
      <div className={styles.row}>
        <label
          className={`${styles.label} ${styles.clickableLabel}`}
          htmlFor={weekEndingInputId.current}
        >
          Week Ending:
        </label>
        <div className={styles.field}>
          <DateInput
            className={styles.dateInput}
            value={weekEndingDate}
            onChange={onWeekEndingChange}
            isValidDate={isWeekEndingSaturday}
            dateFormat='MM/dd/yyyy'
            timeFormat={false}
            inputId={weekEndingInputId.current}
          />
          {paymentTitle && <div className={styles.weekEndingPreview}>{paymentTitle}</div>}
          {titleError && <div className={styles.error}>{titleError}</div>}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Hours Worked</div>
        <div className={styles.field}>
          <input
            className={styles.input}
            type='number'
            min='0.01'
            step='0.01'
            value={hoursWorked}
            onChange={onHoursWorkedChange}
          />
          {validationError && <div className={styles.error}>{validationError}</div>}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Amount</div>
        <div className={styles.field}>
          <input
            className={`${styles.input} ${styles.readOnlyInput}`}
            type='number'
            min='0.01'
            step='0.01'
            value={amount}
            readOnly
            aria-readonly='true'
          />
          {!hasHourlyRate && (
            <div className={styles.error}>
              Hourly Pay Rate is unavailable for this assignment.
            </div>
          )}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Remarks</div>
        <div className={styles.field}>
          <textarea
            className={styles.textarea}
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder='Optional'
            rows={3}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <OutlineButton text='Cancel' type='info' onClick={onCancel} disabled={isProcessing} />
        <PrimaryButton
          text={isProcessing ? 'Processing...' : 'Submit Payment'}
          type='info'
          submit
          disabled={
            isProcessing ||
            !isHoursWorkedValid ||
            !isAmountValid ||
            !hasHourlyRate ||
            !selectedMember ||
            memberHandle === '-' ||
            !isTitleValid
          }
        />
      </div>
    </form>
  )
}

PaymentForm.defaultProps = {
  member: null,
  availableMembers: [],
  engagement: null,
  projectName: '',
  isProcessing: false,
  onSubmit: () => {},
  onCancel: () => {}
}

PaymentForm.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    agreementRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ratePerHour: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    standardHoursPerWeek: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  availableMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    agreementRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ratePerHour: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    standardHoursPerWeek: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  engagement: PropTypes.shape({
    title: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string
  }),
  projectName: PropTypes.string,
  isProcessing: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
}

export default PaymentForm
