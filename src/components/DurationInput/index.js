import React, { useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import styles from './DurationInput.module.scss'
import { getPhaseHoursMinutes, convertPhaseHoursMinutesToPhaseDuration } from '../../util/date'

const DurationInput = ({ duration, onDurationChange, index, isActive }) => {
  const inputHoursRef = useRef(null)
  const inputMinutesRef = useRef(null)
  const durationInHoursMinutes = useMemo(() => getPhaseHoursMinutes(duration), [duration])

  useEffect(() => {
    document.getElementById(`duration-${index}-hours`).disabled = !isActive
    document.getElementById(`duration-${index}-minutes`).disabled = !isActive
  }, [isActive, index])

  const onUpdateDuration = (hours, minutes, isBlur) => {
    onDurationChange(convertPhaseHoursMinutesToPhaseDuration({
      hours,
      minutes
    }), isBlur)
  }

  return (
    <div key={`duration-${index}-edit`} className={styles.container}>
      <span>Hours:</span>
      <input
        className={styles.durationInput}
        id={`duration-${index}-hours`}
        key={`duration-${index}-hours`}
        ref={inputHoursRef}
        min={1}
        type='number'
        value={durationInHoursMinutes.hours}
        onChange={e => {
          e.preventDefault()
          onUpdateDuration(parseInt(e.target.value), durationInHoursMinutes.minutes, false)
        }}
        onBlur={e => {
          e.preventDefault()
          onUpdateDuration(parseInt(e.target.value), durationInHoursMinutes.minutes, true)
        }}
        autoFocus={inputHoursRef.current === document.activeElement}
      />
      <span>Minutes:</span>
      <input
        className={styles.durationInput}
        id={`duration-${index}-minutes`}
        key={`duration-${index}-minutes`}
        ref={inputMinutesRef}
        min={1}
        type='number'
        value={durationInHoursMinutes.minutes}
        onChange={e => {
          e.preventDefault()
          onUpdateDuration(durationInHoursMinutes.hours, parseInt(e.target.value), false)
        }}
        onBlur={e => {
          e.preventDefault()
          onUpdateDuration(durationInHoursMinutes.hours, parseInt(e.target.value), true)
        }}
        autoFocus={inputMinutesRef.current === document.activeElement}
      />
    </div>
  )
}

DurationInput.propTypes = {
  duration: PropTypes.number,
  onDurationChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired
}

export default DurationInput
