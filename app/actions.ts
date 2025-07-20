"use server"

import { getSupabaseClient, type Program, type Flight } from "@/lib/supabase"
import { initializeDatabase } from "@/lib/db-init"

export async function getPrograms(): Promise<Program[]> {
  try {
    // Try to initialize the database if needed
    const initialized = await initializeDatabase()
    console.log("Database initialized:", initialized)

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("programs").select("*").order("name")

    if (error) {
      console.error("Error fetching programs:", error)
      return getMockPrograms() // Fallback to mock data
    }

    console.log("Programs fetched from database:", data)
    return data || getMockPrograms()
  } catch (error) {
    console.error("Unexpected error in getPrograms:", error)
    return getMockPrograms() // Fallback to mock data
  }
}

// Fallback mock data in case database operations fail
function getMockPrograms(): Program[] {
  const mockPrograms = [
    { id: 1, name: "Amex Membership Rewards" },
    { id: 2, name: "RBC Avion" },
    { id: 3, name: "CIBC Aventura" },
    { id: 4, name: "TD Rewards" },
    { id: 5, name: "Aeroplan" },
    { id: 6, name: "Marriott Bonvoy" },
  ];
  return mockPrograms;
}

export async function searchFlights(origin: string, destination: string, date: string): Promise<Flight[]> {
  // In a real implementation, this would call your award availability API
  // For demo purposes, we'll simulate a response

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // 30% chance of no flights for demo purposes
  if (Math.random() < 0.3) {
    return []
  }

  // Mock flight data
  return [
    {
      id: 1,
      airline: "Air Canada",
      flight_number: "AC123",
      origin,
      destination,
      departure_time: `${date}T08:00:00`,
      arrival_time: `${date}T12:00:00`,
      cabin_class: "Business",
      points_required: 25000,
    },
    {
      id: 2,
      airline: "Lufthansa",
      flight_number: "LH456",
      origin,
      destination,
      departure_time: `${date}T14:30:00`,
      arrival_time: `${date}T18:45:00`,
      cabin_class: "Economy",
      points_required: 15000,
    },
  ]
}

export async function findTransferPath(
  sourceProgram: number,
  targetPrograms: number[],
  optimizationMode: string,
): Promise<{
  path:
    | {
        from: Program
        to: Program
        ratio: string
        transferTime: number
      }[]
    | null
  errorType: "no-path" | null
}> {
  try {
    // In a real implementation, this would use your graph pathfinding algorithm
    // For demo purposes, we'll simulate a response

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 20% chance of no valid path for demo purposes
    if (Math.random() < 0.2) {
      return { path: null, errorType: "no-path" }
    }

    // Fetch all programs for reference
    const supabase = getSupabaseClient()
    const { data: programs, error } = await supabase.from("programs").select("*")

    if (error) {
      console.error("Error fetching programs for path finding:", error)
      return simulateTransferPath(sourceProgram, optimizationMode)
    }

    const programsMap = new Map<number, Program>()
    programs?.forEach((program) => {
      programsMap.set(program.id, program)
    })

    // If source program is already a target program, no transfer needed
    if (targetPrograms.includes(sourceProgram)) {
      return { path: [], errorType: null }
    }

    // Simulate a transfer path for demonstration
    if (targetPrograms.length === 0) {
      return { path: null, errorType: "no-path" }
    }
    const fromProgram = programsMap.get(sourceProgram);
    const toProgram = programsMap.get(targetPrograms[0]);
    if (!fromProgram || !toProgram) {
      return { path: null, errorType: "no-path" };
    }
    return {
      path: [
        {
          from: fromProgram,
          to: toProgram,
          ratio: "1:1",
          transferTime: 24,
        },
      ],
      errorType: null,
    }
  } catch (error) {
    console.error("Unexpected error in findTransferPath:", error)
    return simulateTransferPath(sourceProgram, optimizationMode)
  }
}

// Fallback simulation in case database operations fail
function simulateTransferPath(sourceProgram: number, optimizationMode: string) {
  const mockPrograms: Record<number, Program> = {
    1: { id: 1, name: "Amex Membership Rewards" },
    2: { id: 2, name: "RBC Avion" },
    5: { id: 5, name: "Aeroplan" },
    6: { id: 6, name: "Marriott Bonvoy" },
  }

  if (optimizationMode === "value") {
    return {
      path: [
        {
          from: mockPrograms[sourceProgram],
          to: mockPrograms[6],
          ratio: "1:1.25",
          transferTime: 48,
        },
        {
          from: mockPrograms[6],
          to: mockPrograms[5],
          ratio: "60k:25k",
          transferTime: 24,
        },
      ],
      errorType: null,
    }
  } else if (optimizationMode === "time") {
    return {
      path: [
        {
          from: mockPrograms[sourceProgram],
          to: mockPrograms[5],
          ratio: "1:1",
          transferTime: 1,
        },
      ],
      errorType: null,
    }
  } else {
    return {
      path: [
        {
          from: mockPrograms[sourceProgram],
          to: mockPrograms[5],
          ratio: "1:1",
          transferTime: 24,
        },
      ],
      errorType: null,
    }
  }
}
