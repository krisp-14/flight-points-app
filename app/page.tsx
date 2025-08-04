"use client"

import React from "react";
import { canBook } from "@/lib/database/logic/canBook";
// Feature imports
import { usePointsManagement } from "@/lib/features/points";
import { useProgramsData } from "@/lib/features/programs";
import { useFormState } from "@/lib/features/routes";
import { useFlightSearch } from "@/lib/features/flights";
import type { Flight } from "@/lib/database/supabase";
import { DEFAULT_USER_ID } from "@/lib/core";
// Modular UI components
import { PointsBalance } from "@/components/PointsBalance";
import { TransferPathPanel } from "@/components/TransferPathPanel";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { ItineraryCard } from "@/components/itineraryCard";
import { RouteGrid } from "@/components/RouteGrid";


export default function FlightPointsOptimizer() {
  // Placeholder userId for now (replace with real user ID if you have auth)
  const userId = DEFAULT_USER_ID;

  // Custom hooks
  const { userPoints, pointsError, updateUserPoints } = usePointsManagement(userId);
  const { programs, isLoadingPrograms, dbError } = useProgramsData();
  const {
    selectedOrigin,
    selectedDestination,
    date,
    sourceProgram,
    optimizationMode,
    setSelectedOrigin,
    setSelectedDestination,
    setDate,
    setSourceProgram,
    setOptimizationMode,
    handleRouteSelect,
    isFormValid
  } = useFormState();
  const {
    itineraries,
    selectedItinerary,
    selectedFlight,
    transferPath,
    isSearching,
    isFindingPath,
    searchPerformed,
    errorType,
    setSelectedItinerary,
    searchForItineraries,
    selectFlight,
    retry
  } = useFlightSearch();

  // Handler functions
  const handleSearch = async () => {
    if (!isFormValid) return;
    await searchForItineraries(selectedOrigin!.code, selectedDestination!.code, date!);
  };



  const handleFlightSelect = async (flight: Flight) => {
    await selectFlight(flight, Number(sourceProgram), optimizationMode, userPoints);
  };






  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Flight Points Optimizer</h1>

      {dbError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <p>{dbError}</p>
        </div>
      )}

      {/* Route Selection Grid */}
      <div className="mb-8">
        <RouteGrid onRouteSelect={handleRouteSelect} />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Award Flights</CardTitle>
          <CardDescription>Enter your travel details to find available award flights</CardDescription>
        </CardHeader>
        <CardContent>
          <FlightSearchForm
            origin={selectedOrigin}
            destination={selectedDestination}
            date={date}
            sourceProgram={sourceProgram}
            optimizationMode={optimizationMode}
            onOriginChange={setSelectedOrigin}
            onDestinationChange={setSelectedDestination}
            onDateChange={(d) => setDate(d ?? undefined)}
            onSourceProgramChange={setSourceProgram}
            onOptimizationModeChange={setOptimizationMode}
            onSearch={handleSearch}
            isLoadingPrograms={isLoadingPrograms}
            programs={programs}
            isSearching={isSearching}
          />
          {/* Points Balances Section */}
          <PointsBalance
            programs={programs}
            userPoints={userPoints}
            error={pointsError || undefined}
            onChange={updateUserPoints}
          />
        </CardContent>
      </Card>

      {searchPerformed && (
        <>
          {/* Available Itineraries Section */}
          {itineraries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Itineraries</CardTitle>
                    <CardDescription>Select an itinerary to see transfer options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {itineraries.map(itinerary => (
                      <ItineraryCard
                        key={itinerary.itinerary_id}
                        itinerary={itinerary}
                        userPoints={userPoints}
                        onSelect={() => setSelectedItinerary(itinerary)}
                        selected={selectedItinerary?.itinerary_id === itinerary.itinerary_id}
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                {/* You can update TransferPathPanel to use selectedItinerary if needed */}
                <TransferPathPanel
                  selectedFlight={selectedItinerary?.segments[0]?.flight || null}
                  transferPath={transferPath}
                  isFindingPath={isFindingPath}
                  errorType={errorType}
                  origin={selectedOrigin?.city || ""}
                  destination={selectedDestination?.city || ""}
                  date={date}
                  onRetry={retry}
                  optimizationMode={optimizationMode}
                />
              </div>
            </div>
          ) : (
            <EmptyState
              errorType={errorType}
              origin={selectedOrigin?.city || ""}
              destination={selectedDestination?.city || ""}
              date={date}
              onRetry={retry}
            />
          )}
        </>
      )}
    </div>
  )
}
