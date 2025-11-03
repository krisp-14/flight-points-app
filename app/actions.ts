"use server"

import { getSupabaseClient, type Program, type Flight, type TransferPath } from "@/lib/database/supabase"
import type { Itinerary } from "@/lib/database/supabase";
import { findBestTransferPath } from "@/lib/database/logic/findBestTransferPath";

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

    // Validate optimization mode
    const mode = optimizationMode as "value" | "time" | "hops";
    if (!["value", "time", "hops"].includes(mode)) {
      console.error("Invalid optimization mode:", optimizationMode);
      return { path: null, errorType: "no-path" };
    }

    // Find the best transfer path using our pathfinding algorithm
    const result = await findBestTransferPath({
      sourceProgramId: sourceProgram,
      destinationProgramIds: targetPrograms,
      mode,
    });

    if (!result || result.path.length === 0) {
      return { path: null, errorType: "no-path" };
    }

    // If path is just the source (direct booking), return empty path
    if (result.path.length === 1) {
      return { path: [], errorType: null };
    }

    // Fetch programs and transfer paths data to build detailed path
    const supabase = getSupabaseClient();
    const { data: programs, error: programsError } = await supabase
      .from("programs")
      .select("*");

    if (programsError || !programs) {
      console.error("Error fetching programs:", programsError);
      return { path: null, errorType: "no-path" };
    }

    const { data: transferPaths, error: transferError } = await supabase
      .from("transfer_paths")
      .select("*");

    if (transferError || !transferPaths) {
      console.error("Error fetching transfer paths:", transferError);
      return { path: null, errorType: "no-path" };
    }

    // Build program lookup map
    const programMap = new Map<number, Program>();
    for (const prog of programs as Program[]) {
      programMap.set(prog.id, prog);
    }

    // Build detailed path with program objects and transfer details
    const detailedPath: {
      from: Program;
      to: Program;
      ratio: string;
      transferTime: number;
    }[] = [];

    for (let i = 0; i < result.path.length - 1; i++) {
      const fromId = result.path[i];
      const toId = result.path[i + 1];

      const fromProgram = programMap.get(fromId);
      const toProgram = programMap.get(toId);

      if (!fromProgram || !toProgram) {
        console.error("Program not found:", { fromId, toId });
        continue;
      }

      // Find the transfer path details
      const transfer = (transferPaths as TransferPath[]).find(
        (tp) => tp.from_program_id === fromId && tp.to_program_id === toId
      );

      if (!transfer) {
        console.error("Transfer path not found:", { fromId, toId });
        continue;
      }

      detailedPath.push({
        from: fromProgram,
        to: toProgram,
        ratio: transfer.ratio,
        transferTime: transfer.transfer_time_hours,
      });
    }

    if (detailedPath.length === 0) {
      return { path: null, errorType: "no-path" };
    }

    return { path: detailedPath, errorType: null };
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
