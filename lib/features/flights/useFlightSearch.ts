import { useState } from 'react';
import { format } from 'date-fns';
import { searchItineraries, findTransferPath } from '../../shared/api';
import type { Flight, Itinerary } from '../../database/supabase';
import { DATABASE_DATE_FORMAT } from '../../core/constants';

export function useFlightSearch() {
  // Search state
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [transferPath, setTransferPath] = useState<any>(null);
  
  // UI state
  const [isSearching, setIsSearching] = useState(false);
  const [isFindingPath, setIsFindingPath] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [errorType, setErrorType] = useState<"no-flights" | "no-path" | null>(null);

  const searchForItineraries = async (
    originCode: string, 
    destinationCode: string, 
    date: Date
  ) => {
    setIsSearching(true);
    setSearchPerformed(true);
    setSelectedItinerary(null);
    setTransferPath(null);
    setErrorType(null);
    setItineraries([]);
    
    try {
      const formattedDate = format(date, DATABASE_DATE_FORMAT);
      const itineraryResults = await searchItineraries(originCode, destinationCode, formattedDate);
      
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

  const selectFlight = async (
    flight: Flight, 
    sourceProgram: number, 
    optimizationMode: string,
    userPoints: { [programId: number]: number }
  ) => {
    setSelectedFlight(flight);
    setTransferPath(null);
    setErrorType(null);
    setIsFindingPath(true);

    try {
      const targetProgramIds = (flight.bookable_options || []).map(opt => opt.program_id);
      const result = await findTransferPath(
        Number(sourceProgram),
        targetProgramIds,
        optimizationMode,
        userPoints
      );
      setTransferPath(result.path);
      if (result.errorType) {
        setErrorType(result.errorType);
      }
    } catch (error) {
      console.error("Error finding transfer path:", error);
      setErrorType("no-path");
    } finally {
      setIsFindingPath(false);
    }
  };

  const retry = () => {
    setSearchPerformed(false);
    setErrorType(null);
    setSelectedFlight(null);
    setSelectedItinerary(null);
    setTransferPath(null);
    setItineraries([]);
  };

  const resetSearch = () => {
    setItineraries([]);
    setSelectedItinerary(null);
    setFlights([]);
    setSelectedFlight(null);
    setTransferPath(null);
    setIsSearching(false);
    setIsFindingPath(false);
    setSearchPerformed(false);
    setErrorType(null);
  };

  return {
    // State
    itineraries,
    selectedItinerary,
    flights,
    selectedFlight,
    transferPath,
    isSearching,
    isFindingPath,
    searchPerformed,
    errorType,
    // Setters
    setSelectedItinerary,
    setErrorType,
    // Actions
    searchForItineraries,
    selectFlight,
    retry,
    resetSearch
  };
}