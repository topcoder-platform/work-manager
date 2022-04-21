import moment from 'moment'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './PhaseInput.module.scss'
import cn from 'classnames'
import 'react-day-picker/lib/style.css'
import 'rc-time-picker/assets/index.css'
import DateTime from '@nateradebaugh/react-datetime'
import isAfter from 'date-fns/isAfter'
import subDays from 'date-fns/subDays'
import '@nateradebaugh/react-datetime/scss/styles.scss'
import DurationInput from '../DurationInput'

const dateFormat = 'MM/DD/YYYY HH:mm'
const inputDateFormat = 'MM/dd/yyyy'
const inputTimeFormat = 'HH:mm'
const MAX_LENGTH = 5

const PhaseInput = ({ onUpdatePhase, phase, readOnly, phaseIndex }) => {
  const { scheduledStartDate: startDate, scheduledEndDate: endDate, duration, isStartTimeActive, isDurationActive } = phase

  const getEndDate = (startDate, duration) => moment(startDate).add(duration, 'hours').format(dateFormat)

  const onStartDateChange = (e) => {
    let startDate = moment(e).format(dateFormat)
    let endDate = getEndDate(startDate, duration)
    onUpdatePhase({
      startDate,
      endDate,
      duration
    })
  }

  const onDurationChange = (e, isBlur = false) => {
    if (e.length > MAX_LENGTH) return null

    let duration = parseInt(e || 0)
    let endDate = getEndDate(startDate, duration)
    onUpdatePhase({
      startDate,
      endDate,
      duration,
      isBlur
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1, styles.phaseName)}>
          <label htmlFor={`${phase.name}`}>{phase.name} :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <span className={styles.title}>Start Date:</span>
          <div className={styles.dayPicker}>
            {
              readOnly || !isStartTimeActive ? (
                <span className={styles.readOnlyValue}>{moment(startDate).format(dateFormat)}</span>
              )
                : (
                  <DateTime
                    className={styles.dateTimeInput}
                    value={moment(startDate).format(dateFormat)}
                    onChange={onStartDateChange}
                    isValidDate={(current) => {
                      const yesterday = subDays(new Date(), 1)
                      return isAfter(current, yesterday)
                    }}
                    dateFormat={inputDateFormat}
                    timeFormat={inputTimeFormat}
                  />)}
          </div>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <span className={styles.title}>End Date:</span>
          <div className={styles.dayPicker}>
            <span className={styles.readOnlyValue}>{moment(endDate).format(dateFormat)}</span>
          </div>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <span className={styles.title}>Duration:</span>
          <div className={styles.inputField}>
            {readOnly ? (
              <span className={styles.readOnlyValue}>{duration}</span>
            ) : (
              <DurationInput
                duration={duration}
                name={phase.name}
                onDurationChange={onDurationChange}
                index={phaseIndex}
                isActive={isDurationActive || false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

PhaseInput.defaultProps = {
  endDate: null,
  readOnly: false
}

PhaseInput.propTypes = {
  phase: PropTypes.shape().isRequired,
  onUpdatePhase: PropTypes.func,
  readOnly: PropTypes.bool,
  phaseIndex: PropTypes.number.isRequired
}
export default PhaseInput
