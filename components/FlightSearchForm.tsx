import React from "react";
import type { Airport } from "@/lib/core/types";
import type { Program } from "@/lib/database/supabase";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { AirportCombobox } from "@/components/AirportCombobox";

interface FlightSearchFormProps {
  origin: Airport | null;
  destination: Airport | null;
  date: Date | undefined;
  sourceProgram: number | "";
  optimizationMode: string;
  onOriginChange: (airport: Airport | null) => void;
  onDestinationChange: (airport: Airport | null) => void;
  onDateChange: (date: Date | null) => void;
  onSourceProgramChange: (id: number | "") => void;
  onOptimizationModeChange: (mode: string) => void;
  onSearch: () => void;
  isLoadingPrograms: boolean;
  programs: Program[];
  isSearching: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = React.memo(({
  origin,
  destination,
  date,
  sourceProgram,
  optimizationMode,
  onOriginChange,
  onDestinationChange,
  onDateChange,
  onSourceProgramChange,
  onOptimizationModeChange,
  onSearch,
  isLoadingPrograms,
  programs,
  isSearching,
}) => {
  const canSearch = !!origin && !!destination && !!date && !!sourceProgram;
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <AirportCombobox
            label="Origin"
            selected={origin}
            onChange={onOriginChange}
            placeholder="Type city, code, or country"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <AirportCombobox
            label="Destination"
            selected={destination}
            onChange={onDestinationChange}
            excludeCode={origin?.code}
            placeholder="Type city, code, or country"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="block">Travel Date</Label>
          <Calendar
            selected={date || null}
            onChange={onDateChange}
            placeholderText="Pick a date"
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source-program">Source Points Program</Label>
          {isLoadingPrograms ? (
            <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">Loading programs...</span>
            </div>
          ) : (
            <Select value={sourceProgram === "" ? "" : String(sourceProgram)} onValueChange={(e) => onSourceProgramChange(e === "" ? "" : Number(e))}>
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
      <div className="space-y-2">
        <Label>Optimization Mode</Label>
        <RadioGroup
          defaultValue="value"
          className="flex flex-wrap gap-4"
          value={optimizationMode}
          onValueChange={onOptimizationModeChange}
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
      <Button
        className="w-full"
        onClick={onSearch}
        disabled={isSearching || !canSearch}
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
    </div>
  );
});