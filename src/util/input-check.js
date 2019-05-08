/**
 * Provides input control utility methods
 */
import { VALIDATION_VALUE_TYPE } from '../config/constants'

const validateInteger = (value, prefixText = '') => {
  const newValue = value.replace(prefixText, '').replace(' ', '').replace(/[^0-9]/g, '')
  if (newValue.length > 0) {
    return prefixText !== '' ? `${prefixText} ${newValue}` : newValue
  } else {
    return ''
  }
}

export const validateValue = (value, checkType = '', prefix = '') => {
  switch (checkType) {
    case VALIDATION_VALUE_TYPE.INTEGER:
      return validateInteger(value, prefix)
    default:
      return value
  }
}
