import React from "react";
import type { Itinerary } from "@/lib/database/supabase";
import { getBookableProgramsForItinerary } from "@/lib/database/logic/itineraryBookability";
import { 
  formatFlightTimeDisplay, 
  formatFlightDuration, 
  isSameDayArrival,
  getTimezoneForAirport
} from "@/lib/shared/utils";

interface ItineraryCardProps {
  itinerary: Itinerary;
  userPoints: { [programId: number]: number };
  onSelect: () => void;
  selected: boolean;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = React.memo(({ itinerary, userPoints, onSelect, selected }) => {
  // Calculate bookable programs and points - memoized to avoid recalculation
  const bookablePrograms = React.useMemo(
    () => getBookableProgramsForItinerary(itinerary, userPoints),
    [itinerary, userPoints]
  );

  // Route string
  const route = [itinerary.origin, ...itinerary.segments.map(s => s.flight.destination)].join(" → ");

  // Get timezone info using airport codes
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];
  
  // Try to get airport codes from flight data, fallback to itinerary origin/destination
  const originCode = firstSegment.flight.origin_code || itinerary.origin;
  const destinationCode = lastSegment.flight.destination_code || itinerary.destination;
  
  const originTimezone = getTimezoneForAirport(originCode);
  const destinationTimezone = getTimezoneForAirport(destinationCode);

  // Format departure and arrival times in local timezones
  const departureDisplay = formatFlightTimeDisplay(
    itinerary.departure_time, 
    originTimezone, 
    true // show date
  );
  
  const arrivalDisplay = formatFlightTimeDisplay(
    itinerary.arrival_time, 
    destinationTimezone, 
    true // show date
  );

  // Calculate flight duration
  const durationStr = formatFlightDuration(itinerary.departure_time, itinerary.arrival_time);

  // Check if arrival is same day
  const sameDay = isSameDayArrival(
    itinerary.departure_time, 
    itinerary.arrival_time, 
    originTimezone, 
    destinationTimezone
  );

  return (
    <div
      className={`border rounded p-4 mb-4 cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
      onClick={onSelect}
    >
      <div className="font-semibold text-lg mb-1">{route}</div>
      
      <div className="text-sm text-gray-500 mb-2">
        <div>Depart: {departureDisplay}</div>
        <div>Arrive: {arrivalDisplay} {!sameDay && "(next day)"}</div>
        <div>Duration: {durationStr}</div>
      </div>
      
      <div>
        {itinerary.segments.map(seg => (
          <div key={seg.segment_number} className="text-xs text-gray-700 mb-1">
            <div className="font-medium">
              Segment {seg.segment_number}: {seg.flight.airline} {seg.flight.flight_number}
            </div>
            <div>
              {seg.flight.origin} → {seg.flight.destination}
            </div>
            <div>
              {formatFlightTimeDisplay(seg.flight.departure_time, getTimezoneForAirport(seg.flight.origin_code || seg.flight.origin))} → 
              {formatFlightTimeDisplay(seg.flight.arrival_time, getTimezoneForAirport(seg.flight.destination_code || seg.flight.destination))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t">
        <div className="text-sm font-medium mb-2">Booking Options:</div>
        {bookablePrograms.length > 0 ? (
          <div className="space-y-2">
            {bookablePrograms.map(opt => (
              <div 
                key={opt.program_id} 
                className={`text-xs p-2 rounded border ${
                  opt.canBook 
                    ? "bg-green-50 border-green-200 text-green-800" 
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{opt.program_name}</span>
                  <span className={opt.canBook ? "font-bold" : ""}>
                    {opt.total_points.toLocaleString()} points
                  </span>
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  You have: {opt.userPointsForProgram.toLocaleString()} points
                  {opt.canBook ? (
                    <span className="ml-2 text-green-600 font-semibold">✓ You can book</span>
                  ) : (
                    <span className="ml-2 text-red-600">
                      (Need {((opt.total_points - opt.userPointsForProgram) || 0).toLocaleString()} more)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">Not bookable with your programs</div>
        )}
      </div>
    </div>
  );
});
