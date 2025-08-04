import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatInTimeZone } from "date-fns-tz"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// =============================================================================
// TIMEZONE UTILITIES FOR FLIGHT DISPLAY
// =============================================================================

/**
 * Convert UTC time to local airport time for display
 */
export function formatLocalTime(utcTime: string, timezone: string, format: string = "h:mm a"): string {
  try {
    return formatInTimeZone(new Date(utcTime), timezone, format)
  } catch (error) {
    console.error('Error formatting local time:', error)
    return 'Invalid time'
  }
}

/**
 * Calculate actual flight duration in hours (ignoring timezone)
 */
export function calculateFlightDuration(departureTime: string, arrivalTime: string): number {
  const departure = new Date(departureTime)
  const arrival = new Date(arrivalTime)
  const durationMs = arrival.getTime() - departure.getTime()
  return Math.round(durationMs / (1000 * 60 * 60) * 10) / 10 // Round to 1 decimal
}

/**
 * Format flight duration for display
 */
export function formatFlightDuration(departureTime: string, arrivalTime: string): string {
  const hours = calculateFlightDuration(departureTime, arrivalTime)
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  
  if (minutes === 0) {
    return `${wholeHours}h`
  }
  return `${wholeHours}h ${minutes}m`
}

/**
 * Check if arrival is on the same day as departure (in local times)
 */
export function isSameDayArrival(departureTime: string, arrivalTime: string, originTimezone: string, destinationTimezone: string): boolean {
  try {
    const localDeparture = formatInTimeZone(new Date(departureTime), originTimezone, 'yyyy-MM-dd')
    const localArrival = formatInTimeZone(new Date(arrivalTime), destinationTimezone, 'yyyy-MM-dd')
    return localDeparture === localArrival
  } catch (error) {
    console.error('Error checking same day arrival:', error)
    return false
  }
}

/**
 * Format flight time display with timezone info
 */
export function formatFlightTimeDisplay(
  utcTime: string, 
  timezone: string, 
  showDate: boolean = false
): string {
  try {
    const format = showDate ? "MMM d, h:mm a" : "h:mm a"
    const localTime = formatInTimeZone(new Date(utcTime), timezone, format)
    const timezoneAbbr = formatInTimeZone(new Date(utcTime), timezone, 'zzz')
    return `${localTime} ${timezoneAbbr}`
  } catch (error) {
    console.error('Error formatting flight time display:', error)
    return 'Invalid time'
  }
}
