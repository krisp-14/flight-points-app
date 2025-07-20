"use client"

import { format, parseISO } from "date-fns"
import { PlaneTakeoff } from "lucide-react"
import type { Flight } from "@/lib/supabase"

type FlightCardProps = {
  flight: Flight
  selected: boolean
  onSelect: () => void
}

export function FlightCard({ flight, selected, onSelect }: FlightCardProps) {
  const departureTime = parseISO(flight.departure_time)
  const arrivalTime = parseISO(flight.arrival_time)

  return (
    <div
      className={`p-4 border rounded-md mb-4 cursor-pointer transition-colors ${
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <PlaneTakeoff className="mr-2 h-5 w-5" />
          <span className="font-medium">
            {flight.airline} {flight.flight_number} • {flight.origin} → {flight.destination}
          </span>
        </div>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Available</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
        <div>
          <span className="font-medium">{flight.cabin_class}</span> Class
        </div>
        <div>Departs {format(departureTime, "MMM d, h:mm a")}</div>
        <div>
          <span className="font-medium">{flight.points_required.toLocaleString()}</span> points
        </div>
      </div>
    </div>
  )
}
