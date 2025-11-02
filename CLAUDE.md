# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flight Points Optimizer is a Next.js 15 application that helps users optimize their loyalty points by finding the best transfer paths between different reward programs for booking award flights. The app uses Supabase for backend data and implements a feature-based architecture.

## Development Commands

```bash
# Setup environment (first time only)
./scripts/setup-env.sh
# OR
npm run secrets:env

# Start development server
npm run dev

# Build for production
next build

# Start production server
npm run start

# Run linter
npm run lint

# Secrets management
npm run secrets:view    # View decrypted secrets
npm run secrets:env     # Generate .env.local from secrets
```

## Architecture

### Directory Structure

The codebase follows a feature-based architecture:

```
app/
  actions.ts          # Server actions for data fetching (getPrograms, searchItineraries, findTransferPath, etc.)
  page.tsx            # Main FlightPointsOptimizer component

lib/
  core/               # Core configuration and constants
    constants.ts      # App-wide constants (DEFAULT_USER_ID, date formats, error messages, mock data)
    timezone-mapping.ts
    types/

  database/           # Database layer
    supabase.ts       # Supabase client singleton and type definitions
    logic/            # Business logic functions
      canBook.ts      # Check if user can book a flight with their points
      findBestTransferPath.ts  # (TODO) Graph-based pathfinding
      itineraryBookability.ts

  features/           # Feature modules (custom hooks + logic)
    flights/
      useFlightSearch.ts    # Itinerary search and transfer path state management
    points/
      usePointsManagement.ts # User points CRUD operations
    programs/
      useProgramsData.ts    # Loyalty programs data fetching
    routes/
      useFormState.ts       # Search form state (origin, destination, date, etc.)
      route-data.ts         # Popular route data

  shared/             # Shared utilities
    api/              # Centralized API exports (re-exports from app/actions.ts)
    hooks/
    utils.ts

components/
  ui/                 # shadcn/ui components (50+ Radix UI primitives)
  AirportCombobox.tsx
  FlightSearchForm.tsx
  ItineraryCard.tsx
  PointsBalance.tsx
  RouteCard.tsx
  TransferPathPanel.tsx
  transfer-path-stepper.tsx
```

### Key Architectural Patterns

1. **Feature-Based Organization**: Each feature (flights, points, programs, routes) has its own directory with custom hooks and logic
2. **Server Actions**: Data fetching happens via Next.js server actions in `app/actions.ts`
3. **Custom Hooks**: UI components consume data via feature-specific hooks that encapsulate state and business logic
4. **Centralized Types**: All database types are defined in `lib/database/supabase.ts`
5. **API Layer**: `lib/shared/api/index.ts` re-exports server actions for clean imports

### Data Flow

1. Main page (`app/page.tsx`) uses feature hooks: `usePointsManagement`, `useProgramsData`, `useFormState`, `useFlightSearch`
2. Feature hooks call server actions from `app/actions.ts`
3. Server actions use `getSupabaseClient()` to query Supabase tables
4. Data flows back through hooks to UI components

### Important Database Tables

- `programs` - Loyalty reward programs (Amex, Aeroplan, etc.)
- `flights` - Individual flight segments
- `itineraries_with_segments` - Multi-segment flight itineraries with nested segment data
- `transfer_paths` - Point transfer relationships between programs (from_program_id, to_program_id, ratio, transfer_time_hours)
- `user_points` - User's points balances per program
- `flight_programs` - Maps flights to bookable programs with points costs

### Critical Implementation Notes

1. **Itinerary Structure**: The app searches for `Itinerary` objects (not individual `Flight` objects). Each itinerary contains multiple segments, and each segment has a flight with bookable_options.

2. **Transfer Path Logic**: The `findTransferPath` function in `app/actions.ts` currently returns `no-path` for all requests. The TODO is to implement graph-based pathfinding using the `transfer_paths` table.

3. **Points Calculation**: The `canBook` function in `lib/database/logic/canBook.ts` checks if a user has sufficient points in any program that can book a flight.

4. **Environment Variables & Secrets**:
   - Managed via EJSON (see SECRETS.md for details)
   - Required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Private key stored in `.ejson/keys/` (NOT committed)
   - Encrypted secrets in `secrets.ejson` (committed)
   - Run `npm run secrets:env` to generate `.env.local`

5. **Default User**: The app uses a hardcoded `DEFAULT_USER_ID` from `lib/core/constants.ts` (no auth implemented yet).

6. **Date Format**: Database queries use `DATABASE_DATE_FORMAT` constant ("yyyy-MM-dd" via date-fns).

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **UI**: Radix UI primitives + shadcn/ui components, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Forms**: react-hook-form + zod
- **Date Handling**: date-fns, date-fns-tz
- **State Management**: React hooks (no global state library)
- **TypeScript**: Strict mode enabled

## Common Development Patterns

### Adding a New Feature

1. Create a directory in `lib/features/[feature-name]/`
2. Create a custom hook (e.g., `useFeatureName.ts`)
3. Add any server actions needed to `app/actions.ts`
4. Export from `lib/features/[feature-name]/index.ts`
5. Create UI components in `components/`

### Adding a New Server Action

1. Add function to `app/actions.ts` with `"use server"` directive
2. Use `getSupabaseClient()` for database access
3. Export from `lib/shared/api/index.ts` for feature hooks to consume

### Working with Supabase

- Always use `getSupabaseClient()` from `lib/database/supabase.ts` (singleton pattern)
- Types are exported from the same file
- Local Supabase runs on port 54321 (see `supabase/config.toml`)
- Project ID: `flight-points-optimizer`

### Adding shadcn/ui Components

Components are configured in `components.json` with path aliases:
```bash
npx shadcn@latest add [component-name]
```

## Secrets Management

This project uses EJSON for encrypted secrets management:

- **Documentation**: See `SECRETS.md` for complete setup instructions
- **Encrypted file**: `secrets.ejson` (in git)
- **Private key**: `.ejson/keys/0e8b2ed031f10b285dfb58a84c3edaee4e53cc8fb498946a2f94a1ca783f667a` (NOT in git)
- **Quick setup**: `./scripts/setup-env.sh` or `npm run secrets:env`

To view secrets: `npm run secrets:view`

## Known TODOs

1. **Transfer Path Algorithm**: Implement Dijkstra's algorithm in `findBestTransferPath` (currently returns empty path)
2. **Authentication**: Replace `DEFAULT_USER_ID` with real user authentication
3. **Itinerary Display**: The transfer path currently shows only the first segment's flight - needs to handle full itinerary bookability
