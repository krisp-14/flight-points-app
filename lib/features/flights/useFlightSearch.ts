import { useState } from 'react';
import { format } from 'date-fns';
import { searchItineraries, findTransferPath } from '../../shared/api';
import type { Flight, Itinerary } from '../../database/supabase';
import { DATABASE_DATE_FORMAT } from '../../core/constants';
import { getBookableProgramsForItinerary } from '../../database/logic/itineraryBookability';

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

  const selectItinerary = async (
    itinerary: Itinerary,
    sourceProgram: number,
    optimizationMode: string,
    userPoints: { [programId: number]: number }
  ) => {
    setSelectedItinerary(itinerary);
    setTransferPath(null);
    setErrorType(null);
    setIsFindingPath(true);

    try {
      // Get all programs that can book this entire itinerary
      const bookablePrograms = getBookableProgramsForItinerary(itinerary, userPoints);

      console.log("Itinerary selection debug:", {
        sourceProgram,
        sourceProgramNumber: Number(sourceProgram),
        bookablePrograms,
        userPoints
      });

      // Filter to only programs where user has enough points
      const affordablePrograms = bookablePrograms.filter(bp => bp.canBook);

      // Filter to programs where user doesn't have enough points
      const unaffordablePrograms = bookablePrograms.filter(bp => !bp.canBook);

      console.log("Affordability breakdown:", {
        affordablePrograms,
        unaffordablePrograms,
        canAffordWithSource: affordablePrograms.some(bp => bp.program_id === Number(sourceProgram))
      });

      // Check if user can afford with their source program
      const canAffordWithSource = affordablePrograms.some(
        bp => bp.program_id === Number(sourceProgram)
      );

      // If user can already book with their source program, return empty path
      if (canAffordWithSource) {
        console.log("User can afford with source program - no transfers needed");
        setTransferPath([]);
        setIsFindingPath(false);
        return;
      }

      // Get target programs - exclude source program if user can't afford with it
      let targetProgramIds: number[];

      if (affordablePrograms.length > 0) {
        // If there are affordable programs, use those
        targetProgramIds = affordablePrograms.map(bp => bp.program_id);
      } else {
        // If no affordable programs, use unaffordable ones
        // BUT exclude the source program since we know user can't afford with it
        targetProgramIds = unaffordablePrograms
          .filter(bp => bp.program_id !== Number(sourceProgram))
          .map(bp => bp.program_id);
      }

      if (targetProgramIds.length === 0) {
        console.log("No target programs available (excluding unaffordable source program)");
        setErrorType("no-path");
        setIsFindingPath(false);
        return;
      }

      console.log("Finding transfer path to:", targetProgramIds);

      const result = await findTransferPath(
        Number(sourceProgram),
        targetProgramIds,
        optimizationMode,
        userPoints
      );

      console.log("Transfer path result:", result);

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
    selectItinerary,
    retry,
    resetSearch
  };
}