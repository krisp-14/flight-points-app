import { Check, Clock, ExternalLink, Percent, ArrowRight, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Program, Itinerary } from "@/lib/database/supabase"
import { calculateTransferWithBonus, calculateOptimalTransferAmount } from "@/lib/database/logic/findBestTransferPath"

type TransferPathStepperProps = {
  path:
    | {
        from: Program
        to: Program
        ratio: string
        transferTime: number
        bonusThreshold: number | null
        bonusAmount: number | null
        bonusApplies: boolean
      }[]
    | null
  itinerary: Itinerary | null
}

// Helper function to parse ratio string (e.g., "1:1" → {from: 1, to: 1})
function parseRatio(ratio: string): { from: number; to: number } {
  const parts = ratio.split(":").map(Number);
  return { from: parts[0] || 1, to: parts[1] || 1 };
}

// Helper function to get efficiency level for color coding
function getEfficiencyLevel(ratio: string): "excellent" | "good" | "poor" {
  const { from, to } = parseRatio(ratio);
  const efficiency = to / from;

  if (efficiency >= 1) return "excellent"; // 1:1 or better
  if (efficiency >= 0.75) return "good";   // 3:4, 4:5, etc.
  return "poor";                           // 2:1, 3:1, etc.
}

export function TransferPathStepper({ path, itinerary }: TransferPathStepperProps) {
  // If path is empty array, no transfer needed
  if (path && path.length === 0) {
    return (
      <div className="rounded-md border p-4 bg-green-50">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <p className="font-medium">No transfers needed!</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your points are already in a program that can book this flight directly.
        </p>
      </div>
    )
  }

  if (!path) return null

  // Get points needed for the final destination program
  const finalProgram = path[path.length - 1]?.to;
  let pointsNeeded = 0;

  if (itinerary && finalProgram) {
    // Find the points required for the final destination program across all segments
    for (const segment of itinerary.segments) {
      const option = segment.flight.bookable_options?.find(
        opt => opt.program_id === finalProgram.id
      );
      if (option) {
        pointsNeeded += option.points_required;
      }
    }
  }

  // Calculate points needed at each step (working backwards)
  // Use optimal transfer amounts that hit bonus thresholds
  const stepsWithPoints = path.map((step, index) => {
    // For the last step, we know the points needed
    if (index === path.length - 1) {
      // Use optimal transfer calculation that considers bonuses
      const optimalTransfer = calculateOptimalTransferAmount(
        pointsNeeded,
        step.ratio,
        step.bonusThreshold,
        step.bonusAmount,
        step.bonusApplies
      );
      
      // Calculate actual miles received including bonuses
      const actualMilesReceived = calculateTransferWithBonus(
        optimalTransfer,
        step.ratio,
        step.bonusThreshold,
        step.bonusAmount,
        step.bonusApplies
      );
      
      // Calculate base miles (without bonus)
      const { from: ratioFrom, to: ratioTo } = parseRatio(step.ratio);
      const baseMilesReceived = Math.floor((optimalTransfer / ratioFrom) * ratioTo);
      const bonusMilesReceived = actualMilesReceived - baseMilesReceived;
      
      return {
        ...step,
        pointsToTransfer: optimalTransfer,
        pointsReceived: actualMilesReceived,
        baseMilesReceived,
        bonusMilesReceived,
        efficiency: getEfficiencyLevel(step.ratio)
      };
    }
    // For earlier steps, calculate based on next step's needs
    return {
      ...step,
      pointsToTransfer: 0,
      pointsReceived: 0,
      baseMilesReceived: 0,
      bonusMilesReceived: 0,
      efficiency: getEfficiencyLevel(step.ratio)
    };
  });

  // For multi-step paths, calculate backwards through the chain
  // Each step needs to provide the SOURCE points that the next step will transfer
  for (let i = stepsWithPoints.length - 2; i >= 0; i--) {
    const nextStep = stepsWithPoints[i + 1];
    const currentStep = stepsWithPoints[i];
    
    // The next step needs `nextStep.pointsToTransfer` source points
    // So current step needs to receive that many destination miles
    // Calculate optimal transfer amount for current step to get those destination miles
    const optimalTransfer = calculateOptimalTransferAmount(
      nextStep.pointsToTransfer, // Target: we need this many destination miles
      currentStep.ratio,
      currentStep.bonusThreshold,
      currentStep.bonusAmount,
      currentStep.bonusApplies
    );
    
    // Calculate actual miles received including bonuses
    const actualMilesReceived = calculateTransferWithBonus(
      optimalTransfer,
      currentStep.ratio,
      currentStep.bonusThreshold,
      currentStep.bonusAmount,
      currentStep.bonusApplies
    );
    
    // Calculate base miles (without bonus)
    const { from: ratioFrom, to: ratioTo } = parseRatio(currentStep.ratio);
    const baseMilesReceived = Math.floor((optimalTransfer / ratioFrom) * ratioTo);
    const bonusMilesReceived = actualMilesReceived - baseMilesReceived;
    
    currentStep.pointsReceived = actualMilesReceived;
    currentStep.pointsToTransfer = optimalTransfer;
    currentStep.baseMilesReceived = baseMilesReceived;
    currentStep.bonusMilesReceived = bonusMilesReceived;
  }

  const efficiencyColors = {
    excellent: "text-green-600 border-green-200 bg-green-50",
    good: "text-yellow-600 border-yellow-200 bg-yellow-50",
    poor: "text-red-600 border-red-200 bg-red-50"
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Transfer Path Summary</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Total Transfer Time:</span>
            <span>{path.reduce((acc, step) => acc + step.transferTime, 0)} hours</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">Follow these steps to transfer your points for this booking</div>
      </div>

      <div className="relative">
        {stepsWithPoints.map((step, index) => (
          <div key={index} className="mb-8 last:mb-0">
            <div className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  {index + 1}
                </div>
                {index < path.length - 1 && <div className="w-px h-full bg-border mt-2"></div>}
              </div>

              <div className="pt-1 w-full">
                <div className="mb-2">
                  <div className="text-lg font-semibold">
                    {step.from.name} → {step.to.name}
                  </div>
                </div>

                <div className="p-4 rounded-md border bg-card">
                  {/* Points Calculation */}
                  <div className={`mb-4 p-3 rounded-md border ${efficiencyColors[step.efficiency]}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Points needed:</span>
                        <span className="font-semibold">{step.pointsReceived.toLocaleString()} {step.to.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">You'll transfer:</span>
                        <span className="font-semibold">{step.pointsToTransfer.toLocaleString()} {step.from.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">You'll receive:</span>
                        <span className="font-semibold">{step.pointsReceived.toLocaleString()} {step.to.name}</span>
                      </div>
                      {step.bonusApplies && step.bonusMilesReceived > 0 && (
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="font-medium flex items-center gap-1">
                            <Gift className="h-3 w-3 text-green-600" />
                            Bonus miles:
                          </span>
                          <span className="font-semibold text-green-600">+{step.bonusMilesReceived.toLocaleString()} {step.to.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Transfer Ratio</div>
                        <div className="text-sm text-muted-foreground">{step.ratio}</div>
                        {step.bonusApplies && step.bonusThreshold && step.bonusAmount && (
                          <div className="text-xs text-green-600 mt-1">
                            Bonus: +{step.bonusAmount.toLocaleString()} per {step.bonusThreshold.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Transfer Time</div>
                        <div className="text-sm text-muted-foreground">
                          {step.transferTime} hours
                          {step.transferTime > 48 && (
                            <span className="ml-2 text-yellow-600 text-xs">(Long transfer)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="text-xs">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Go to transfer page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
