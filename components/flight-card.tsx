"use client"

import React from "react";
import type { Flight } from "@/lib/supabase";
import { formatInTimeZone } from "date-fns-tz";

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

  const dep = new Date(flight.departure_time);
  const originTz = flight.origin_timezone || "UTC";
  const depStr = formatInTimeZone(dep, originTz, "MMM d, h:mm a zzz");

  const arr = new Date(flight.arrival_time);
  const durationMs = arr.getTime() - dep.getTime();
  const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMin = Math.floor((durationMs / (1000 * 60)) % 60);
  const durationStr = `${durationHrs}h ${durationMin}m`;

  return (
    <div
      className={`border rounded p-4 mb-4 cursor-pointer ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div>
          <div>{flight.origin} → {flight.destination}</div>
          <div>
            Departs {depStr} &middot; Duration: {durationStr}
          </div>
        </div>
        <div className="text-green-600 font-bold">
          {options || "Not bookable"}
        </div>
      </div>
    </div>
  );
};
