'use client';

import React, { useState, useEffect } from "react";
import type { Program } from "@/lib/database/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/shared/utils";

interface PointsBalanceProps {
  programs: Program[];
  userPoints: { [programId: number]: number };
  onChange: (programId: number, value: number) => void;
  error?: string;
}

export const PointsBalance: React.FC<PointsBalanceProps> = ({ programs, userPoints, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [localPoints, setLocalPoints] = useState<{ [programId: number]: number }>(userPoints);

  // Sync local state when userPoints prop changes
  useEffect(() => {
    setLocalPoints(userPoints);
  }, [userPoints]);

  // Calculate total points dynamically from localPoints (updates in real-time as user edits)
  const totalPoints = Object.values(localPoints).reduce((sum, pts) => sum + pts, 0);

  // Early return after all hooks
  if (!programs || programs.length === 0) return null;

  const formatDisplayValue = (value: number, programId: number) => {
    // If this input is focused, show raw number for editing
    if (focusedInput === programId) {
      return value || "";
    }
    // Otherwise show formatted number with commas
    return value ? value.toLocaleString() : "";
  };

  const handleProgramChange = (programId: number, value: number) => {
    const updated = { ...localPoints, [programId]: value };
    setLocalPoints(updated);
    onChange(programId, value);
  };


  const handleSave = () => {
    // All changes are already applied via onChange, just close the popover
    setIsOpen(false);
  };

  return (
    <div className="mb-8">
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
        >
          <div className="text-left">
            <div className="text-xs text-gray-500 mb-1">Your points</div>
            <div className="text-2xl font-semibold text-gray-900">
              {totalPoints.toLocaleString()}
            </div>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit Your Points</h3>
                <p className="text-sm text-gray-500">Update your points balance</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Total Points Display (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="total-points" className="text-sm font-medium text-gray-700">
                  Total Points
                </Label>
                <Input
                  id="total-points"
                  type="text"
                  readOnly
                  value={totalPoints.toLocaleString()}
                  className="text-lg font-semibold bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Individual Program Inputs */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">By Program</Label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {programs.map((program) => (
                    <div key={program.id} className="flex items-center gap-3">
                      <Label 
                        htmlFor={`points-${program.id}`} 
                        className="flex-1 text-sm text-gray-600 min-w-0"
                      >
                        {program.name}
                      </Label>
                      <Input
                        id={`points-${program.id}`}
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={formatDisplayValue(localPoints[program.id] || 0, program.id)}
                        onFocus={() => setFocusedInput(program.id)}
                        onBlur={() => setFocusedInput(null)}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const cleanValue = inputValue.replace(/\D/g, '');
                          const numValue = cleanValue === "" ? 0 : parseInt(cleanValue, 10);
                          handleProgramChange(program.id, numValue);
                        }}
                        className="w-32 text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <Button onClick={handleSave} className="min-w-20">
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
