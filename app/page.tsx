"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TransferPathStepper } from "@/components/transfer-path-stepper"
import { EmptyState } from "@/components/empty-state"
import { FlightCard } from "@/components/flight-card"
import { getPrograms, searchFlights, findTransferPath } from "./actions"
import type { Program, Flight } from "@/lib/supabase"

export default function FlightPointsOptimizer() {
  // Form state
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState<Date>()
  const [sourceProgram, setSourceProgram] = useState<number | "">("")
  const [optimizationMode, setOptimizationMode] = useState("value")

  // Data state
  const [programs, setPrograms] = useState<Program[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [transferPath, setTransferPath] = useState<any>(null)

  // UI state
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isFindingPath, setIsFindingPath] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [errorType, setErrorType] = useState<"no-flights" | "no-path" | null>(null)
  const [dbError, setDbError] = useState<number | null>(null)

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

  const handleSearch = async () => {
    if (!origin || !destination || !date || !sourceProgram) return

    setIsSearching(true)
    setSearchPerformed(true)
    setSelectedFlight(null)
    setTransferPath(null)
    setErrorType(null)
    setFlights([])

    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const flightResults = await searchFlights(origin, destination, formattedDate)

      setFlights(flightResults)

      if (flightResults.length === 0) {
        setErrorType("no-flights")
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
      const result = await findTransferPath(sourceProgram, flight.bookable_programs, optimizationMode)

      setTransferPath(result.path)

      if (result.errorType) {
        setErrorType(result.errorType)
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
                <Input
                  id="origin"
                  placeholder="YYZ, YVR, etc."
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="LHR, CDG, etc."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Travel Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
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
                  <Select value={sourceProgram} onValueChange={(e) => setSourceProgram(Number(e))}>
                    <SelectTrigger id="source-program">
                      <SelectValue placeholder="Select your points program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.length > 0 ? (
                        programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
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
            disabled={isSearching || !origin || !destination || !date || !sourceProgram}
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
                    {flights.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        selected={selectedFlight?.id === flight.id}
                        onSelect={() => handleFlightSelect(flight)}
                      />
                    ))}
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
                          origin={origin}
                          destination={destination}
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
                origin={origin}
                destination={destination}
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
