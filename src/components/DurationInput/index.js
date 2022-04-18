import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './DurationInput.module.scss'

const DurationInput = ({ duration, onDurationChange, index, isActive }) => {
  const inputRef = useRef(null)

  return (
    <div key={`duration-${index}-edit`}>
      <input
        className={styles.durationInput}
        id={`duration-${index}`}
        key={`duration-${index}`}
        ref={inputRef}
        min={1}
        type='number'
        value={duration}
        onChange={e => {
          e.preventDefault()
          onDurationChange(e.target.value)
        }}
        onBlur={e => {
          e.preventDefault()
          onDurationChange(e.target.value, true)
        }}
        autoFocus={inputRef.current === document.activeElement}
        disabled={!isActive}
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
