/**
 * Calculates the date for today and a future date N days from now.
 * @param {number} n - Number of days to look ahead
 * @returns {Object} Object containing `now` (current date) and `future` (date N days from now)
 */
export function getNextNDays(n: number) {
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + n)

  return { now, future }
}
