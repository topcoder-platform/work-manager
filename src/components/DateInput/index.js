import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
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
  className
}, ref) => {
  const [localValue, setLocalValue] = useState(value)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useImperativeHandle(ref, () => ({
    forceReset: () => {
      setLocalValue(value)
    }
  }))

  return (
    <DateTime
      className={className}
      value={localValue}
      onChange={newValue => {
        setLocalValue(newValue)
      }}
      onBlur={onChange}
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
  className: null
}

DateInput.propTypes = {
  onChange: PropTypes.func,
  isValidDate: PropTypes.func,
  value: PropTypes.any,
  dateFormat: PropTypes.string,
  timeFormat: PropTypes.string,
  className: PropTypes.string
}
export default DateInput
