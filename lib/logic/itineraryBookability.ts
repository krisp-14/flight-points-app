import type { Itinerary, BookableOption } from "@/lib/supabase";

/**
 * Returns an array of programs that can book all segments, with total points required.
 */
export function getBookableProgramsForItinerary(
  itinerary: Itinerary,
  userPoints: { [programId: number]: number }
): Array<{ program_id: number; program_name: string; total_points: number; canBook: boolean }> {
  if (!itinerary.segments || itinerary.segments.length === 0) return [];

  // Get the set of program_ids for each segment
  const programSets = itinerary.segments.map(seg =>
    new Set((seg.flight.bookable_options || []).map(opt => opt.program_id))
  );

  // Find the intersection (programs that can book all segments)
  const intersection = programSets.reduce((acc, set) => {
    return new Set([...acc].filter(x => set.has(x)));
  });

  // For each program in the intersection, sum the points required across all segments
  const result: Array<{ program_id: number; program_name: string; total_points: number; canBook: boolean }> = [];
  intersection.forEach(program_id => {
    let total_points = 0;
    let program_name = "";
    let canBook = true;
    for (const seg of itinerary.segments) {
      const opt = seg.flight.bookable_options.find(o => o.program_id === program_id);
      if (!opt || typeof opt.points_required !== "number") {
        canBook = false;
        break;
      }
      total_points += opt.points_required;
      program_name = opt.program_name;
    }
    if (canBook) {
      result.push({
        program_id,
        program_name,
        total_points,
        canBook: (userPoints[program_id] || 0) >= total_points,
      });
    }
  });
  return result;
}
