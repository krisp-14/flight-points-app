'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plane, ChevronDown } from 'lucide-react';
import { mockUser, navItems } from '@/data/mockData';
import { cn } from '@/lib/shared/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePointsManagement } from '@/lib/features/points/usePointsManagement';
import { useProgramsData } from '@/lib/features/programs/useProgramsData';
import { DEFAULT_USER_ID } from '@/lib/core/constants';
import type { Program } from '@/lib/database/supabase';

export function Header() {
  const pathname = usePathname();
  const { userPoints, updateUserPoints, pointsError } = usePointsManagement(DEFAULT_USER_ID);
  const { programs } = useProgramsData();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [localPoints, setLocalPoints] = useState<{ [programId: number]: number }>(userPoints);

  // Calculate total points
  const totalPoints = Object.values(userPoints).reduce((sum, pts) => sum + pts, 0);

  // Sync local state when userPoints prop changes
  useEffect(() => {
    setLocalPoints(userPoints);
  }, [userPoints]);

  const formatPoints = (points: number) => {
    return points.toLocaleString('en-US');
  };

  const getUserInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDisplayValue = (value: number, programId: number) => {
    if (focusedInput === programId) {
      return value || "";
    }
    return value ? value.toLocaleString() : "";
  };

  const handleProgramChange = (programId: number, value: number) => {
    const updated = { ...localPoints, [programId]: value };
    setLocalPoints(updated);
    updateUserPoints(programId, value);
  };


  const handleSave = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <Plane className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-semibold">pointsaway</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isHighlight = item.variant === 'highlight';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive && !isHighlight && 'text-black',
                  !isActive && !isHighlight && 'text-gray-600 hover:text-black',
                  isHighlight && 'text-orange-600 hover:text-orange-700'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* Points Display - Editable Popover */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button 
                type="button"
                onClick={() => setIsOpen(true)}
                className="hidden text-right md:flex md:flex-col md:items-end hover:bg-gray-50 active:bg-gray-100 rounded-lg px-3 py-2 transition-all cursor-pointer group border border-transparent hover:border-gray-200"
                aria-label="Edit your points"
                aria-expanded={isOpen}
              >
                <div className="text-xs text-gray-500">Your points</div>
                <div className="font-semibold flex items-center gap-1.5 group-hover:text-orange-600 transition-colors">
                  {programs.length > 0 ? formatPoints(totalPoints) : formatPoints(mockUser.totalPoints)}
                  <ChevronDown className={`h-3 w-3 text-gray-400 group-hover:text-orange-600 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-6" align="end">
              {programs.length > 0 ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit Your Points</h3>
                    <p className="text-sm text-gray-500">Update your points balance</p>
                  </div>

                  {/* Error Display */}
                  {pointsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{pointsError}</p>
                    </div>
                  )}

                  {/* Total Points Display */}
                  <div className="space-y-2">
                    <Label htmlFor="header-total-points" className="text-sm font-medium text-gray-700">
                      Total Points
                    </Label>
                    <Input
                      id="header-total-points"
                      type="text"
                      readOnly
                      value={Object.values(localPoints).reduce((sum, pts) => sum + pts, 0).toLocaleString()}
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
                            htmlFor={`header-points-${program.id}`} 
                            className="flex-1 text-sm text-gray-600 min-w-0"
                          >
                            {program.name}
                          </Label>
                          <Input
                            id={`header-points-${program.id}`}
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
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit Your Points</h3>
                    <p className="text-sm text-gray-500">Loading programs...</p>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Please wait while we load your loyalty programs.</p>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white font-semibold">
            {getUserInitial(mockUser.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
