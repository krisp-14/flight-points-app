"use server"

import { getSupabaseClient, type Program, type Flight } from "@/lib/supabase"
import { initializeDatabase } from "@/lib/db-init"

export async function getPrograms(): Promise<Program[]> {
  try {
    // Try to initialize the database if needed
    const initialized = await initializeDatabase()
    console.log("Database initialized:", initialized)

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("programs").select("*").order("name")

    if (error) {
      console.error("Error fetching programs:", error)
      return [] as Program[] // No fallback mock data
    }

    console.log("Programs fetched from database:", data)
    return (data as Program[]) || []
  } catch (error) {
    console.error("Unexpected error in getPrograms:", error)
    return [] // No fallback mock data
  }
}

export async function searchFlights(origin: string, destination: string, date: string): Promise<Flight[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('flights_with_programs')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .eq('departure_time', `${date}T08:00:00`); // Adjust this filter as needed for your schema

  if (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
  return (data as Flight[]) || [];
}

export async function findTransferPath(
  sourceProgram: number,
  targetPrograms: number[],
  optimizationMode: string,
  userPoints: { [programId: number]: number }
): Promise<{
  path:
    | {
        from: Program
        to: Program
        ratio: string
        transferTime: number
      }[]
    | null
  errorType: "no-path" | null
}> {
  try {
    // Fetch all transfer paths from Supabase
    const supabase = getSupabaseClient();
    const { data: transferPaths, error } = await supabase.from("transfer_paths").select("*");

    if (error || !transferPaths) {
      console.error("Error fetching transfer paths:", error);
      return { path: null, errorType: "no-path" };
    }

    // Fetch all programs for reference
    const { data: programs, error: programsError } = await supabase.from("programs").select("*");

    if (programsError || !programs) {
      console.error("Error fetching programs for path finding:", programsError);
      return { path: null, errorType: "no-path" };
    }
    const programsTyped: Program[] = programs as Program[];

    // TODO: Implement real pathfinding logic here using transferPaths and programs
    // For now, always return no-path
    return { path: null, errorType: "no-path" };
  } catch (error) {
    console.error("Unexpected error in findTransferPath:", error);
    return { path: null, errorType: "no-path" };
  }
}
