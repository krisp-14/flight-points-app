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

export type Program = {
  id: number;
  name: string;
};

export type TransferPath = {
  id: number;
  from_program_id: number;
  to_program_id: number;
  ratio: string;
};

export type Flight = {
  id: number;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  cabin_class: string;
  points_required: number;
  bookable_programs: number[];
};

export type FlightProgram = {
  flight_id: number;
  program_id: number;
};
