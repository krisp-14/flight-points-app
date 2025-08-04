"use server"

import { getSupabaseClient, type Program, type Flight } from "@/lib/database/supabase"
import type { Itinerary } from "@/lib/database/supabase";

export async function getPrograms(): Promise<Program[]> {
  try {
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
    .from('flights_with_bookable_options')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .eq('departure_time', `${date}T08:00:00`); // Adjust as needed

  if (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
  return (data as Flight[]) || [];
}

export async function searchItineraries(origin: string, destination: string, date: string): Promise<Itinerary[]> {
  console.log('Searching itineraries for:', { origin, destination, date });
  
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('itineraries_with_segments')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('departure_time', `${date}T00:00:00`)
    .lt('departure_time', `${date}T23:59:59`);

  console.log('Supabase query result:', { data, error });

  if (error) {
    console.error('Error fetching itineraries:', error);
    return [];
  }
  
  console.log('Returning itineraries:', data);
  return (data as Itinerary[]) || [];
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
    // Direct booking: no transfer needed
    if (targetPrograms.includes(sourceProgram)) {
      return { path: [], errorType: null };
    }
    // Fetch all transfer paths from Supabase
    const supabase = getSupabaseClient();
    const { data: transferPaths, error } = await supabase.from("transfer_paths").select("*");

    if (error || !transferPaths) {
      console.error("Error fetching transfer paths:", error);
      return { path: null, errorType: "no-path" };
    }

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

/**
 * Fetches all points balances for a user from Supabase.
 * Returns an object mapping program_id to points.
 */
export async function getUserPoints(userId: string): Promise<{ [programId: number]: number }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_points')
    .select('program_id, points')
    .eq('user_id', userId);
  if (error || !data) {
    console.error('Error fetching user points:', error);
    return {};
  }
  const points: { [programId: number]: number } = {};
  for (const row of data) {
    const { program_id, points: pts } = row as { program_id: number, points: number };
    points[program_id] = pts;
  }
  return points;
}

/**
 * Upserts all points balances for a user in Supabase.
 * Accepts an object mapping program_id to points.
 */
export async function saveUserPoints(userId: string, points: { [programId: number]: number }): Promise<void> {
  const supabase = getSupabaseClient();
  const rows = Object.entries(points).map(([programId, pts]) => ({
    user_id: userId,
    program_id: Number(programId),
    points: Math.max(0, Math.floor(pts)), // ensure non-negative integer
  }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('user_points').upsert(rows, { onConflict: 'user_id,program_id' });
  if (error) {
    console.error('Error saving user points:', error);
    throw error;
  }
}
