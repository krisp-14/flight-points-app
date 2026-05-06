import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatInTimeZone } from "date-fns-tz"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// =============================================================================
// TIMEZONE UTILITIES FOR FLIGHT DISPLAY
// =============================================================================

// Simple airport timezone mapping (most common ones)
const BASIC_AIRPORT_TIMEZONES: Record<string, string> = {
  'YYZ': 'America/Toronto',
  'YUL': 'America/Montreal',  
  'YVR': 'America/Vancouver',
  'LHR': 'Europe/London',
  'CDG': 'Europe/Paris',
  'FRA': 'Europe/Berlin',
  'AMS': 'Europe/Amsterdam',
  'JFK': 'America/New_York',
  'LAX': 'America/Los_Angeles',
  'NRT': 'Asia/Tokyo',
  'ICN': 'Asia/Seoul',
  'SIN': 'Asia/Singapore',
  'DXB': 'Asia/Dubai',
  'SYD': 'Australia/Sydney',
  'BOS': 'America/New_York',
  'ATH': 'Europe/Athens',
};

/**
 * Get timezone for airport code (simple version)
 */
export function getTimezoneForAirport(airportCode: string | undefined): string {
  if (!airportCode) return 'UTC';
  const upperCode = airportCode.toUpperCase();
  const timezone = BASIC_AIRPORT_TIMEZONES[upperCode];
  return timezone || 'UTC';
}

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
 * Note: Timezone codes are not displayed - only local times are shown
 */
export function formatFlightTimeDisplay(
  utcTime: string, 
  timezone: string, 
  showDate: boolean = false
): string {
  try {
    // Use UTC if no timezone provided
    if (!timezone || timezone === 'UTC') {
      const format = showDate ? "MMM d, h:mm a" : "h:mm a"
      const utcFormatted = formatInTimeZone(new Date(utcTime), 'UTC', format)
      return utcFormatted;
    }
    
    const format = showDate ? "MMM d, h:mm a" : "h:mm a"
    const localTime = formatInTimeZone(new Date(utcTime), timezone, format)
    return localTime;
  } catch (error) {
    // Fallback to UTC on any error
    const format = showDate ? "MMM d, h:mm a" : "h:mm a"
    const utcFormatted = formatInTimeZone(new Date(utcTime), 'UTC', format)
    return utcFormatted;
  }
}

// =============================================================================
// RECENT SEARCHES UTILITIES
// =============================================================================

export interface RecentSearch {
  id: string;
  origin: string;
  destination: string;
  date: string;
  timestamp: string;
  resultCount: number;
}

const RECENT_SEARCHES_KEY = 'recentExploreSearches';
const MAX_RECENT_SEARCHES = 3;

/**
 * Save a recent search to localStorage
 * Keeps only the most recent MAX_RECENT_SEARCHES searches
 */
export function saveRecentSearch(
  origin: string,
  destination: string,
  date: string,
  resultCount: number
): void {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const existing = localStorage.getItem(RECENT_SEARCHES_KEY);
    let searches: RecentSearch[] = existing ? JSON.parse(existing) : [];

    // Create new search entry
    const newSearch: RecentSearch = {
      id: `${origin}-${destination}-${date}-${Date.now()}`,
      origin,
      destination,
      date,
      timestamp: new Date().toISOString(),
      resultCount,
    };

    // Remove duplicates (same origin, destination, date)
    searches = searches.filter(
      (s) => !(s.origin === origin && s.destination === destination && s.date === date)
    );

    // Add new search at the beginning
    searches.unshift(newSearch);

    // Keep only the most recent MAX_RECENT_SEARCHES
    searches = searches.slice(0, MAX_RECENT_SEARCHES);

    // Save back to localStorage
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
}

/**
 * Load recent searches from localStorage
 */
export function loadRecentSearches(): RecentSearch[] {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading recent searches:', error);
  }
  return [];
}
