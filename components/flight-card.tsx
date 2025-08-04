"use client"

import React from "react";
import type { Flight } from "@/lib/database/supabase";
import { formatFlightTimeDisplay, formatFlightDuration, getTimezoneForAirport } from "@/lib/shared/utils";

interface FlightCardProps {
  flight: Flight;
  selected: boolean;
  onSelect: () => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, selected, onSelect }) => {
  // Format all bookable options
  const options = (flight.bookable_options || [])
    .filter(opt => typeof opt.points_required === "number")
    .map(opt => `${opt.points_required.toLocaleString()} ${opt.program_name} points`)
    .join(" or ");

  // Get proper timezones for origin and destination
  const originTimezone = getTimezoneForAirport(flight.origin_code);
  const destinationTimezone = getTimezoneForAirport(flight.destination_code);
  
  // Format departure time in origin timezone
  const depStr = formatFlightTimeDisplay(flight.departure_time, originTimezone, true);
  
  // Format arrival time in destination timezone  
  const arrStr = formatFlightTimeDisplay(flight.arrival_time, destinationTimezone, true);
  
  // Calculate duration
  const durationStr = formatFlightDuration(flight.departure_time, flight.arrival_time);

  return (
    <div
      className={`border rounded p-4 mb-4 cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div>
          <div>{flight.origin_code} → {flight.destination_code}</div>
          <div>
            Departs {depStr}
          </div>
          <div>
            Arrives {arrStr} &middot; Duration: {durationStr}
          </div>
        </div>
        <div className="text-green-600 font-bold">
          {options || "Not bookable"}
        </div>
      </div>
    </div>
  );
};
