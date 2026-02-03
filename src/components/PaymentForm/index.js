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

const normalizeAmountValue = (value) => {
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

const getDefaultAmount = (member) => normalizeAmountValue(getAgreementRate(member))

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
  return `Week ending: ${moment(value).format('MMM DD, YYYY')}`
}

const getDefaultWeekEndingDate = () => {
  const today = moment().startOf('day')
  let nextFriday = moment(today).isoWeekday(5)
  if (nextFriday.isBefore(today, 'day')) {
    nextFriday = nextFriday.add(1, 'week')
  }
  return nextFriday.toDate()
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

const isWeekEndingFriday = (value) => {
  if (!value) {
    return false
  }
  const parsed = moment(value)
  if (!parsed.isValid()) {
    return false
  }
  return parsed.isoWeekday() === 5
}

const PaymentForm = ({ member, availableMembers, isProcessing, onSubmit, onCancel }) => {
  const defaultWeekEndingDate = useMemo(() => getDefaultWeekEndingDate(), [])
  const weekEndingInputId = useRef(`week-ending-input-${Math.random().toString(36).slice(2, 9)}`)
  const [weekEndingDate, setWeekEndingDate] = useState(defaultWeekEndingDate)
  const [amount, setAmount] = useState('')
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
    setAmount(getDefaultAmount(member))
    setRemarks('')
    setValidationError('')
    setTitleError('')
  }, [defaultWeekEndingDate, member])

  useEffect(() => {
    if (!selectedMember) {
      setAmount('')
      return
    }
    setAmount(getDefaultAmount(selectedMember))
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
  const parsedAmount = Number(amount)
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0
  const isWeekEndingValid = isWeekEndingFriday(weekEndingDate)
  const weekEndingTitle = isWeekEndingValid ? formatWeekEndingTitle(weekEndingDate) : ''
  const trimmedTitle = weekEndingTitle.trim()
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
      setTitleError('Week ending date must be a Friday')
      return
    }
    if (!isAmountValid) {
      setValidationError('Amount must be greater than 0')
      return
    }
    setValidationError('')
    setMemberError('')
    setTitleError('')
    onSubmit(selectedMember, trimmedTitle, parsedAmount, remarks.trim())
  }

  const onAmountChange = (event) => {
    setAmount(event.target.value)
    if (validationError) {
      setValidationError('')
    }
  }

  const onMemberChange = (option) => {
    setSelectedMember(option ? normalizeMember(option.member) : null)
    if (memberError) {
      setMemberError('')
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
          Week ending:
        </label>
        <div className={styles.field}>
          <DateInput
            className={styles.dateInput}
            value={weekEndingDate}
            onChange={onWeekEndingChange}
            isValidDate={isWeekEndingFriday}
            dateFormat='MM/dd/yyyy'
            timeFormat={false}
            inputId={weekEndingInputId.current}
          />
          {weekEndingTitle && <div className={styles.weekEndingPreview}>{weekEndingTitle}</div>}
          {titleError && <div className={styles.error}>{titleError}</div>}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.label}>Amount</div>
        <div className={styles.field}>
          <input
            className={styles.input}
            type='number'
            min='0.01'
            step='0.01'
            value={amount}
            onChange={onAmountChange}
          />
          {validationError && <div className={styles.error}>{validationError}</div>}
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
          disabled={isProcessing || !isAmountValid || !selectedMember || memberHandle === '-' || !isTitleValid}
        />
      </div>
    </form>
  )
}

PaymentForm.defaultProps = {
  member: null,
  availableMembers: [],
  isProcessing: false,
  onSubmit: () => {},
  onCancel: () => {}
}

PaymentForm.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    agreementRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  availableMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string,
    agreementRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  isProcessing: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
}

export default PaymentForm
