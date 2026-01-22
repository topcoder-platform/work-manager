import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { PrimaryButton, OutlineButton } from '../Buttons'
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

const getDefaultTitle = (engagementTitle) => {
  const title = engagementTitle || 'Engagement'
  return `Payment for ${title} - ${moment().format('MMM DD, YYYY')}`
}

const PaymentForm = ({ engagement, member, availableMembers, isProcessing, onSubmit, onCancel }) => {
  const engagementTitle = engagement ? engagement.title : ''
  const defaultTitle = useMemo(() => getDefaultTitle(engagementTitle), [engagementTitle])
  const [paymentTitle, setPaymentTitle] = useState(defaultTitle)
  const [amount, setAmount] = useState('')
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
    setPaymentTitle(defaultTitle)
    setAmount('')
    setValidationError('')
    setTitleError('')
  }, [defaultTitle, member])

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
  const trimmedTitle = paymentTitle.trim()
  const isTitleValid = trimmedTitle.length > 0

  const onSubmitForm = (event) => {
    event.preventDefault()
    if (isProcessing) {
      return
    }
    if (!selectedMember || !memberHandle || memberHandle === '-') {
      setMemberError('Select a member to pay')
      return
    }
    if (!isTitleValid) {
      setTitleError('Payment title is required')
      return
    }
    if (!isAmountValid) {
      setValidationError('Amount must be greater than 0')
      return
    }
    setValidationError('')
    setMemberError('')
    setTitleError('')
    onSubmit(selectedMember, trimmedTitle, parsedAmount)
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
        <div className={styles.label}>Payment Title</div>
        <div className={styles.field}>
          <input
            className={styles.input}
            type='text'
            value={paymentTitle}
            onChange={(event) => {
              setPaymentTitle(event.target.value)
              if (titleError) {
                setTitleError('')
              }
            }}
          />
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
  engagement: null,
  member: null,
  availableMembers: [],
  isProcessing: false,
  onSubmit: () => {},
  onCancel: () => {}
}

PaymentForm.propTypes = {
  engagement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string
  }),
  member: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string
  }),
  availableMembers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handle: PropTypes.string
  })),
  isProcessing: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
}

export default PaymentForm
