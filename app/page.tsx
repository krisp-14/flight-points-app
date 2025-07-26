"use client"

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { getPrograms, searchFlights, findTransferPath, getUserPoints, saveUserPoints, searchItineraries } from "./actions";
import type { Program, Flight, Itinerary } from "@/lib/supabase";
import type { Airport } from "../lib/types";
import { canBook } from "@/lib/logic/canBook";
// Modular UI components
import { PointsBalance } from "@/components/PointsBalance";
import { TransferPathPanel } from "@/components/TransferPathPanel";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { ItineraryCard } from "@/components/itineraryCard";

// Debounce utility
function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
  React.useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}


export default function FlightPointsOptimizer() {
  // Form state
  // Use selectedOrigin and selectedDestination from AirportCombobox
  const [date, setDate] = useState<Date>()
  const [sourceProgram, setSourceProgram] = useState<number | "">("")
  const [optimizationMode, setOptimizationMode] = useState("value")
  // Placeholder userId for now (replace with real user ID if you have auth)
  const userId = "00000000-0000-0000-0000-000000000001";

  // Data state
  const [programs, setPrograms] = useState<Program[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [transferPath, setTransferPath] = useState<any>(null)
  const [userPoints, setUserPoints] = useState<{ [programId: number]: number }>({});
  const [pointsError, setPointsError] = useState<string | null>(null);

  // Add state for itineraries and selectedItinerary
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);

  // UI state
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isFindingPath, setIsFindingPath] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [errorType, setErrorType] = useState<"no-flights" | "no-path" | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)

  // Fetch programs on component mount
  useEffect(() => {
    async function fetchPrograms() {
      try {
        setIsLoadingPrograms(true)
        const data = await getPrograms()
        console.log("Fetched programs:", data) // Debug log
        setPrograms(data)
        setDbError(null)
      } catch (error) {
        console.error("Error fetching programs:", error)
        setDbError("Failed to load loyalty programs. Using mock data instead.")
        // Set mock programs as fallback
        setPrograms([ 
          { id: 1, name: "Amex Membership Rewards"},
          { id: 2, name: "RBC Avion"},
          { id: 3, name: "CIBC Aventura"},
          { id: 4, name: "TD Rewards"},
          { id: 5, name: "Aeroplan"},
          { id: 6, name: "Marriott Bonvoy"},
        ])
      } finally {
        setIsLoadingPrograms(false)
      }
    }
    fetchPrograms()
  }, [])

  // Fetch user points on mount
  useEffect(() => {
    async function fetchPoints() {
      try {
        const points = await getUserPoints(userId);
        setUserPoints(points);
      } catch (err) {
        setPointsError("Failed to load your points balances.");
      }
    }
    fetchPoints();
  }, [userId]);

  // Save user points when they change (debounced)
  useDebouncedEffect(() => {
    async function savePoints() {
      try {
        await saveUserPoints(userId, userPoints);
        setPointsError(null);
      } catch (err) {
        setPointsError("Failed to save your points balances.");
      }
    }
    if (Object.keys(userPoints).length > 0) {
      savePoints();
    }
  }, [userPoints, userId], 500);

  // Replace flight search logic with itinerary search
  const handleSearch = async () => {
    if (!selectedOrigin?.code || !selectedDestination?.code || !date) return;
    setIsSearching(true);
    setSearchPerformed(true);
    setSelectedItinerary(null);
    setTransferPath(null);
    setErrorType(null);
    setItineraries([]);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const itineraryResults = await searchItineraries(selectedOrigin.code, selectedDestination.code, formattedDate);
      setItineraries(itineraryResults);
      if (itineraryResults.length === 0) {
        setErrorType("no-flights");
      }
    } catch (error) {
      console.error("Error searching itineraries:", error);
      setErrorType("no-flights");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFlightSelect = async (flight: Flight) => {
    setSelectedFlight(flight)
    setTransferPath(null)
    setErrorType(null)
    setIsFindingPath(true)

    try {
      // Pass userPoints as the fourth argument
      const result = await findTransferPath(
        Number(sourceProgram),
        flight.bookable_programs,
        optimizationMode,
        userPoints
      );
      setTransferPath(result.path);
      if (result.errorType) {
        setErrorType(result.errorType);
      }
    } catch (error) {
      console.error("Error finding transfer path:", error)
      setErrorType("no-path")
    } finally {
      setIsFindingPath(false)
    }
  }

  const handleRetry = () => {
    setSearchPerformed(false)
    setErrorType(null)
    setSelectedFlight(null)
    setTransferPath(null)
  }

  // Debug log for programs
  console.log("Current programs state:", programs)
  console.log("Current sourceProgram state:", sourceProgram)

  const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Airport | null>(null);


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Flight Points Optimizer</h1>

      {dbError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <p>{dbError}</p>
        </div>
      )}

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
            onChange={(programId, value) =>
              setUserPoints((prev) => ({ ...prev, [programId]: value }))
            }
          />
        </CardContent>
      </Card>

      {searchPerformed && (
        <>
          {/* Available Itineraries Section */}
          {itineraries.length > 0 && (
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
                        key={itinerary.id}
                        itinerary={itinerary}
                        userPoints={userPoints}
                        onSelect={() => setSelectedItinerary(itinerary)}
                        selected={selectedItinerary?.id === itinerary.id}
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
                  onRetry={handleRetry}
                  optimizationMode={optimizationMode}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
