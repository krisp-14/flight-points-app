"use client"

import React, { useState, useEffect, Fragment } from "react";
import { format } from "date-fns"
import { Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TransferPathStepper } from "@/components/transfer-path-stepper"
import { EmptyState } from "@/components/empty-state"
import { FlightCard } from "@/components/flight-card"
import { getPrograms, searchFlights, findTransferPath, getUserPoints, saveUserPoints } from "./actions"
import type { Program, Flight } from "@/lib/supabase";
import { Combobox } from "@headlessui/react";
import { supabase } from "../lib/supabase"; // Adjust path as needed
import type { Airport } from "../lib/types";
import { AirportCombobox } from "../components/AirportCombobox";
import { canBook } from "@/lib/logic/canBook";
import { PointsBalance } from "@/components/PointsBalance";
import { FlightList } from "@/components/FlightList";

// Custom input for react-datepicker that forwards ref and props
const DateInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  (props, ref) => <Input ref={ref} {...props} />
);
DateInput.displayName = "DateInput";

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

  const handleSearch = async () => {
    if (!selectedOrigin?.code || !selectedDestination?.code || !date || !sourceProgram) return

    setIsSearching(true)
    setSearchPerformed(true)
    setSelectedFlight(null)
    setTransferPath(null)
    setErrorType(null)
    setFlights([])

    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const flightResults = await searchFlights(selectedOrigin.code, selectedDestination.code, formattedDate)

      // Compute canBook for each flight and sort bookable flights first
      const flightsWithCanBook = flightResults.map(flight => ({
        ...flight,
        canBook: canBook(flight, userPoints)
      }));
      const sortedFlights = flightsWithCanBook.sort((a, b) => Number(b.canBook) - Number(a.canBook));
      setFlights(sortedFlights);
      if (sortedFlights.length === 0) {
        setErrorType("no-flights");
      }
    } catch (error) {
      console.error("Error searching flights:", error)
      setErrorType("no-flights")
    } finally {
      setIsSearching(false)
    }
  }

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
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <AirportCombobox
                  label="Origin"
                  selected={selectedOrigin}
                  onChange={setSelectedOrigin}
                  placeholder="Type city, code, or country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <AirportCombobox
                  label="Destination"
                  selected={selectedDestination}
                  onChange={setSelectedDestination}
                  excludeCode={selectedOrigin?.code}
                  placeholder="Type city, code, or country"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="block">Travel Date</Label>
                <Calendar
                  selected={date || null}
                  onChange={(d: Date | null) => setDate(d ?? undefined)}
                  placeholderText="Pick a date"
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()} // Only allow dates from today onward
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-program">Source Points Program</Label>
                {/* Fixed dropdown implementation */}
                {isLoadingPrograms ? (
                  <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading programs...</span>
                  </div>
                ) : (
                  <Select value={sourceProgram === "" ? "" : String(sourceProgram)} onValueChange={(e) => setSourceProgram(e === "" ? "" : Number(e))}>
                    <SelectTrigger id="source-program">
                      <SelectValue placeholder="Select your points program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.length > 0 ? (
                        programs.map((program) => (
                          <SelectItem key={program.id} value={String(program.id)}>
                            {program.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-programs" disabled>
                          No programs available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Points Balances Section */}
            <PointsBalance
              programs={programs}
              userPoints={userPoints}
              error={pointsError || undefined}
              onChange={(programId, value) =>
                setUserPoints((prev) => ({ ...prev, [programId]: value }))
              }
            />

            <div className="space-y-2">
              <Label>Optimization Mode</Label>
              <RadioGroup
                defaultValue="value"
                className="flex flex-wrap gap-4"
                value={optimizationMode}
                onValueChange={setOptimizationMode}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="value" id="value" />
                  <Label htmlFor="value">Best Value</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="time" id="time" />
                  <Label htmlFor="time">Fastest Transfer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hops" id="hops" />
                  <Label htmlFor="hops">Fewest Steps</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSearch}
            disabled={isSearching || !selectedOrigin?.code || !selectedDestination?.code || !date || !sourceProgram}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Award Flights
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {searchPerformed && (
        <>
          {flights.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Flights</CardTitle>
                    <CardDescription>Select a flight to see transfer options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FlightList
                      flights={flights}
                      selectedFlightId={selectedFlight?.id ?? null}
                      onSelect={handleFlightSelect}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {selectedFlight ? (
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
                          origin={selectedOrigin?.city || ""}
                          destination={selectedDestination?.city || ""}
                          date={date}
                          onRetry={handleRetry}
                        />
                      ) : (
                        <TransferPathStepper path={transferPath} />
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <p>Select a flight to see transfer options</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            !isSearching && (
              <EmptyState
                errorType={errorType}
                origin={selectedOrigin?.city || ""}
                destination={selectedDestination?.city || ""}
                date={date}
                onRetry={handleRetry}
              />
            )
          )}
        </>
      )}
    </div>
  )
}
