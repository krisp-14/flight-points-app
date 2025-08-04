// Airport timezone mapping for proper flight time display
// Using IANA timezone identifiers for accurate timezone handling

export const AIRPORT_TIMEZONES: Record<string, string> = {
  // North America
  'YYZ': 'America/Toronto',          // Toronto Pearson
  'YUL': 'America/Montreal',         // Montreal Trudeau  
  'YVR': 'America/Vancouver',        // Vancouver
  'JFK': 'America/New_York',         // New York JFK
  'LAX': 'America/Los_Angeles',      // Los Angeles
  'ORD': 'America/Chicago',          // Chicago O'Hare
  'DFW': 'America/Chicago',          // Dallas/Fort Worth
  'DEN': 'America/Denver',           // Denver
  'SEA': 'America/Los_Angeles',      // Seattle
  'SFO': 'America/Los_Angeles',      // San Francisco
  'BOS': 'America/New_York',         // Boston
  'MIA': 'America/New_York',         // Miami
  'ATL': 'America/New_York',         // Atlanta

  // Europe  
  'LHR': 'Europe/London',            // London Heathrow
  'LGW': 'Europe/London',            // London Gatwick
  'CDG': 'Europe/Paris',             // Paris Charles de Gaulle
  'ORY': 'Europe/Paris',             // Paris Orly
  'FRA': 'Europe/Berlin',            // Frankfurt
  'MUC': 'Europe/Berlin',            // Munich
  'AMS': 'Europe/Amsterdam',         // Amsterdam
  'MAD': 'Europe/Madrid',            // Madrid
  'BCN': 'Europe/Madrid',            // Barcelona
  'FCO': 'Europe/Rome',              // Rome Fiumicino
  'MXP': 'Europe/Rome',              // Milan Malpensa
  'ZUR': 'Europe/Zurich',            // Zurich
  'VIE': 'Europe/Vienna',            // Vienna
  'CPH': 'Europe/Copenhagen',        // Copenhagen
  'OSL': 'Europe/Oslo',              // Oslo
  'STO': 'Europe/Stockholm',         // Stockholm
  'HEL': 'Europe/Helsinki',          // Helsinki
  'WAW': 'Europe/Warsaw',            // Warsaw
  'ATH': 'Europe/Athens',            // Athens

  // Asia Pacific
  'NRT': 'Asia/Tokyo',               // Tokyo Narita
  'HND': 'Asia/Tokyo',               // Tokyo Haneda  
  'ICN': 'Asia/Seoul',               // Seoul Incheon
  'PVG': 'Asia/Shanghai',            // Shanghai Pudong
  'PEK': 'Asia/Shanghai',            // Beijing Capital
  'HKG': 'Asia/Hong_Kong',           // Hong Kong
  'SIN': 'Asia/Singapore',           // Singapore
  'BKK': 'Asia/Bangkok',             // Bangkok
  'DEL': 'Asia/Kolkata',             // Delhi
  'BOM': 'Asia/Kolkata',             // Mumbai
  'SYD': 'Australia/Sydney',         // Sydney
  'MEL': 'Australia/Melbourne',      // Melbourne

  // Middle East & Africa
  'DXB': 'Asia/Dubai',               // Dubai
  'DOH': 'Asia/Qatar',               // Doha
  'CAI': 'Africa/Cairo',             // Cairo
  'JNB': 'Africa/Johannesburg',      // Johannesburg
  'CPT': 'Africa/Cape_Town',         // Cape Town

  // South America
  'GRU': 'America/Sao_Paulo',        // São Paulo
  'GIG': 'America/Sao_Paulo',        // Rio de Janeiro
  'EZE': 'America/Argentina/Buenos_Aires', // Buenos Aires
  'SCL': 'America/Santiago',         // Santiago
  'BOG': 'America/Bogota',           // Bogotá
  'LIM': 'America/Lima',             // Lima
};

/**
 * Get timezone for airport code
 * @param airportCode 3-letter airport code
 * @returns IANA timezone identifier or UTC as fallback
 */
export function getAirportTimezone(airportCode: string | undefined): string {
  if (!airportCode) {
    console.warn('Airport code is undefined or empty, using UTC');
    return 'UTC';
  }
  
  const timezone = AIRPORT_TIMEZONES[airportCode.toUpperCase()];
  if (!timezone) {
    console.warn(`No timezone mapping found for airport: ${airportCode}, using UTC`);
    return 'UTC';
  }
  return timezone;
}

/**
 * Get timezone abbreviation for airport code at a specific time
 * @param airportCode 3-letter airport code  
 * @param dateTime ISO date string
 * @returns timezone abbreviation (e.g., "EST", "PST")
 */
export function getAirportTimezoneAbbr(airportCode: string | undefined, dateTime: string): string {
  const timezone = getAirportTimezone(airportCode);
  try {
    return new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    }).formatToParts(new Date(dateTime))
      .find(part => part.type === 'timeZoneName')?.value || 'UTC';
  } catch (error) {
    console.error('Error getting timezone abbreviation:', error);
    return 'UTC';
  }
}