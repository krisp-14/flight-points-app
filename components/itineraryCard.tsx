import React from "react";
import type { Itinerary } from "@/lib/database/supabase";
import { getBookableProgramsForItinerary } from "@/lib/database/logic/itineraryBookability";
import { 
  formatFlightTimeDisplay, 
  formatFlightDuration, 
  isSameDayArrival 
} from "@/lib/shared/utils";

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

  // Get timezone info from first segment
  const firstSegment = itinerary.segments[0];
  const originTimezone = firstSegment.origin_timezone;
  const destinationTimezone = firstSegment.destination_timezone;

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
              {formatFlightTimeDisplay(seg.flight.departure_time, seg.origin_timezone)} → 
              {formatFlightTimeDisplay(seg.flight.arrival_time, seg.destination_timezone)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t">
        <div className="text-sm font-medium mb-1">Booking Options:</div>
        <ul className="text-xs">
          {bookablePrograms.length > 0 ? (
            bookablePrograms.map(opt => (
              <li key={opt.program_id} className={opt.canBook ? "text-green-600 font-bold" : "text-gray-600"}>
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
