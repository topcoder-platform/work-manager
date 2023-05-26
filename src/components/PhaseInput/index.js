import moment from 'moment'
import React, { useEffect, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './PhaseInput.module.scss'
import cn from 'classnames'
import isAfter from 'date-fns/isAfter'
import subDays from 'date-fns/subDays'
import DurationInput from '../DurationInput'
import { getPhaseHoursMinutes, getPhaseEndDate, getPhaseDuration } from '../../util/date'
import DateInput from '../DateInput'

const dateFormat = 'MM/DD/YYYY HH:mm'
const inputDateFormat = 'MM/dd/yyyy'
const inputTimeFormat = 'HH:mm'
const MAX_LENGTH = 5

const PhaseInput = ({ onUpdatePhase, phase, readOnly, phaseIndex }) => {
  const { scheduledStartDate: startDate, scheduledEndDate: endDate, duration, isStartTimeActive, isDurationActive } = phase

  const durationHoursMinutes = useMemo(() => getPhaseHoursMinutes(duration), [duration])
  const endDateInputRef = useRef()

  const onStartDateChange = (e) => {
    let startDate = moment(e).format(dateFormat)
    let endDate = getPhaseEndDate(startDate, duration)
    onUpdatePhase({
      startDate,
      endDate,
      duration
    })
  }

  const onEndDateChange = (e) => {
    let endDate = moment(e).format(dateFormat)
    let duration = getPhaseDuration(startDate, endDate)
    if (duration > 0) {
      onUpdatePhase({
        startDate,
        endDate,
        duration
      })
    } else {
      endDateInputRef.current.forceReset()
    }
  }

  useEffect(() => {
    if (!startDate && onUpdatePhase) {
      let startDate = moment().format(dateFormat)
      let endDate = getPhaseEndDate(startDate, duration)
      onUpdatePhase({
        startDate,
        endDate,
        duration
      })
    }
  }, [startDate])

  const onDurationChange = (e, isBlur = false) => {
    if (`${e}`.length > MAX_LENGTH) return null

    let duration = e
    let endDate = getPhaseEndDate(startDate, duration)
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
                  <DateInput
                    className={styles.dateTimeInput}
                    value={moment(startDate).toDate()}
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
            {(readOnly || !isDurationActive) ? (
              <span className={styles.readOnlyValue}>{moment(endDate).format(dateFormat)}</span>
            ) : (
              <DateInput
                ref={endDateInputRef}
                className={styles.dateTimeInput}
                value={moment(endDate).toDate()}
                onChange={onEndDateChange}
                isValidDate={(current) => {
                  return isAfter(current, moment(startDate).toDate())
                }}
                dateFormat={inputDateFormat}
                timeFormat={inputTimeFormat}
              />
            )}
          </div>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          <span className={styles.title}>Duration</span>
          <div className={styles.inputField}>
            {readOnly ? (
              <div className={styles.readOnlyDurationContainer}>
                <span>Hours: </span>
                <span className={styles.readOnlyValue}>{durationHoursMinutes.hours}</span>
                <span>Minutes: </span>
                <span className={styles.readOnlyValue}>{durationHoursMinutes.minutes}</span>
              </div>
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
