import React from "react";
import type { Flight } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { TransferPathStepper } from "@/components/transfer-path-stepper";

interface TransferPathPanelProps {
  selectedFlight: Flight | null;
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
  selectedFlight,
  transferPath,
  isFindingPath,
  errorType,
  origin,
  destination,
  date,
  onRetry,
  optimizationMode,
}) => {
  if (!selectedFlight) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Select a flight to see transfer options</p>
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
          <TransferPathStepper path={transferPath} />
        )}
      </CardContent>
    </Card>
  );
}; 