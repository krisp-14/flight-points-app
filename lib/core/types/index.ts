// Consolidated type definitions for the Flight Points Optimizer

// Core domain types (using the simpler Airport type for form components)
export type Airport = {
  code: string;
  city: string;
  country: string;
};

export type RouteData = {
  origin_code: string;
  destination_code: string;
  available_flights: number;
  avg_points: number;
  program_options: number;
  earliest_flight: string;
  latest_flight: string;
};

export type CityMetadata = {
  city: string;
  country: string;
  region: string;
};


