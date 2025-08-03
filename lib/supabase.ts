import { createClient } from "@supabase/supabase-js"

// Create a single instance of the Supabase client to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    throw new Error("Supabase URL and key are required. Please check your environment variables.")
  }

  console.log("Creating Supabase client with URL:", supabaseUrl)
  supabaseInstance = createClient(supabaseUrl, supabaseKey)
  return supabaseInstance
}

// Export for convenience
export const supabase = getSupabaseClient()

// =============================================================================
// REFACTORED DATABASE TYPES
// =============================================================================

export type Airport = {
  id: number;
  code: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
};

export type Program = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type TransferPath = {
  id: number;
  from_program_id: number;
  to_program_id: number;
  ratio: string;
  transfer_time_hours: number;
  created_at: string;
  updated_at: string;
};

export type BookableOption = {
  program_id: number;
  program_name: string;
  points_required: number;
};

export type Flight = {
  id: number;
  airline: string;
  flight_number: string;
  origin_code: string;
  destination_code: string;
  departure_time: string;
  arrival_time: string;
  cabin_class: 'Economy' | 'Business' | 'First';
  points_required: number;
  created_at: string;
  updated_at: string;
  // Computed fields for backward compatibility
  origin?: string;
  destination?: string;
  bookable_options?: BookableOption[];
};

export type FlightProgram = {
  flight_id: number;
  program_id: number;
  points_required: number;
  created_at: string;
};

export type UserPoints = {
  user_id: string;
  program_id: number;
  points: number;
  created_at: string;
  updated_at: string;
};

export type ItinerarySegment = {
  segment_number: number;
  flight: Flight;
  origin_timezone: string;
  destination_timezone: string;
};

export type Itinerary = {
  itinerary_id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  segments: ItinerarySegment[];
};
