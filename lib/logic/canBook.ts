import type { Flight } from "@/lib/supabase";

/**
 * Returns true if the user can book the flight with any of their points balances.
 * @param flight The flight object (must have bookable_programs and points_required)
 * @param userPoints An object mapping programId to points balance
 */
export function canBook(flight: Flight, userPoints: { [programId: number]: number }): boolean {
  if (!flight.bookable_programs || !Array.isArray(flight.bookable_programs)) return false;
  return flight.bookable_programs.some(
    (programId) => (userPoints[programId] || 0) >= flight.points_required
  );
} 