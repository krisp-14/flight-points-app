"use server"

import { getSupabaseClient, type Program, type Flight, type TransferPath } from "@/lib/database/supabase"
import type { Itinerary } from "@/lib/database/supabase";
import { findBestTransferPath } from "@/lib/database/logic/findBestTransferPath";
import { getCached, setCache } from "@/lib/database/cache";
import { SUPABASE_TABLES, REGION_BY_AIRPORT } from "@/lib/core/constants";

export async function getPrograms(): Promise<Program[]> {
  try {
    // Check cache first
    const cacheKey = "programs:all";
    const cached = getCached<Program[]>(cacheKey);
    if (cached) {
      console.log("Programs fetched from cache");
      return cached;
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("programs").select("*").order("name")

    if (error) {
      console.error("Error fetching programs:", error)
      return [] as Program[] // No fallback mock data
    }

    console.log("Programs fetched from database:", data)
    const programs = (data as Program[]) || [];

    // Cache the results
    setCache(cacheKey, programs);

    return programs;
  } catch (error) {
    console.error("Unexpected error in getPrograms:", error)
    return [] // No fallback mock data
  }
}

export async function searchFlights(origin: string, destination: string, date: string): Promise<Flight[]> {
  // Parse the date and create a ±3 day range
  const targetDate = new Date(date);
  const startDate = new Date(targetDate);
  startDate.setDate(startDate.getDate() - 3);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(targetDate);
  endDate.setDate(endDate.getDate() + 3);
  endDate.setHours(23, 59, 59, 999);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('flights_with_bookable_options')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('departure_time', `${startDateStr}T00:00:00`)
    .lte('departure_time', `${endDateStr}T23:59:59`);

  if (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
  return (data as Flight[]) || [];
}

export async function searchItineraries(origin: string, destination: string, date: string): Promise<Itinerary[]> {
  console.log('Searching itineraries for:', { origin, destination, date });
  
  // Parse the date and create a ±3 day range
  const targetDate = new Date(date);
  const startDate = new Date(targetDate);
  startDate.setDate(startDate.getDate() - 3);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(targetDate);
  endDate.setDate(endDate.getDate() + 3);
  endDate.setHours(23, 59, 59, 999);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('itineraries_with_segments')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('departure_time', `${startDateStr}T00:00:00`)
    .lte('departure_time', `${endDateStr}T23:59:59`);

  console.log('Supabase query result:', { data, error, dateRange: { startDateStr, endDateStr } });

  if (error) {
    console.error('Error fetching itineraries:', error);
    return [];
  }
  
  console.log('Returning itineraries:', data);
  return (data as Itinerary[]) || [];
}

/**
 * Fetch distinct routes available in Supabase so we only show real data on Explore.
 */
export async function getAvailableRoutes(): Promise<
  {
    origin: string;
    destination: string;
    earliest_departure: string | null;
    count: number;
    region: string;
    minPointsByProgram: Record<number, number>;
  }[]
> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.ITINERARIES)
    .select('origin,destination,departure_time,segments');

  if (error || !data) {
    console.error("Error fetching available routes:", error);
    return [];
  }

  type RouteAgg = {
    origin: string;
    destination: string;
    earliest_departure: string | null;
    count: number;
    region: string;
    minPointsByProgram: Record<number, number>;
  };

  const routeMap = new Map<string, RouteAgg>();

  const computeProgramTotals = (itinerary: any): Record<number, number> => {
    if (!itinerary?.segments || itinerary.segments.length === 0) return {};
    // Build intersection of programs across segments
    const programSets = itinerary.segments.map((seg: any) =>
      new Set((seg.flight?.bookable_options || []).map((opt: any) => opt.program_id))
    );
    const intersection = programSets.reduce((acc, set) => {
      return new Set([...acc].filter((x) => set.has(x)));
    });

    const totals: Record<number, number> = {};
    intersection.forEach((programId) => {
      let total = 0;
      for (const seg of itinerary.segments) {
        const opt = (seg.flight?.bookable_options || []).find((o: any) => o.program_id === programId);
        if (!opt || typeof opt.points_required !== "number") {
          total = 0;
          break;
        }
        total += opt.points_required;
      }
      if (total > 0) {
        totals[programId as number] = total;
      }
    });
    return totals;
  };

  for (const row of data as { origin: string; destination: string; departure_time: string; segments?: any[] }[]) {
    const key = `${row.origin}-${row.destination}`;
    const region = REGION_BY_AIRPORT[row.destination?.toUpperCase()] || "Unknown";
    const existing = routeMap.get(key);
    const programTotals = computeProgramTotals(row);

    if (!existing) {
      routeMap.set(key, {
        origin: row.origin,
        destination: row.destination,
        earliest_departure: row.departure_time || null,
        count: 1,
        region,
        minPointsByProgram: { ...programTotals },
      });
    } else {
      existing.count += 1;
      if (!existing.earliest_departure || row.departure_time < existing.earliest_departure) {
        existing.earliest_departure = row.departure_time;
      }
      // Update min points per program
      for (const [pid, pts] of Object.entries(programTotals)) {
        const id = Number(pid);
        const current = existing.minPointsByProgram[id];
        if (current === undefined || pts < current) {
          existing.minPointsByProgram[id] = pts;
        }
      }
    }
  }

  return Array.from(routeMap.values()).sort((a, b) => (b.count || 0) - (a.count || 0));
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
    // OPTIMIZATION: Fetch in parallel instead of sequentially
    const supabase = getSupabaseClient();
    const [programsResult, transferPathsResult] = await Promise.all([
      supabase.from("programs").select("*"),
      supabase.from("transfer_paths").select("*")
    ]);

    if (programsResult.error || !programsResult.data) {
      console.error("Error fetching programs:", programsResult.error);
      return { path: null, errorType: "no-path" };
    }

    if (transferPathsResult.error || !transferPathsResult.data) {
      console.error("Error fetching transfer paths:", transferPathsResult.error);
      return { path: null, errorType: "no-path" };
    }

    const programs = programsResult.data;
    const transferPaths = transferPathsResult.data;

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
      bonusThreshold: number | null;
      bonusAmount: number | null;
      bonusApplies: boolean;
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
        bonusThreshold: transfer.bonus_threshold ?? null,
        bonusAmount: transfer.bonus_amount ?? null,
        bonusApplies: transfer.bonus_applies ?? false,
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
