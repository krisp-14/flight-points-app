import React from "react";
import { Card } from "@/components/ui/card";
import type { RouteData } from "@/lib/core/types";
import { CITY_METADATA, getAvailableDates, formatAvailableDates } from "@/lib/features/routes";

interface RouteCardProps {
  route: RouteData;
  onSelect: (origin: string, destination: string, availableDates: Date[]) => void;
}

export function RouteCard({ route, onSelect }: RouteCardProps) {
  const originCity = CITY_METADATA[route.origin_code];
  const destinationCity = CITY_METADATA[route.destination_code];
  
  const handleClick = () => {
    const availableDates = getAvailableDates(route);
    onSelect(route.origin_code, route.destination_code, availableDates);
  };

  // Generate a simple placeholder gradient based on destination
  const getPlaceholderGradient = (destinationCode: string) => {
    const colors = {
      YYZ: "from-blue-500 to-blue-600", // Toronto - blue
      CDG: "from-purple-500 to-purple-600", // Paris - purple  
      LHR: "from-gray-500 to-gray-600", // London - gray
      ATH: "from-orange-500 to-orange-600", // Athens - orange
      FRA: "from-green-500 to-green-600", // Frankfurt - green
      AMS: "from-red-500 to-red-600", // Amsterdam - red
    };
    return colors[destinationCode as keyof typeof colors] || "from-slate-500 to-slate-600";
  };

  // Calculate estimated retail price (rough approximation)
  const estimatedRetailPrice = Math.round(route.avg_points * 0.012); // ~1.2 cents per point

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg group"
      onClick={handleClick}
    >
      {/* Placeholder background gradient */}
      <div className={`h-48 w-full bg-gradient-to-br ${getPlaceholderGradient(route.destination_code)} relative`}>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* City name overlay */}
        <div className="absolute top-4 left-4 text-white">
          <h3 className="text-xl font-bold">{destinationCity.city}, {destinationCity.country}</h3>
          <p className="text-sm opacity-90">Available: {formatAvailableDates(route)}</p>
        </div>

        {/* Flight info badge */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm font-medium">
            {route.available_flights} flights
          </span>
        </div>
      </div>

      {/* Route and pricing info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">
              {originCity.city} ({route.origin_code}) → {destinationCity.city} ({route.destination_code})
            </h4>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-600 text-sm">about </span>
            <span className="font-bold text-gray-900">
              {route.avg_points.toLocaleString()} pts
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-sm">${estimatedRetailPrice} Retail Price</span>
          </div>
        </div>

        {/* Program options indicator */}
        <div className="mt-2 text-xs text-gray-500">
          {route.program_options} booking programs available
        </div>
      </div>
    </Card>
  );
}