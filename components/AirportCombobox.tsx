import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { supabase } from "@/lib/database/supabase"; // Adjust path as needed
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
    setLoading(true);
    setError(null);
    supabase
      .from("airports")
      .select("code, city, country")
      .or(
        `city.ilike.%${debouncedQuery}%,code.ilike.%${debouncedQuery}%,country.ilike.%${debouncedQuery}%`
      )
      .then(({ data, error }) => {
        if (error) {
          setError("Failed to load airports.");
          setOptions([]);
        } else {
          let filtered: Airport[] =
            (data || []).map((airport) => ({
              code: String(airport.code),
              city: String(airport.city),
              country: String(airport.country),
            }));
          if (excludeCode) {
            filtered = filtered.filter((airport) => airport.code !== excludeCode);
          }
          setOptions(filtered);
        }
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
    <div className="mb-6">
      <label className="block mb-1 font-medium">{label}</label>
      <Combobox value={selected} onChange={handleChange}>
        <div className="relative">
          <Combobox.Input
            className="w-full border rounded px-3 py-2"
            onChange={(e) => setQuery(e.target.value)}
            displayValue={displayAirport}
            placeholder={placeholder}
          />
          <Combobox.Options className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto">
            {loading && (
              <div className="px-3 py-2 text-gray-500">Loading...</div>
            )}
            {error && (
              <div className="px-3 py-2 text-red-500">{error}</div>
            )}
            {!loading &&
              !error &&
              debouncedQuery.length >= minQueryLength &&
              options.length === 0 && (
                <div className="px-3 py-2 text-gray-500">No results</div>
              )}
            {options.map((airport) => (
              <Combobox.Option
                key={airport.code}
                value={airport}
                className={({ active }) =>
                  `px-3 py-2 cursor-pointer ${active ? "bg-blue-100" : ""}`
                }
              >
                {displayAirport(airport)}
              </Combobox.Option>
            ))}
            {debouncedQuery.length < minQueryLength && (
              <div className="px-3 py-2 text-gray-400">
                Type at least {minQueryLength} letters to search
              </div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};
