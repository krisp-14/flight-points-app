"use server"

import { getSupabaseClient } from "./supabase"

export async function initializeDatabase() {
  try {
    const supabase = getSupabaseClient()
    console.log("Checking if database tables exist...")

    // First, try a simple query to see if the table exists
    const { data, error } = await supabase.from("programs").select("count").limit(1)

    // If there's an error with code 42P01, the table doesn't exist
    if (error && error.code === "42P01") {
      console.log("Programs table doesn't exist. Creating database schema...")

      // Create programs table using SQL
      const createProgramsSQL = `
        CREATE TABLE IF NOT EXISTS programs (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );
      `

      const { error: createError } = await supabase.rpc("exec", { query: createProgramsSQL })

      if (createError) {
        console.error("Error creating programs table:", createError)
        return false
      }

      // Create transfer_paths table
      const createPathsSQL = `
        CREATE TABLE IF NOT EXISTS transfer_paths (
          id SERIAL PRIMARY KEY,
          from_program_id INTEGER NOT NULL REFERENCES programs(id),
          to_program_id INTEGER NOT NULL REFERENCES programs(id),
          ratio TEXT NOT NULL
        );
      `

      const { error: createPathsError } = await supabase.rpc("exec", { query: createPathsSQL })

      if (createPathsError) {
        console.error("Error creating transfer_paths table:", createPathsError)
        return false
      }

      // Seed programs table with initial data (IDs will auto-increment)
      const seedProgramsSQL = `
        INSERT INTO programs (name) VALUES
          ('Amex Membership Rewards'),
          ('RBC Avion'),
          ('CIBC Aventura'),
          ('TD Rewards'),
          ('Aeroplan'),
          ('Marriott Bonvoy')
        ON CONFLICT (name) DO NOTHING;
      `

      const { error: seedError } = await supabase.rpc("exec", { query: seedProgramsSQL })

      if (seedError) {
        console.error("Error seeding programs table:", seedError)
        return false
      }

      // Seed transfer_paths table with initial data (use program IDs 1-6 as per insert order)
      const seedPathsSQL = `
        INSERT INTO transfer_paths (from_program_id, to_program_id, ratio) VALUES
          (1, 5, '1:1'), -- Amex -> Aeroplan
          (1, 6, '1:1'), -- Amex -> Marriott
          (2, 5, '1:1'), -- RBC -> Aeroplan
          (3, 5, '1:1'), -- CIBC -> Aeroplan
          (4, 5, '1:1'), -- TD -> Aeroplan
          (6, 5, '3:1')  -- Marriott -> Aeroplan
        ON CONFLICT DO NOTHING;
      `

      const { error: seedPathsError } = await supabase.rpc("exec", { query: seedPathsSQL })

      if (seedPathsError) {
        console.error("Error seeding transfer_paths table:", seedPathsError)
        return false
      }

      console.log("Database initialized successfully!")
      return true
    } else if (error) {
      console.error("Error checking if programs table exists:", error)
      return false
    }

    // If we get here, the table exists
    console.log("Programs table exists, checking if it has data...")

    // Check if there's data in the programs table
    const { data: programsData, error: countError } = await supabase.from("programs").select("count")

    if (countError) {
      console.error("Error checking programs count:", countError)
      return false
    }

    // If no data, seed the tables
    if (!programsData || programsData.length === 0) {
      console.log("Programs table is empty. Seeding data...")

      // Seed programs table with initial data
      const seedProgramsSQL = `
        INSERT INTO programs (name) VALUES
          ('Amex Membership Rewards'),
          ('RBC Avion'),
          ('CIBC Aventura'),
          ('TD Rewards'),
          ('Aeroplan'),
          ('Marriott Bonvoy')
        ON CONFLICT (name) DO NOTHING;
      `

      const { error: seedError } = await supabase.rpc("exec", { query: seedProgramsSQL })

      if (seedError) {
        console.error("Error seeding programs table:", seedError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Unexpected error in initializeDatabase:", error)
    return false
  }
}
