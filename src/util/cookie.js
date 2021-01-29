/**
 * Provides Cookie related utility methods
 */

import { BETA_MODE_COOKIE_TAG } from '../config/constants'

/**
  * A function that get's a cookie
 */
export function getCookie (name) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
  return v ? v[2] : undefined
}

/**
 * A function that set's a cookie
 */
export function setCookie (name, value) {
  document.cookie = `${name}=${value}`
}

/**
 * A function that removes Cookie by setting expiry date to past
 */
export function removeCookie (name) {
  document.cookie = `${name}=; expires=Thu, 18 Dec 2013 12:00:00 UTC;`
}

/**
 * A function that checks whether beta mode is enabled or not
 */
export function isBetaMode () {
  return getCookie(BETA_MODE_COOKIE_TAG)
}
