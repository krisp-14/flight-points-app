"use client"

import React from "react";
import type { Flight } from "@/lib/supabase";

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

  return (
    <div
      className={`border rounded p-4 mb-4 cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-lg">
            {flight.airline} {flight.flight_number} &rarr; {flight.destination}
          </div>
          <div className="text-sm text-gray-500">
            {flight.cabin_class} Class &middot; Departs {flight.departure_time ? new Date(flight.departure_time).toLocaleString() : ""}
          </div>
        </div>
        <div className="text-green-600 font-bold">
          {options || "Not bookable"}
        </div>
      </div>
    </div>
  );
};
