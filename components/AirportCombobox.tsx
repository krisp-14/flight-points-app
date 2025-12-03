import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { supabase } from "@/lib/database/supabase";
import type { Airport } from "@/lib/core/types";

type AirportComboboxProps = {
  label: string;
  selected: Airport | null;
  onChange: (airport: Airport | null) => void;
  excludeCode?: string;
  placeholder?: string;
  minQueryLength?: number;
  debounceMs?: number;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Simple in-memory cache for airport searches
const airportCache = new Map<string, Airport[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

// Fallback list for when Supabase is unavailable
const FALLBACK_AIRPORTS: Airport[] = [
  { code: "YYZ", city: "Toronto", country: "Canada" },
  { code: "YVR", city: "Vancouver", country: "Canada" },
  { code: "JFK", city: "New York", country: "USA" },
  { code: "LAX", city: "Los Angeles", country: "USA" },
  { code: "SFO", city: "San Francisco", country: "USA" },
  { code: "LHR", city: "London Heathrow", country: "United Kingdom" },
  { code: "CDG", city: "Paris Charles de Gaulle", country: "France" },
  { code: "FRA", city: "Frankfurt", country: "Germany" },
  { code: "NRT", city: "Tokyo Narita", country: "Japan" },
  { code: "HND", city: "Tokyo Haneda", country: "Japan" },
  { code: "HKG", city: "Hong Kong", country: "China" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "SYD", city: "Sydney", country: "Australia" },
];

export const AirportCombobox: React.FC<AirportComboboxProps> = ({
  label,
  selected,
  onChange,
  excludeCode,
  placeholder = "Type city, code, or country",
  minQueryLength = 2,
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (debouncedQuery.length < minQueryLength) {
      setOptions([]);
      setError(null);
      return;
    }

    // Check cache first
    const cacheKey = `${debouncedQuery.toLowerCase()}-${excludeCode || ''}`;
    const cachedTime = cacheTimestamps.get(cacheKey);
    const now = Date.now();

    if (cachedTime && now - cachedTime < CACHE_DURATION && airportCache.has(cacheKey)) {
      setOptions(airportCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    supabase
      .from("airports")
      .select("code, city, country")
      .or(
        `city.ilike.%${debouncedQuery}%,code.ilike.%${debouncedQuery}%,country.ilike.%${debouncedQuery}%`
      )
      .then(({ data, error }) => {
        if (error || !data) {
          // Graceful fallback to a small local list
          const fallbackFiltered = FALLBACK_AIRPORTS.filter((airport) =>
            `${airport.city} ${airport.code} ${airport.country}`
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
          ).filter((airport) => (excludeCode ? airport.code !== excludeCode : true));

          setError("Failed to load airports from database. Showing a limited list.");
          setOptions(fallbackFiltered);
        } else {
          let filtered: Airport[] =
            data.map((airport) => ({
              code: String(airport.code),
              city: String(airport.city),
              country: String(airport.country),
            })) || [];
          if (excludeCode) {
            filtered = filtered.filter((airport) => airport.code !== excludeCode);
          }

          // Cache the results
          airportCache.set(cacheKey, filtered);
          cacheTimestamps.set(cacheKey, now);
          setOptions(filtered);
        }
        setLoading(false);
      })
      .catch(() => {
        const fallbackFiltered = FALLBACK_AIRPORTS.filter((airport) =>
          `${airport.city} ${airport.code} ${airport.country}`
            .toLowerCase()
            .includes(debouncedQuery.toLowerCase())
        ).filter((airport) => (excludeCode ? airport.code !== excludeCode : true));
        setError("Failed to load airports from database. Showing a limited list.");
        setOptions(fallbackFiltered);
        setLoading(false);
      });
  }, [debouncedQuery, excludeCode, minQueryLength]);

  const displayAirport = (airport: Airport | null) =>
    airport ? `${airport.city} (${airport.code}), ${airport.country}` : "";

  // Reset query after selection
  const handleChange = (airport: Airport | null) => {
    onChange(airport);
    setQuery("");
  };

  return (
    <div className={label ? "mb-6" : ""}>
      {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
      <Combobox value={selected} onChange={handleChange}>
        <div className="relative">
          <Combobox.Input
            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => setQuery(e.target.value)}
            displayValue={displayAirport}
            placeholder={placeholder}
          />
          <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
            )}
            {error && (
              <div className="px-3 py-2 text-sm text-red-600 bg-red-50">{error}</div>
            )}
            {!loading &&
              !error &&
              debouncedQuery.length >= minQueryLength &&
              options.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
              )}
            {options.map((airport) => (
              <Combobox.Option
                key={airport.code}
                value={airport}
                className={({ active }) =>
                  `px-3 py-2 cursor-pointer text-sm transition-colors ${
                    active 
                      ? "bg-orange-50 text-orange-900" 
                      : "text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{airport.code}</span>
                  <span className="text-gray-600">{airport.city}, {airport.country}</span>
                </div>
              </Combobox.Option>
            ))}
            {debouncedQuery.length < minQueryLength && (
              <div className="px-3 py-2 text-sm text-gray-400">
                Type at least {minQueryLength} letters to search
              </div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};
