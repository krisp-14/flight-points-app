import { useState } from 'react';
import type { Airport } from '../../core/types';
import { CITY_METADATA } from './route-data';
import { DEFAULT_OPTIMIZATION_MODE } from '../../core/constants';

export function useFormState() {
  // Form state
  const [selectedOrigin, setSelectedOrigin] = useState<Airport | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Airport | null>(null);
  const [date, setDate] = useState<Date>();
  const [sourceProgram, setSourceProgram] = useState<number | "">("");
  const [optimizationMode, setOptimizationMode] = useState(DEFAULT_OPTIMIZATION_MODE);

  // Route selection handler for RouteGrid integration
  const handleRouteSelect = (
    originCode: string, 
    destinationCode: string, 
    availableDates: Date[]
  ) => {
    // Set origin and destination
    const originCity = CITY_METADATA[originCode];
    const destinationCity = CITY_METADATA[destinationCode];
    
    if (originCity && destinationCity) {
      setSelectedOrigin({
        code: originCode,
        city: originCity.city,
        country: originCity.country
      });
      setSelectedDestination({
        code: destinationCode,
        city: destinationCity.city,
        country: destinationCity.country
      });
    }
    
    // Set the earliest available date
    if (availableDates.length > 0) {
      const earliestDate = availableDates.reduce((earliest, current) =>
        current < earliest ? current : earliest
      );
      setDate(earliestDate);
    }
  };

  const resetForm = () => {
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setDate(undefined);
    setSourceProgram("");
    setOptimizationMode(DEFAULT_OPTIMIZATION_MODE);
  };

  return {
    // State
    selectedOrigin,
    selectedDestination,
    date,
    sourceProgram,
    optimizationMode,
    // Setters
    setSelectedOrigin,
    setSelectedDestination,
    setDate,
    setSourceProgram,
    setOptimizationMode,
    // Handlers
    handleRouteSelect,
    resetForm,
    // Computed
    isFormValid: !!(selectedOrigin?.code && selectedDestination?.code && date)
  };
}