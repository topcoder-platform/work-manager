import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'

const FieldInput = ({
  onChangeValue,
  placeholder,
  value,
  type
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
    />
  )
}

FieldInput.defaultProps = {
  type: 'text',
  onChangeValue: () => {}
}

FieldInput.propTypes = {
  onChangeValue: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.string
}

export default FieldInput
