'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar as CalendarIcon, Search, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AirportCombobox } from '@/components/AirportCombobox';
import type { Airport } from '@/lib/core/types';
import type { SearchParams } from '@/types';
import { cn } from '@/lib/shared/utils';
import { getAvailableRoutes } from '@/app/actions';

interface SearchFormProps {
  compact?: boolean;
  onSearch?: (params: SearchParams) => void;
  simplified?: boolean; // New prop for simplified version
}

export function SearchForm({ compact = false, onSearch, simplified = false }: SearchFormProps) {
  const router = useRouter();
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<'economy' | 'premium-economy' | 'business' | 'first'>('economy');
  const [searchWithPoints, setSearchWithPoints] = useState(true);
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  
  // For simplified version: track available routes and validation
  const [availableRoutes, setAvailableRoutes] = useState<Array<{ origin: string; destination: string }>>([]);
  const [routeValidationError, setRouteValidationError] = useState<string | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Load available routes for validation (simplified version only)
  useEffect(() => {
    if (simplified) {
      setIsLoadingRoutes(true);
      getAvailableRoutes()
        .then((routes) => {
          setAvailableRoutes(routes.map(r => ({ origin: r.origin, destination: r.destination })));
          setIsLoadingRoutes(false);
        })
        .catch((error) => {
          console.error('Error loading available routes:', error);
          setIsLoadingRoutes(false);
        });
    }
  }, [simplified]);

  // Validate route exists in database (simplified version)
  const validateRoute = (originCode: string, destinationCode: string): boolean => {
    if (!simplified) return true; // Skip validation for full form
    
    const routeExists = availableRoutes.some(
      route => route.origin === originCode && route.destination === destinationCode
    );
    
    if (!routeExists && originCode && destinationCode) {
      setRouteValidationError(`Route ${originCode} → ${destinationCode} not available in our database`);
      return false;
    }
    
    setRouteValidationError(null);
    return true;
  };

  // Update validation when origin/destination changes (simplified version)
  useEffect(() => {
    if (simplified && origin && destination) {
      validateRoute(origin.code, destination.code);
    } else {
      setRouteValidationError(null);
    }
  }, [origin, destination, simplified]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin || !destination || !departureDate) {
      return;
    }

    // Validate route exists (simplified version)
    if (simplified && !validateRoute(origin.code, destination.code)) {
      return;
    }

    const searchParams: SearchParams = {
      origin: origin.code,
      destination: destination.code,
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
      passengers: simplified ? 1 : passengers, // Default to 1 for simplified
      cabinClass: simplified ? 'economy' : cabinClass, // Default to economy for simplified
      tripType: simplified ? 'round-trip' : tripType, // Default to round-trip for simplified
      searchWithPoints,
    };

    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Navigate to search results page
      const queryParams = new URLSearchParams({
        from: searchParams.origin,
        to: searchParams.destination,
        date: searchParams.departureDate,
        passengers: searchParams.passengers.toString(),
        cabin: searchParams.cabinClass,
        type: searchParams.tripType,
      });

      if (searchParams.returnDate) {
        queryParams.set('return', searchParams.returnDate);
      }

      router.push(`/search?${queryParams.toString()}`);
    }
  };

  const canSearch = origin && destination && departureDate && (!simplified || !routeValidationError);

  // Simplified version for homepage
  if (simplified) {
    return (
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main search fields */}
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_auto]">
            {/* From */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <Label htmlFor="origin-simple">From</Label>
              </div>
              <AirportCombobox
                label=""
                selected={origin}
                onChange={setOrigin}
                placeholder="Origin airport"
              />
            </div>

            {/* Swap Button */}
            <div className="flex items-end pb-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-orange-50"
                onClick={() => {
                  const temp = origin;
                  setOrigin(destination);
                  setDestination(temp);
                }}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* To */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <Label htmlFor="destination-simple">To</Label>
              </div>
              <AirportCombobox
                label=""
                selected={destination}
                onChange={setDestination}
                excludeCode={origin?.code}
                placeholder="Destination airport"
              />
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-600" />
                <Label htmlFor="departure-simple">Date</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="departure-simple"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal focus:ring-2 focus:ring-orange-500',
                      !departureDate && 'text-muted-foreground'
                    )}
                  >
                    {departureDate ? format(departureDate, 'MMM d, yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={!canSearch || isLoadingRoutes}
                className="h-10 bg-orange-600 px-8 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Route validation error */}
          {routeValidationError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {routeValidationError}.{' '}
              <Link href="/explore" className="font-medium underline hover:text-red-900">
                View available routes
              </Link>
            </div>
          )}

          {/* Browse all routes link */}
          <div className="pt-2 text-center">
            <Link 
              href="/explore" 
              className="text-sm text-gray-600 hover:text-orange-600 transition-colors underline"
            >
              Browse all available routes
            </Link>
          </div>
        </form>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <AirportCombobox
              label="From"
              selected={origin}
              onChange={setOrigin}
              placeholder="Origin"
            />
          </div>
          <div className="flex-1">
            <AirportCombobox
              label="To"
              selected={destination}
              onChange={setDestination}
              excludeCode={origin?.code}
              placeholder="Destination"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="departure-compact">Departure</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="departure-compact"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal focus:ring-2 focus:ring-orange-500',
                    !departureDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            type="submit"
            disabled={!canSearch}
            className="bg-orange-600 px-8 hover:bg-orange-700"
          >
            <Search className="mr-2 h-4 w-4" />
            Explore
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Row: Trip Type, Passengers, Cabin, Search with Points */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="trip-type">Trip type</Label>
            <Select value={tripType} onValueChange={(value: any) => setTripType(value)}>
              <SelectTrigger id="trip-type" className="focus:ring-2 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-way">One-way</SelectItem>
                <SelectItem value="round-trip">Round-trip</SelectItem>
                <SelectItem value="multi-city">Multi-city</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="passengers">Passengers</Label>
            <Select value={passengers.toString()} onValueChange={(value) => setPassengers(parseInt(value))}>
              <SelectTrigger id="passengers" className="focus:ring-2 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'passenger' : 'passengers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="cabin-class">Cabin class</Label>
            <Select value={cabinClass} onValueChange={(value: any) => setCabinClass(value)}>
              <SelectTrigger id="cabin-class" className="focus:ring-2 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="premium-economy">Premium Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="search-points"
              checked={searchWithPoints}
              onCheckedChange={(checked) => setSearchWithPoints(checked as boolean)}
            />
            <Label htmlFor="search-points" className="cursor-pointer font-normal">
              Search with my points
            </Label>
          </div>
        </div>

        {/* Main Grid: From, To, Departure, Search */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_auto]">
          {/* From */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <Label htmlFor="origin">From</Label>
            </div>
            <AirportCombobox
              label=""
              selected={origin}
              onChange={setOrigin}
              placeholder="Origin airport"
            />
          </div>

          {/* Swap Button */}
          <div className="flex items-end pb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-orange-50"
              onClick={() => {
                const temp = origin;
                setOrigin(destination);
                setDestination(temp);
              }}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <Label htmlFor="destination">To</Label>
            </div>
            <AirportCombobox
              label=""
              selected={destination}
              onChange={setDestination}
              excludeCode={origin?.code}
              placeholder="Destination airport"
            />
          </div>

          {/* Departure Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-600" />
              <Label htmlFor="departure">Departure</Label>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="departure"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal focus:ring-2 focus:ring-orange-500',
                    !departureDate && 'text-muted-foreground'
                  )}
                >
                  {departureDate ? format(departureDate, 'MMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={!canSearch}
              className="h-10 bg-orange-600 px-8 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Return Date (for round-trip) */}
        {tripType === 'round-trip' && (
          <div className="max-w-xs">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-600" />
              <Label htmlFor="return">Return</Label>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="return"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal focus:ring-2 focus:ring-orange-500',
                    !returnDate && 'text-muted-foreground'
                  )}
                >
                  {returnDate ? format(returnDate, 'MMM d, yyyy') : 'Select return date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus disabled={(date) => departureDate ? date < departureDate : false} />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </form>
    </div>
  );
}
