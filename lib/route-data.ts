// Route data and city metadata for the route selection grid

export interface RouteData {
  origin_code: string;
  destination_code: string;
  available_flights: number;
  avg_points: number;
  program_options: number;
  earliest_flight: string;
  latest_flight: string;
}

export interface CityMetadata {
  city: string;
  country: string;
  region: string;
}

// City metadata mapping
export const CITY_METADATA: Record<string, CityMetadata> = {
  LHR: { city: "London", country: "United Kingdom", region: "Europe" },
  YYZ: { city: "Toronto", country: "Canada", region: "North America" },
  YUL: { city: "Montreal", country: "Canada", region: "North America" },
  CDG: { city: "Paris", country: "France", region: "Europe" },
  BOS: { city: "Boston", country: "USA", region: "North America" },
  ATL: { city: "Atlanta", country: "USA", region: "North America" },
  JFK: { city: "New York City", country: "USA", region: "North America" },
  ATH: { city: "Athens", country: "Greece", region: "Europe" },
  SFO: { city: "San Francisco", country: "USA", region: "North America" },
  FRA: { city: "Frankfurt", country: "Germany", region: "Europe" },
  AMS: { city: "Amsterdam", country: "Netherlands", region: "Europe" },
} as const;

// Static route data from our SQL query results
export const POPULAR_ROUTES: RouteData[] = [
  {
    origin_code: "LHR",
    destination_code: "YYZ", 
    available_flights: 2,
    avg_points: 35000,
    program_options: 3,
    earliest_flight: "2025-08-29T14:00:00",
    latest_flight: "2025-09-06T14:00:00"
  },
  {
    origin_code: "YUL",
    destination_code: "CDG",
    available_flights: 2, 
    avg_points: 37250,
    program_options: 3,
    earliest_flight: "2025-09-01T19:00:00",
    latest_flight: "2025-09-06T13:45:00"
  },
  {
    origin_code: "BOS",
    destination_code: "LHR",
    available_flights: 2,
    avg_points: 40000,
    program_options: 3,
    earliest_flight: "2025-09-11T22:30:00", 
    latest_flight: "2025-09-11T22:30:00"
  },
  {
    origin_code: "YYZ", 
    destination_code: "LHR",
    available_flights: 2,
    avg_points: 40500,
    program_options: 3,
    earliest_flight: "2025-08-31T20:00:00",
    latest_flight: "2025-09-09T18:45:00"
  },
  {
    origin_code: "ATL",
    destination_code: "CDG", 
    available_flights: 2,
    avg_points: 45750,
    program_options: 3,
    earliest_flight: "2025-08-09T20:15:00",
    latest_flight: "2025-09-10T20:15:00"
  },
  {
    origin_code: "JFK",
    destination_code: "ATH",
    available_flights: 2,
    avg_points: 47750,
    program_options: 3,
    earliest_flight: "2025-09-04T16:20:00",
    latest_flight: "2025-09-07T16:20:00"
  },
  {
    origin_code: "SFO",
    destination_code: "FRA",
    available_flights: 2,
    avg_points: 62500,
    program_options: 3,
    earliest_flight: "2025-09-02T15:30:00",
    latest_flight: "2025-09-12T15:30:00"
  },
  {
    origin_code: "YYZ",
    destination_code: "AMS",
    available_flights: 2,
    avg_points: 70000,
    program_options: 3,
    earliest_flight: "2025-08-21T18:00:00",
    latest_flight: "2025-08-30T18:00:00"
  }
];

export type AirportCode = keyof typeof CITY_METADATA;

// Helper function to get city display name
export function getCityDisplayName(airportCode: string): string {
  const metadata = CITY_METADATA[airportCode];
  return metadata ? `${metadata.city}, ${metadata.country}` : airportCode;
}

// Helper function to format route display
export function formatRouteDisplay(origin: string, destination: string): string {
  const originCity = CITY_METADATA[origin]?.city || origin;
  const destinationCity = CITY_METADATA[destination]?.city || destination; 
  return `${originCity} (${origin}) → ${destinationCity} (${destination})`;
}

// Helper function to get available dates for a route
export function getAvailableDates(route: RouteData): Date[] {
  const dates: Date[] = [];
  const earliestDate = new Date(route.earliest_flight);
  const latestDate = new Date(route.latest_flight);
  
  // If earliest and latest are the same, it's just one date
  if (earliestDate.getTime() === latestDate.getTime()) {
    dates.push(earliestDate);
  } else {
    // Add both dates
    dates.push(earliestDate);
    dates.push(latestDate);
  }
  
  return dates;
}

// Helper function to format available dates for display
export function formatAvailableDates(route: RouteData): string {
  const dates = getAvailableDates(route);
  
  if (dates.length === 1) {
    return dates[0].toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    return dates.map(date => 
      date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    ).join(', ');
  }
}