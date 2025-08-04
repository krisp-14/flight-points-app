import { Check, Clock, ExternalLink, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Program } from "@/lib/database/supabase"

type TransferPathStepperProps = {
  path:
    | {
        from: Program
        to: Program
        ratio: string
        transferTime: number
      }[]
    | null
}

export function TransferPathStepper({ path }: TransferPathStepperProps) {
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
        {path.map((step, index) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Transfer Ratio</div>
                        <div className="text-sm text-muted-foreground">{step.ratio}</div>
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
