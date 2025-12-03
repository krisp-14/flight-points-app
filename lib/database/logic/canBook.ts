import type { Flight } from "@/lib/database/supabase";

/**
 * Returns true if the user can book the flight with any of their points balances.
 * @param flight The flight object (must have bookable_options)
 * @param userPoints An object mapping programId to points balance
 */
export function canBook(flight: Flight, userPoints: { [programId: number]: number }): boolean {
  if (!flight.bookable_options || !Array.isArray(flight.bookable_options)) return false;
  return flight.bookable_options.some(
    (opt) => typeof opt.points_required === "number" && (userPoints[opt.program_id] || 0) >= opt.points_required
  );
} 
