/* Component to render input field */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'

const FieldInput = ({
  onChangeValue,
  placeholder,
  value,
  type,
  inputControl
}) => {
  return (
    <input
      className={styles.inputField}
      type={type}
      placeholder={placeholder}
      onChange={x => onChangeValue(x.target.value)}
      value={value}
      onKeyDown={
        type === 'number'
          ? evt => {
            if (['e', 'E', '+'].includes(evt.key)) {
              evt.preventDefault()
            }
          }
          : undefined
      }
      {...inputControl}
    />
  )
}

FieldInput.defaultProps = {
  type: 'text',
  onChangeValue: () => {},
  inputControl: {}
}

FieldInput.propTypes = {
  onChangeValue: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.string,
  inputControl: PropTypes.any
}

export default FieldInput
