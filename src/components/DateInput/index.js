import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import PropTypes from 'prop-types'
import 'react-day-picker/lib/style.css'
import 'rc-time-picker/assets/index.css'
import DateTime from '@nateradebaugh/react-datetime'
import '@nateradebaugh/react-datetime/scss/styles.scss'

const DateInput = forwardRef(({
  onChange,
  value,
  isValidDate,
  dateFormat,
  timeFormat,
  className,
  minDateTime,
  inputId
}, ref) => {
  const [localValue, setLocalValue] = useState(value)
  const latestValueRef = useRef(value)
  const hasLocalChangeRef = useRef(false)

  useEffect(() => {
    setLocalValue(value)
    latestValueRef.current = value
    hasLocalChangeRef.current = false
  }, [value])

  useImperativeHandle(ref, () => ({
    forceReset: () => {
      latestValueRef.current = value
      setLocalValue(value)
    }
  }))

  const resolveMinDateTime = () => {
    if (!minDateTime) {
      return null
    }
    return typeof minDateTime === 'function' ? minDateTime() : minDateTime
  }

  const normalizeDateTimeValue = (newValue) => {
    if (!minDateTime) {
      return newValue
    }
    if (!newValue || typeof newValue === 'string') {
      return newValue
    }
    const valueAsDate = newValue instanceof Date ? newValue : new Date(newValue)
    if (Number.isNaN(valueAsDate.getTime())) {
      return newValue
    }
    const minValue = resolveMinDateTime()
    if (!minValue) {
      return valueAsDate
    }
    const minAsDate = minValue instanceof Date ? minValue : new Date(minValue)
    if (Number.isNaN(minAsDate.getTime())) {
      return valueAsDate
    }
    return valueAsDate.getTime() < minAsDate.getTime() ? minAsDate : valueAsDate
  }

  return (
    <DateTime
      className={className}
      id={inputId}
      value={localValue}
      onChange={newValue => {
        const normalizedValue = normalizeDateTimeValue(newValue)
        if (minDateTime) {
          hasLocalChangeRef.current = true
        }
        latestValueRef.current = normalizedValue
        setLocalValue(normalizedValue)
      }}
      onBlur={(newValue) => {
        if (minDateTime) {
          const valueToCommit = hasLocalChangeRef.current ? latestValueRef.current : newValue
          hasLocalChangeRef.current = false
          onChange(valueToCommit)
          return
        }
        onChange(newValue)
      }}
      isValidDate={isValidDate}
      dateFormat={dateFormat}
      timeFormat={timeFormat}
    />
  )
})

DateInput.defaultProps = {
  onChange: () => {},
  isValidDate: () => true,
  value: null,
  dateFormat: null,
  timeFormat: null,
  className: null,
  minDateTime: null,
  inputId: null
}

DateInput.propTypes = {
  onChange: PropTypes.func,
  isValidDate: PropTypes.func,
  value: PropTypes.any,
  dateFormat: PropTypes.string,
  timeFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  className: PropTypes.string,
  minDateTime: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.func]),
  inputId: PropTypes.string
}
export default DateInput
