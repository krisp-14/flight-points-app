import React from "react";
import { RouteCard } from "./RouteCard";
import { POPULAR_ROUTES } from "@/lib/features/routes";

interface RouteGridProps {
  onRouteSelect: (origin: string, destination: string, availableDates: Date[]) => void;
}

export function RouteGrid({ onRouteSelect }: RouteGridProps) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Routes</h2>
        <p className="text-gray-600">
          Click any route below to quickly populate your search and find the best points deals
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {POPULAR_ROUTES.map((route) => (
          <RouteCard
            key={`${route.origin_code}-${route.destination_code}`}
            route={route}
            onSelect={onRouteSelect}
          />
        ))}
      </div>
    </div>
  );
}