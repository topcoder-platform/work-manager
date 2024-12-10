import { BETA_MODE_COOKIE_TAG } from '../config/constants'

/**
 * Save an item to localStorage.
 * @param {string} key - The key under which the data will be stored.
 * @param {any} value - The data to store (will be stringified).
 */
export function saveToLocalStorage (key, value) {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a valid string.')
  }

  try {
    const jsonValue = JSON.stringify(value)
    window.localStorage.setItem(key, jsonValue)
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

/**
* Get an item from localStorage.
* @param {string} key - The key under which the data is stored.
* @returns {any} - The parsed data from localStorage, or null if not found.
*/
export function getFromLocalStorage (key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a valid string.')
  }

  try {
    const jsonValue = window.localStorage.getItem(key)
    return jsonValue ? JSON.parse(jsonValue) : null
  } catch (error) {
    console.error('Failed to retrieve from localStorage:', error)
    return null
  }
}

/**
 * Remove an item from localStorage.
 * @param {string} key - The key of the item to remove.
 */
export function removeFromLocalStorage (key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Key must be a valid string.')
  }

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove from localStorage:', error)
  }
}

/**
 * A function that checks whether beta mode is enabled or not
 */
export function isBetaMode () {
  return getFromLocalStorage(BETA_MODE_COOKIE_TAG) === 'true'
}
