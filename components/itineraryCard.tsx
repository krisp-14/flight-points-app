import { formatInTimeZone } from "date-fns-tz";
import type { Itinerary } from "@/lib/supabase";
import { getBookableProgramsForItinerary } from "@/lib/logic/itineraryBookability";

interface ItineraryCardProps {
  itinerary: Itinerary;
  userPoints: { [programId: number]: number };
  onSelect: () => void;
  selected: boolean;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, userPoints, onSelect, selected }) => {
  // Calculate bookable programs and points
  const bookablePrograms = getBookableProgramsForItinerary(itinerary, userPoints);

  // Route string
  const route = [itinerary.origin, ...itinerary.segments.map(s => s.flight.destination)].join(" → ");

  // Total duration
  const dep = new Date(itinerary.departure_time);
  const arr = new Date(itinerary.arrival_time);
  const durationMs = arr.getTime() - dep.getTime();
  const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMin = Math.floor((durationMs / (1000 * 60)) % 60);
  const durationStr = `${durationHrs}h ${durationMin}m`;

  return (
    <div
      className={`border rounded p-4 mb-4 cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
      onClick={onSelect}
    >
      <div className="font-semibold text-lg mb-1">{route}</div>
      <div className="text-sm text-gray-500 mb-2">
        Departs {formatInTimeZone(dep, itinerary.segments[0].origin_timezone, "MMM d, h:mm a zzz")}
        &middot; Duration: {durationStr}
      </div>
      <div>
        {itinerary.segments.map(seg => (
          <div key={seg.segment_number} className="text-xs text-gray-700">
            Segment {seg.segment_number}: {seg.flight.airline} {seg.flight.flight_number}{" "}
            {seg.flight.origin} → {seg.flight.destination}{" "}
            ({formatInTimeZone(new Date(seg.flight.departure_time), seg.origin_timezone, "h:mm a zzz")}
            &rarr; {formatInTimeZone(new Date(seg.flight.arrival_time), seg.destination_timezone, "h:mm a zzz")})
          </div>
        ))}
      </div>
      <div className="mt-2">
        <ul>
          {bookablePrograms.length > 0 ? (
            bookablePrograms.map(opt => (
              <li key={opt.program_id} className={opt.canBook ? "text-green-600 font-bold" : "text-gray-600"}>
                {/* You can add a logo here if you have one for the program */}
                {opt.total_points.toLocaleString()} {opt.program_name} points
                {opt.canBook && " (You can book)"}
              </li>
            ))
          ) : (
            <li className="text-gray-500">Not bookable with your programs</li>
          )}
        </ul>
      </div>
    </div>
  );
};
