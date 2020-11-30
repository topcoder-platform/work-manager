import _ from 'lodash'

/**
 * Formats number as integer.
 *
 * Support numbers and string as input.
 *
 * @param {Number|String} num number
 *
 * @returns {String} formatted integer
 */
export const formatInteger = (num) => {
  // if the value is "empty", then display empty string
  if (_.isNil(num) || (_.isString(num) && num.trim() === '')) {
    return ''
  }

  // otherwise try to display it as integer
  return _.isNumber(num) ? num.toFixed(0) : parseInt(num, 10)
}
