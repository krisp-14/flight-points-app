import React from "react";
import type { Flight, Itinerary } from "@/lib/database/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { TransferPathStepper } from "@/components/transfer-path-stepper";
import { getTimezoneForAirport } from "@/lib/shared/utils";

interface TransferPathPanelProps {
  selectedItinerary: Itinerary | null;
  selectedFlight?: Flight | null;
  transferPath: any;
  isFindingPath: boolean;
  errorType: "no-flights" | "no-path" | null;
  origin: string;
  destination: string;
  date: Date | undefined;
  onRetry: () => void;
  optimizationMode: string;
}

export const TransferPathPanel: React.FC<TransferPathPanelProps> = ({
  selectedItinerary,
  selectedFlight = null,
  transferPath,
  isFindingPath,
  errorType,
  origin,
  destination,
  date,
  onRetry,
  optimizationMode,
}) => {
  const derivedItinerary: Itinerary | null = React.useMemo(() => {
    if (selectedItinerary) return selectedItinerary;
    if (!selectedFlight) return null;

    const originTimezone = getTimezoneForAirport(selectedFlight.origin_code);
    const destinationTimezone = getTimezoneForAirport(selectedFlight.destination_code);

    return {
      itinerary_id: selectedFlight.id,
      origin: selectedFlight.origin_code,
      destination: selectedFlight.destination_code,
      departure_time: selectedFlight.departure_time,
      arrival_time: selectedFlight.arrival_time,
      segments: [
        {
          segment_number: 1,
          flight: {
            ...selectedFlight,
            origin: selectedFlight.origin_code,
            destination: selectedFlight.destination_code,
          },
          origin_timezone: originTimezone,
          destination_timezone: destinationTimezone,
        },
      ],
    };
  }, [selectedFlight, selectedItinerary]);

  if (!derivedItinerary) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Select a flight or itinerary to see transfer options</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimal Transfer Path</CardTitle>
        <CardDescription>
          {optimizationMode === "value" && "Optimized for best point value"}
          {optimizationMode === "time" && "Optimized for fastest transfer time"}
          {optimizationMode === "hops" && "Optimized for fewest transfer steps"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isFindingPath ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Finding optimal transfer path...</span>
          </div>
        ) : errorType ? (
          <EmptyState
            errorType={errorType}
            origin={origin}
            destination={destination}
            date={date}
            onRetry={onRetry}
          />
        ) : (
          <TransferPathStepper path={transferPath} itinerary={derivedItinerary} />
        )}
      </CardContent>
    </Card>
  );
}; 
