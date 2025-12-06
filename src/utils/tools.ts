/**
 * Utility functions
 */

/**
 * Prefix integer with zeros
 * @param num - Number to prefix
 * @param length - Target length
 * @returns Padded string
 */
export function prefixInteger(num: number, length: number): string {
  return (num / Math.pow(10, length)).toFixed(length).substr(2)
}

/**
 * Get formatted time string from index and timezone offset
 * @param index - Time index (minutes from start)
 * @param flag - Timezone offset in hours
 * @returns Formatted time string (HH:MM)
 */
export function getTime(index: number, flag: number): string {
  // Calculate the time in minutes from start
  const totalMinutes = index
  
  // Apply timezone offset (flag is in hours, convert to minutes)
  const offsetMinutes = flag * 60
  const adjustedMinutes = totalMinutes + offsetMinutes
  
  // Calculate hours and minutes
  const hours = Math.floor(adjustedMinutes / 60) % 24
  const minutes = adjustedMinutes % 60
  
  // Format with leading zeros
  const h_str = hours < 10 ? '0' + hours : hours.toString()
  const m_str = minutes < 10 ? '0' + minutes : minutes.toString()
  
  return h_str + ':' + m_str
}



