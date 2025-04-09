/**
 * Creates a delay that can be awaited, and optionally aborted via an AbortSignal.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @param {AbortSignal} signal - Optional AbortSignal to cancel the delay early.
 * @returns A Promise that resolves after the delay, or rejects if aborted.
 */
export function delay (ms, signal) {
  return new Promise((resolve, reject) => {
    // Start a timer that will resolve the promise after `ms` milliseconds
    const timeout = setTimeout(resolve, ms)

    // If an AbortSignal is provided, handle abort events
    if (signal) {
      // Listen for the 'abort' event
      signal.addEventListener('abort', () => {
        // Cancel the timeout so it doesn't resolve the promise later
        clearTimeout(timeout)
        // Reject the promise with a DOMException for consistency with other abortable APIs
        // eslint-disable-next-line no-undef
        reject(new DOMException('Delay aborted', 'AbortError'))
      }, { once: true }) // 'once' ensures the handler is removed automatically after it runs
    }
  })
}
