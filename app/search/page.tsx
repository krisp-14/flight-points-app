'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { SearchForm } from '@/components/SearchForm';
import { ItineraryCard } from '@/components/ItineraryCard';
import { TransferPathPanel } from '@/components/TransferPathPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DEFAULT_OPTIMIZATION_MODE, DEFAULT_USER_ID } from '@/lib/core/constants';
import type { SearchParams as SearchParamsType } from '@/types';
import type { Itinerary, Flight } from '@/lib/database/supabase';
import { useFlightSearch } from '@/lib/features/flights/useFlightSearch';
import { useProgramsData } from '@/lib/features/programs/useProgramsData';
import { usePointsManagement } from '@/lib/features/points/usePointsManagement';
import { EmptyState } from '@/components/empty-state';
import { cn, formatFlightTimeDisplay, formatFlightDuration, getTimezoneForAirport } from '@/lib/shared/utils';
import { toast } from '@/components/ui/use-toast';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isEditingSearch, setIsEditingSearch] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState<string>('');
  const [editingDate, setEditingDate] = useState<Date | undefined>(undefined);
  const [sourceProgram, setSourceProgram] = useState<number | ''>('');
  const [optimizationMode, setOptimizationMode] = useState(DEFAULT_OPTIMIZATION_MODE);
  const [recentSearches, setRecentSearches] = useState<Array<{
    id: string;
    origin: string;
    destination: string;
    date: string;
    timestamp: string;
    resultCount: number;
  }>>([]);

  const { programs, isLoadingPrograms } = useProgramsData();
  const { userPoints, updateUserPoints, pointsError } = usePointsManagement(DEFAULT_USER_ID);
  const {
    itineraries,
    selectedItinerary,
    flights,
    selectedFlight,
    transferPath,
    isSearching,
    isFindingPath,
    searchPerformed,
    errorType,
    setSelectedItinerary,
    searchForItineraries,
    selectItinerary,
    selectFlight,
    retry,
  } = useFlightSearch();

  const searchForItinerariesRef = useRef(searchForItineraries);
  const selectItineraryRef = useRef(selectItinerary);
  const selectFlightRef = useRef(selectFlight);

  useEffect(() => {
    searchForItinerariesRef.current = searchForItineraries;
  }, [searchForItineraries]);

  useEffect(() => {
    selectItineraryRef.current = selectItinerary;
  }, [selectItinerary]);
  useEffect(() => {
    selectFlightRef.current = selectFlight;
  }, [selectFlight]);

  // Hydrate page from URL params (e.g., /search?from=YYZ&to=LHR&date=2025-08-29)
  useEffect(() => {
    const from = searchParams.get('from') || searchParams.get('origin');
    const to = searchParams.get('to') || searchParams.get('destination');
    const dateParam = searchParams.get('date') || searchParams.get('departureDate');

    if (from && to && dateParam) {
      setOrigin(from);
      setDestination(to);
      setTravelDate(dateParam);

      // Parse date as YYYY-MM-DD to avoid timezone issues
      // Create date at noon local time to avoid timezone shifts
      const [year, month, day] = dateParam.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day, 12, 0, 0);
      if (!Number.isNaN(parsedDate.getTime())) {
        searchForItinerariesRef.current(from, to, parsedDate);
      }
    }
  }, [searchParams]);

  // Default source program once programs load
  useEffect(() => {
    if (!sourceProgram && programs.length > 0) {
      setSourceProgram(programs[0].id);
    }
  }, [programs, sourceProgram]);

  // Recalculate transfer path when settings change
  useEffect(() => {
    if (selectedItinerary && sourceProgram) {
      selectItineraryRef.current(selectedItinerary, Number(sourceProgram), optimizationMode, userPoints);
    } else if (selectedFlight && sourceProgram) {
      selectFlightRef.current(selectedFlight, Number(sourceProgram), optimizationMode, userPoints);
    }
  }, [selectedItinerary, selectedFlight, sourceProgram, optimizationMode, userPoints]);

  const formattedDate = useMemo(() => {
    if (!travelDate) return '';
    const parsed = new Date(travelDate);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [travelDate]);

  const handleSearchSubmit = async (params: SearchParamsType) => {
    setIsEditingSearch(false);
    setOrigin(params.origin);
    setDestination(params.destination);
    setTravelDate(params.departureDate);

    const parsedDate = new Date(params.departureDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return;
    }

    await searchForItinerariesRef.current(params.origin, params.destination, parsedDate);

    const queryParams = new URLSearchParams({
      from: params.origin,
      to: params.destination,
      date: params.departureDate,
      passengers: params.passengers.toString(),
      cabin: params.cabinClass,
      type: params.tripType,
    });
    if (params.returnDate) {
      queryParams.set('return', params.returnDate);
    }
    router.replace(`/search?${queryParams.toString()}`);
  };

  const handleDateChange = async (date: Date | undefined) => {
    if (!date || !origin || !destination) return;
    
    setEditingDate(date);
    const dateString = format(date, 'yyyy-MM-dd');
    setTravelDate(dateString);
    setIsEditingSearch(false);

    // Show toast notification
    toast({
      title: "Refreshing results",
      description: `Searching for flights on ${format(date, 'MMM d, yyyy')}...`,
    });

    try {
      await searchForItinerariesRef.current(origin, destination, date);

      const queryParams = new URLSearchParams({
        from: origin,
        to: destination,
        date: dateString,
        passengers: '1',
        cabin: 'economy',
        type: 'round-trip',
      });
      router.replace(`/search?${queryParams.toString()}`);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to refresh results. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Initialize editing date when opening edit mode
  useEffect(() => {
    if (isEditingSearch && travelDate) {
      const parsed = new Date(travelDate);
      if (!Number.isNaN(parsed.getTime())) {
        setEditingDate(parsed);
      }
    }
  }, [isEditingSearch, travelDate]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentExploreSearches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  const formatSearchDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleItinerarySelect = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
  };

  const handleFlightSelect = (flight: Flight) => {
    selectFlightRef.current(flight, Number(sourceProgram), optimizationMode, userPoints);
  };

  const canCalculatePath = Boolean(sourceProgram);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Route</div>
              <div className="text-lg font-semibold">
                {origin && destination ? `${origin} → ${destination}` : 'Select a route'}
              </div>
              {formattedDate && (
                <div className="text-sm text-gray-600">Departing {formattedDate}</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => retry()}>
                Reset
              </Button>
              <Button variant="default" onClick={() => setIsEditingSearch((prev) => !prev)}>
                {isEditingSearch ? 'Close search' : 'Edit search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isEditingSearch && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Origin - Read Only */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">From</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-600">
                      {origin || 'Origin'}
                    </div>
                  </div>

                  {/* Destination - Read Only */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">To</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-600">
                      {destination || 'Destination'}
                    </div>
                  </div>

                  {/* Date - Editable */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-departure" className="text-sm font-medium text-gray-700">
                      Departure Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="edit-departure"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !editingDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editingDate ? format(editingDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editingDate}
                          onSelect={handleDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transfer preferences</CardTitle>
            <CardDescription>Choose the source program and optimization mode</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source-program">Source program</Label>
              {isLoadingPrograms ? (
                <div className="flex items-center space-x-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading programs...</span>
                </div>
              ) : (
                <Select
                  value={sourceProgram ? String(sourceProgram) : ''}
                  onValueChange={(value) => setSourceProgram(value ? Number(value) : '')}
                >
                  <SelectTrigger id="source-program">
                    <SelectValue placeholder="Select a source program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={String(program.id)}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Optimization mode</Label>
              <RadioGroup
                className="flex flex-wrap gap-4"
                value={optimizationMode}
                onValueChange={setOptimizationMode}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="value" id="opt-value" />
                  <Label htmlFor="opt-value">Best value</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="time" id="opt-time" />
                  <Label htmlFor="opt-time">Fastest transfer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hops" id="opt-hops" />
                  <Label htmlFor="opt-hops">Fewest steps</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Available itineraries</CardTitle>
              <CardDescription>Select an itinerary to view the optimal transfer path</CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching for itineraries...
                </div>
              )}

              {!isSearching && searchPerformed && itineraries.length === 0 && (
                <EmptyState
                  errorType={errorType}
                  origin={origin}
                  destination={destination}
                  date={travelDate ? new Date(travelDate) : undefined}
                  onRetry={() => {
                    if (origin && destination && travelDate) {
                      const parsedDate = new Date(travelDate);
                      if (!Number.isNaN(parsedDate.getTime())) {
                        searchForItinerariesRef.current(origin, destination, parsedDate);
                      }
                    }
                  }}
                />
              )}

              {itineraries.map((itinerary) => (
                <ItineraryCard
                  key={itinerary.itinerary_id}
                  itinerary={itinerary}
                  userPoints={userPoints}
                  onSelect={() => handleItinerarySelect(itinerary)}
                  selected={selectedItinerary?.itinerary_id === itinerary.itinerary_id}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Flight options</CardTitle>
              <CardDescription>Single-segment flights with bookable programs</CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching for flights...
                </div>
              )}
              {!isSearching && searchPerformed && flights.length === 0 && (
                <div className="py-4 text-sm text-muted-foreground">No flights found for this search.</div>
              )}
              {flights.map((flight) => {
                const originTimezone = getTimezoneForAirport(flight.origin_code);
                const destinationTimezone = getTimezoneForAirport(flight.destination_code);
                const departureDisplay = formatFlightTimeDisplay(flight.departure_time, originTimezone, true);
                const arrivalDisplay = formatFlightTimeDisplay(flight.arrival_time, destinationTimezone, true);
                const durationStr = formatFlightDuration(flight.departure_time, flight.arrival_time);
                const bookableOptions = (flight.bookable_options || []).filter((opt: any) => typeof opt.points_required === "number");

                return (
                  <Card
                    key={flight.id}
                    className={`mb-3 cursor-pointer transition-colors hover:bg-gray-50 ${selectedFlight?.id === flight.id ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}
                    onClick={() => handleFlightSelect(flight)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Route and Times */}
                        <div>
                          <div className="font-semibold text-lg mb-2">
                            {flight.origin_code} → {flight.destination_code}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Depart:</span>
                              <span>{departureDisplay}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Arrive:</span>
                              <span>{arrivalDisplay}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Duration:</span>
                              <span>{durationStr}</span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Options */}
                        {bookableOptions.length > 0 && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="text-xs font-medium text-gray-500 mb-1.5">Booking Options:</div>
                            <div className="flex flex-wrap gap-2">
                              {bookableOptions.map((opt: any, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium"
                                >
                                  {opt.points_required?.toLocaleString()} {opt.program_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>

          <div className="lg:col-span-1">
            <TransferPathPanel
              selectedItinerary={selectedItinerary || null}
              selectedFlight={selectedFlight || null}
              transferPath={canCalculatePath ? transferPath : null}
              isFindingPath={isFindingPath}
              errorType={errorType}
              origin={origin}
              destination={destination}
              date={travelDate ? new Date(travelDate) : undefined}
              onRetry={() => {
                if (selectedItinerary && sourceProgram) {
                  selectItineraryRef.current(
                    selectedItinerary,
                    Number(sourceProgram),
                    optimizationMode,
                    userPoints
                  );
                } else if (selectedFlight && sourceProgram) {
                  selectFlightRef.current(
                    selectedFlight,
                    Number(sourceProgram),
                    optimizationMode,
                    userPoints
                  );
                }
              }}
              optimizationMode={optimizationMode}
            />
          </div>
        </div>

        {/* Recent Searches from Explore */}
        {recentSearches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent searches</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSearches.map((search) => {
                  const queryParams = new URLSearchParams({
                    from: search.origin,
                    to: search.destination,
                    date: search.date,
                    passengers: '1',
                    cabin: 'economy',
                    type: 'round-trip',
                  });
                  return (
                    <Link
                      key={search.id}
                      href={`/search?${queryParams.toString()}`}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">
                          {search.origin} → {search.destination}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatSearchDate(search.date)} • {search.resultCount} {search.resultCount === 1 ? 'option' : 'options'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        View flights
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
