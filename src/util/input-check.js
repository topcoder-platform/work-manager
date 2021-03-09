/**
 * Provides input control utility methods
 */
import { VALIDATION_VALUE_TYPE } from '../config/constants'

/**
 * Validates Integer
 */
const validateInteger = (value, prefixText = '') => {
  const newValue = value.replace(prefixText, '').replace(' ', '').replace(/[^0-9]/g, '')
  if (newValue.length > 0) {
    return prefixText !== '' ? `${prefixText} ${newValue}` : newValue
  } else {
    return ''
  }
}

/**
 * Validate String
 * @param {*} value
 */
const validateString = (value) => {
  return /\S/.test(value) ? value : ''
}

/**
 * Validates Value
 */
export const validateValue = (value, checkType = '', prefix = '') => {
  switch (checkType) {
    case VALIDATION_VALUE_TYPE.INTEGER:
      return validateInteger('' + value, prefix)
    case VALIDATION_VALUE_TYPE.STRING:
      return validateString(value)
    default:
      return value
  }
}

/**
 * Converts dollar to integer
 * @param value
 * @param prefix
 */
export const convertDollarToInteger = (value, prefix = '') => {
  if (value) {
    return parseInt(('' + value).replace(prefix, '').replace(' ', '').replace(/[^0-9.,]/g, ''))
  }
  return 0
}
