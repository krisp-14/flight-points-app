// Application constants and configuration

// User and Authentication
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

// Form defaults
export const DEFAULT_OPTIMIZATION_MODE = "value";

// Timing constants
export const POINTS_SAVE_DEBOUNCE_MS = 500;

// Date formatting
export const DATABASE_DATE_FORMAT = "yyyy-MM-dd";

// API Configuration
export const SUPABASE_TABLES = {
  PROGRAMS: "programs",
  TRANSFER_PATHS: "transfer_paths", 
  FLIGHTS: "flights",
  ITINERARIES: "itineraries_with_segments",
  USER_POINTS: "user_points",
  FLIGHT_PROGRAMS: "flight_programs",
  AIRPORTS: "airports"
} as const;

// Region mapping for Explore mode
export const REGION_BY_AIRPORT: Record<string, "North America" | "South America" | "Europe" | "Asia" | "Africa" | "Oceania" | "Middle East"> = {
  // North America
  YYZ: "North America",
  YUL: "North America",
  YVR: "North America",
  JFK: "North America",
  LAX: "North America",
  ORD: "North America",
  DFW: "North America",
  DEN: "North America",
  SEA: "North America",
  SFO: "North America",
  BOS: "North America",
  MIA: "North America",
  ATL: "North America",
  IAH: "North America",

  // Europe
  LHR: "Europe",
  LGW: "Europe",
  CDG: "Europe",
  ORY: "Europe",
  FRA: "Europe",
  MUC: "Europe",
  AMS: "Europe",
  MAD: "Europe",
  BCN: "Europe",
  FCO: "Europe",
  MXP: "Europe",
  ZRH: "Europe",
  VIE: "Europe",
  CPH: "Europe",
  OSL: "Europe",
  ARN: "Europe",
  HEL: "Europe",
  WAW: "Europe",
  ATH: "Europe",
  DUB: "Europe",

  // Asia
  NRT: "Asia",
  HND: "Asia",
  ICN: "Asia",
  PVG: "Asia",
  PEK: "Asia",
  HKG: "Asia",
  SIN: "Asia",
  BKK: "Asia",
  DEL: "Asia",
  BOM: "Asia",
  TPE: "Asia",
  KUL: "Asia",

  // Oceania
  SYD: "Oceania",
  MEL: "Oceania",
  AKL: "Oceania",

  // Middle East
  DXB: "Middle East",
  DOH: "Middle East",
  AUH: "Middle East",

  // Africa
  CAI: "Africa",
  JNB: "Africa",
  CPT: "Africa",

  // South America
  GRU: "South America",
  GIG: "South America",
  EZE: "South America",
  SCL: "South America",
  BOG: "South America",
  LIM: "South America",
};

// UI Configuration
export const OPTIMIZATION_MODES = {
  VALUE: "value",
  TIME: "time", 
  HOPS: "hops"
} as const;

// Error messages
export const ERROR_MESSAGES = {
  PROGRAMS_LOAD_FAILED: "Failed to load loyalty programs. Using mock data instead.",
  POINTS_LOAD_FAILED: "Failed to load your points balances.",
  POINTS_SAVE_FAILED: "Failed to save your points balances.",
  SEARCH_FAILED: "Error searching for flights. Please try again.",
  NO_FLIGHTS_FOUND: "We couldn't find any award flights for your search."
} as const;

// Mock data fallback
export const MOCK_PROGRAMS = [
  { 
    id: 1, 
    name: "Amex Membership Rewards", 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
  { 
    id: 2, 
    name: "RBC Avion", 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
  { 
    id: 3, 
    name: "CIBC Aventura", 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
  { 
    id: 4, 
    name: "TD Rewards", 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
  { 
    id: 5, 
    name: "Aeroplan", 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
  { 
    id: 6, 
    name: "Marriott Bonvoy", 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
];
