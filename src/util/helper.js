/**
 * Returns a promise that resolves after given milliseconds
 * @param ms milli seconds
 * @return {Promise<unknown>}
 */
export const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
