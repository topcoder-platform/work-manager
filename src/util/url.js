/**
 * Get initials from user profile
 * @param {String} firstName first name
 * @param {String} lastName last name
 * @returns {String}
 */
export function getInitials (firstName = '', lastName = '') {
  return `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`
}
