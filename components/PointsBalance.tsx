import React, { useState } from "react";
import type { Program } from "@/lib/database/supabase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PointsBalanceProps {
  programs: Program[];
  userPoints: { [programId: number]: number };
  onChange: (programId: number, value: number) => void;
  error?: string;
}

export const PointsBalance: React.FC<PointsBalanceProps> = ({ programs, userPoints, onChange, error }) => {
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  
  if (!programs || programs.length === 0) return null;

  const formatDisplayValue = (value: number, programId: number) => {
    // If this input is focused, show raw number for editing
    if (focusedInput === programId) {
      return value || "";
    }
    // Otherwise show formatted number with commas
    return value ? value.toLocaleString() : "";
  };
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Your Points Balances</h2>
      {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => (
          <div key={program.id} className="flex items-center space-x-2">
            <Label htmlFor={`points-${program.id}`} className="w-40">{program.name}</Label>
            <Input
              id={`points-${program.id}`}
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatDisplayValue(userPoints[program.id] || 0, program.id)}
              onFocus={() => setFocusedInput(program.id)}
              onBlur={() => setFocusedInput(null)}
              onChange={(e) => {
                const inputValue = e.target.value;
                
                // Remove any non-digit characters (commas, spaces, etc.)
                const cleanValue = inputValue.replace(/\D/g, '');
                
                // Convert to number and update
                const numValue = cleanValue === "" ? 0 : parseInt(cleanValue, 10);
                onChange(program.id, numValue);
              }}
              onKeyDown={(e) => {
                // Allow navigation and control keys
                const allowedKeys = [
                  'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                
                if (allowedKeys.includes(e.key)) {
                  return;
                }
                
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, etc.
                if (e.ctrlKey || e.metaKey) {
                  return;
                }
                
                // Only allow digits
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="w-32"
            />
          </div>
        ))}
      </div>
    </div>
  );
}; 