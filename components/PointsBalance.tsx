import React from "react";
import type { Program } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PointsBalanceProps {
  programs: Program[];
  userPoints: { [programId: number]: number };
  onChange: (programId: number, value: number) => void;
  error?: string;
}

export const PointsBalance: React.FC<PointsBalanceProps> = ({ programs, userPoints, onChange, error }) => {
  if (!programs || programs.length === 0) return null;
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
              type="number"
              min={0}
              placeholder="0"
              value={userPoints[program.id] ?? ""}
              onChange={(e) => {
                const val = Math.max(0, Math.floor(Number(e.target.value) || 0));
                onChange(program.id, val);
              }}
              className="w-32"
            />
          </div>
        ))}
      </div>
    </div>
  );
}; 