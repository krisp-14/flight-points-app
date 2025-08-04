import React from "react";
import type { Flight } from "@/lib/database/supabase";
import { FlightCard } from "@/components/flight-card";

interface FlightListProps {
  flights: Flight[];
  selectedFlightId: number | null;
  onSelect: (flight: Flight) => void;
}

export const FlightList: React.FC<FlightListProps> = ({ flights, selectedFlightId, onSelect }) => {
  if (!flights || flights.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No flights available.</div>;
  }
  return (
    <div>
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          selected={selectedFlightId === flight.id}
          onSelect={() => onSelect(flight)}
        />
      ))}
    </div>
  );
}; 