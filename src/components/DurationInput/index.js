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
        min={0}
        type='number'
        value={Number(duration).toString()}
        onChange={e => {
          e.preventDefault()
          onDurationChange(e.target.value)
        }}
        autoFocus={inputRef.current === document.activeElement}
        disabled={!isActive}
      />
    </div>
  )
}

DurationInput.propTypes = {
  duration: PropTypes.string,
  onDurationChange: PropTypes.func.isRequired,
  index: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired
}

export default DurationInput
