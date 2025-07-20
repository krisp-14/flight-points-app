"use client"

import { AlertCircle, Search } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type EmptyStateProps = {
  errorType: "no-flights" | "no-path" | null
  origin: string
  destination: string
  date: Date | undefined
  onRetry?: () => void
}

export function EmptyState({ errorType, origin, destination, date, onRetry }: EmptyStateProps) {
  if (errorType === "no-flights") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Award Flights Found</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            We couldn't find any award flights from {origin} to {destination} on{" "}
            {date ? format(date, "MMMM d, yyyy") : "the selected date"}.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Try these alternatives:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Search for nearby airports</li>
              <li>Try different dates (±3 days often works)</li>
              <li>Consider a different cabin class</li>
            </ul>
          </div>
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            <Search className="mr-2 h-4 w-4" />
            Try Different Dates
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (errorType === "no-path") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Valid Transfer Path</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            We found award flights, but there's no valid point transfer path from your selected program to any bookable
            program.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Try these alternatives:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Select a different source points program</li>
              <li>Try a different optimization mode</li>
              <li>Consider earning points directly with the airline program</li>
            </ul>
          </div>
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            Change Source Program
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
