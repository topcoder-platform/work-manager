import React, { useRef } from 'react'
import PropTypes from 'prop-types'

const DurationInput = ({ duration, onDurationChange, index }) => {
  const inputRef = useRef(null)

  return (
    <div key={`duration-${index}-edit`}>
      <input
        id={`duration-${index}`}
        key={`duration-${index}`}
        ref={inputRef}
        min={0}
        type='number'
        value={Number(duration).toString()}
        onChange={e => onDurationChange(e.target.value)}
        autoFocus={inputRef.current === document.activeElement}
      />
    </div>
  )
}

DurationInput.propTypes = {
  duration: PropTypes.string,
  onDurationChange: PropTypes.func.isRequired,
  index: PropTypes.string.isRequired
}

export default DurationInput
