# Flight Points Optimizer - Architecture Documentation

> **Purpose:** This document explains how your application works, making it easy to understand and explain to others (like in interviews!).

---

## Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [Data Flow](#data-flow)
3. [Directory Structure](#directory-structure)
4. [Key Components](#key-components)
5. [Database Architecture](#database-architecture)
6. [Algorithms](#algorithms)

---

## High-Level Overview

### What Does This App Do?

Your app helps travelers optimize their loyalty points by finding the best way to transfer points between programs to book award flights.

**Example:**
- User has 30,000 Amex points
- Wants to book a flight that costs 45,000 Aeroplan points
- App finds: "Transfer 45,000 Amex → 45,000 Aeroplan (1:1 ratio, 24 hours)"

---

## Data Flow

### The Journey of a Search Request

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                        (app/page.tsx)                           │
└──────────────────┬────────────────────────────────┬─────────────┘
                   │                                │
                   ▼                                ▼
         ┌─────────────────┐              ┌──────────────────┐
         │  FlightSearch   │              │  PointsBalance   │
         │  Form Component │              │    Component     │
         └────────┬────────┘              └────────┬─────────┘
                  │                                │
                  ▼                                ▼
         ┌─────────────────┐              ┌──────────────────┐
         │ useFlightSearch │              │usePointsManagement│
         │   Custom Hook   │              │   Custom Hook    │
         └────────┬────────┘              └────────┬─────────┘
                  │                                │
                  ▼                                ▼
         ┌──────────────────────────────────────────────────┐
         │           Server Actions (app/actions.ts)         │
         │  - searchItineraries()                            │
         │  - findTransferPath()                             │
         │  - getUserPoints()                                │
         └────────────────────┬─────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────────────────┐
         │            Supabase Client Singleton              │
         │          (lib/database/supabase.ts)               │
         └────────────────────┬─────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────────────────┐
         │             PostgreSQL Database                   │
         │  Tables: programs, flights, itineraries,          │
         │          transfer_paths, user_points              │
         └───────────────────────────────────────────────────┘
```

### Step-by-Step Breakdown

#### 1. **User Searches for Flights**

**What happens:**
```
User fills form → handleSearch() → searchForItineraries()
```

**Files involved:**
- `app/page.tsx` - UI and event handlers
- `lib/features/flights/useFlightSearch.ts` - State management
- `app/actions.ts` - `searchItineraries()` function
- Database: Queries `itineraries_with_segments` view

#### 2. **User Selects an Itinerary**

**What happens:**
```
User clicks itinerary → handleItinerarySelect() → selectItinerary()
```

**Logic:**
1. Get programs that can book this itinerary
2. Check if user has enough points in each program
3. If not enough in source program → find transfer path
4. Call `findTransferPath()` server action
5. Run Dijkstra's or BFS algorithm
6. Return optimal transfer path

**Files involved:**
- `lib/features/flights/useFlightSearch.ts` - Orchestrates the flow
- `lib/database/logic/itineraryBookability.ts` - Checks affordability
- `lib/database/logic/findBestTransferPath.ts` - Pathfinding algorithms
- `app/actions.ts` - `findTransferPath()` server action

#### 3. **Display Transfer Path**

**What happens:**
```
Transfer path returned → UI updates → TransferPathStepper renders
```

**What's rendered:**
- Each step of the transfer
- Points calculations
- Transfer ratios and times
- Color-coded efficiency indicators

**Files involved:**
- `components/TransferPathPanel.tsx` - Container component
- `components/transfer-path-stepper.tsx` - Step-by-step visualization

---

## Directory Structure

### Current Organization

```
flight-points-app/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main application page (everything is here!)
│   ├── actions.ts                # Server-side data fetching functions
│   └── layout.tsx                # Root layout with metadata
│
├── lib/                          # Business logic (brain of the app)
│   ├── core/                     # Core configuration
│   │   ├── constants.ts          # App-wide constants
│   │   ├── timezone-mapping.ts   # Airport timezone data
│   │   └── types/                # Type definitions
│   │
│   ├── database/                 # Database layer
│   │   ├── supabase.ts           # Database client + type definitions
│   │   └── logic/                # Business logic functions
│   │       ├── canBook.ts        # Check affordability for single flight
│   │       ├── itineraryBookability.ts  # Check affordability for full itinerary
│   │       └── findBestTransferPath.ts  # Dijkstra's & BFS algorithms
│   │
│   ├── features/                 # Feature modules (custom hooks)
│   │   ├── flights/
│   │   │   └── useFlightSearch.ts  # Search + transfer path state
│   │   ├── points/
│   │   │   └── usePointsManagement.ts  # Points CRUD operations
│   │   ├── programs/
│   │   │   └── useProgramsData.ts  # Loyalty programs data
│   │   └── routes/
│   │       ├── useFormState.ts   # Search form state
│   │       └── route-data.ts     # Popular routes data
│   │
│   └── shared/                   # Shared utilities
│       ├── api/                  # Re-exports server actions
│       ├── hooks/                # Generic React hooks
│       └── utils.ts              # Helper functions (timezone, formatting)
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (50+)
│   ├── AirportCombobox.tsx       # Airport search with autocomplete
│   ├── FlightSearchForm.tsx      # Main search form
│   ├── ItineraryCard.tsx         # Flight itinerary display
│   ├── PointsBalance.tsx         # Points input grid
│   ├── RouteCard.tsx             # Popular route cards
│   ├── RouteGrid.tsx             # Grid of popular routes
│   ├── TransferPathPanel.tsx     # Transfer path container
│   ├── transfer-path-stepper.tsx # Step-by-step transfer visualization
│   └── empty-state.tsx           # Error/empty states
│
└── supabase/                     # Database configuration
    └── config.toml               # Local Supabase settings
```

### Design Pattern: Feature-Based Organization

Each feature has its own folder with:
- Custom hook (state management)
- Types/constants specific to that feature
- Business logic functions

**Benefits:**
- Easy to find related code
- Clear separation of concerns
- Scales well as app grows

---

## Key Components

### 1. Page Component (`app/page.tsx`)

**Purpose:** Main application interface - the "conductor" that orchestrates all features.

**What it does:**
- Combines all custom hooks
- Manages UI layout (2-column grid)
- Handles user interactions (search, select itinerary)
- Passes data between components

**Key hooks used:**
```typescript
usePointsManagement()  // User's points balances
useProgramsData()      // Loyalty programs list
useFormState()         // Search form state
useFlightSearch()      // Itinerary search + transfer paths
```

---

### 2. Custom Hooks (State Management)

#### `useFlightSearch` - The Search Engine
**File:** `lib/features/flights/useFlightSearch.ts`

**Responsibilities:**
- Search for itineraries
- Handle itinerary selection
- Trigger pathfinding
- Manage loading/error states

**State it manages:**
```typescript
itineraries           // Search results
selectedItinerary     // Currently selected itinerary
transferPath          // Optimal transfer path
isSearching           // Loading state
isFindingPath         // Pathfinding in progress
errorType             // Error type (no-flights, no-path)
```

#### `usePointsManagement` - Points Tracker
**File:** `lib/features/points/usePointsManagement.ts`

**Responsibilities:**
- Load user's points balances
- Save changes with debounce (500ms)
- Handle errors gracefully

**Auto-save logic:**
```typescript
// Waits 500ms after user stops typing, then saves to database
const debouncedSave = debounce(saveUserPoints, 500)
```

---

### 3. Server Actions (`app/actions.ts`)

**What are Server Actions?**
- Functions that run on the server (not in browser)
- Have access to database
- Marked with `"use server"` directive
- Called from client components like regular functions

**Key functions:**

```typescript
searchItineraries()   // Queries itineraries_with_segments view
findTransferPath()    // Runs pathfinding algorithm
getUserPoints()       // Fetches user's points
saveUserPoints()      // Saves points to database
getPrograms()         // Fetches loyalty programs
```

**Why use Server Actions?**
- Keep database queries secure
- Don't expose API keys in browser
- Automatic request/response handling
- Type-safe (TypeScript knows the types!)

---

### 4. UI Components

#### Smart Components (Have Logic)
- `FlightSearchForm` - Form validation, airport search
- `ItineraryCard` - Bookability calculations, formatting
- `TransferPathStepper` - Points calculations, efficiency ratings

#### Dumb Components (Just Display)
- Most `components/ui/*` - Buttons, cards, inputs
- `RouteCard` - Just displays data passed to it
- `EmptyState` - Just shows error messages

**Design principle:**
- Smart components at top level
- Dumb components for reusability
- Keeps code maintainable

---

## Database Architecture

### Tables

#### `programs` - Loyalty Programs
```sql
id                INT PRIMARY KEY
name              TEXT          -- "Air Canada Aeroplan"
description       TEXT          -- Optional description
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### `flights` - Individual Flight Segments
```sql
id                INT PRIMARY KEY
airline           TEXT          -- "Air Canada"
flight_number     TEXT          -- "AC849"
origin_code       TEXT          -- "LHR"
destination_code  TEXT          -- "YYZ"
departure_time    TIMESTAMP
arrival_time      TIMESTAMP
cabin_class       TEXT          -- Economy/Business/First
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### `transfer_paths` - Program Transfer Relationships
```sql
id                    INT PRIMARY KEY
from_program_id       INT           -- Source program
to_program_id         INT           -- Destination program
ratio                 TEXT          -- "1:1" or "2:1"
transfer_time_hours   INT           -- How long transfer takes
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

**This is the graph!** Each row is an edge in the pathfinding algorithm.

#### `user_points` - User Points Balances
```sql
user_id           UUID          -- User identifier
program_id        INT           -- Which program
points            INT           -- How many points
created_at        TIMESTAMP
updated_at        TIMESTAMP

UNIQUE(user_id, program_id)  -- One row per user per program
```

### Database Views (Computed Tables)

#### `itineraries_with_segments`
**Purpose:** Groups multi-segment journeys together.

**What it does:**
Combines flights into complete itineraries (e.g., YYZ → LHR → ATH becomes one itinerary with 2 segments).

**Structure:**
```typescript
{
  itinerary_id: number,
  origin: string,
  destination: string,
  departure_time: string,
  arrival_time: string,
  segments: [
    {
      segment_number: 1,
      flight: Flight,
      origin_timezone: string,
      destination_timezone: string
    },
    // ... more segments
  ]
}
```

**Why a view?**
- Complex joins happen in database (faster!)
- Simplifies application code
- Automatically updates when flights change

---

## Algorithms

### Pathfinding: Finding the Best Transfer Route

**Problem:**
User has points in Program A, needs points in Program B, C, or D.
Find the best way to transfer points.

**Solution:**
Graph traversal algorithms (like Google Maps for points!)

#### Dijkstra's Algorithm (Value & Time Modes)

**Used for:**
- "Best Value" mode - Minimize points lost
- "Fastest Transfer" mode - Minimize hours

**How it works:**
```
1. Start at source program
2. Explore all neighbors (programs you can transfer to)
3. Calculate "cost" to reach each neighbor
   - Value mode: cost = transfer ratio (2:1 = cost of 2)
   - Time mode: cost = transfer_time_hours
4. Always explore the lowest-cost path first
5. Stop when you reach ANY target program
6. Reconstruct the path you took
```

**Example (Value Mode):**
```
Start: Amex (program 2)
Target: Air Canada Aeroplan (program 1)

Graph:
Amex → Aeroplan (1:1, cost = 1)
Amex → RBC (2:1, cost = 2)
RBC → Aeroplan (1:1.5, cost = 0.67)

Dijkstra explores:
1. Amex → Aeroplan (cost 1) ✓ FOUND!
2. Never explores Amex → RBC → Aeroplan (cost 2.67) because it's worse

Result: [Amex, Aeroplan]
```

#### BFS (Breadth-First Search) - Hops Mode

**Used for:**
- "Fewest Steps" mode - Minimize number of transfers

**How it works:**
```
1. Start at source program
2. Check all programs 1 transfer away
3. If target found, done!
4. If not, check all programs 2 transfers away
5. Continue until target found
```

**Why different from Dijkstra?**
- BFS finds shortest path by number of steps
- Dijkstra finds shortest path by "weight" (cost)
- For unweighted graphs (hops), BFS is simpler and faster

**Example:**
```
Start: Amex
Targets: [Aeroplan, Marriott]

Distance 1: Amex → Aeroplan ✓ FOUND!
Never checks distance 2

Result: [Amex, Aeroplan] (1 hop)
```

---

## Code Flow Example: Complete Search

Let's trace what happens when a user searches for a flight:

### Step 1: User Input
```typescript
// User fills form in FlightSearchForm.tsx
Origin: LHR
Destination: YYZ
Date: Aug 29, 2025
Source Program: American Express (ID: 2)
Mode: Best Value
```

### Step 2: Form Submission
```typescript
// app/page.tsx
const handleSearch = async () => {
  await searchForItineraries(
    'LHR',  // origin
    'YYZ',  // destination
    new Date('2025-08-29')
  )
}
```

### Step 3: Hook Processes Search
```typescript
// lib/features/flights/useFlightSearch.ts
const searchForItineraries = async (origin, dest, date) => {
  setIsSearching(true)

  // Format date for database
  const formattedDate = format(date, 'yyyy-MM-dd')

  // Call server action
  const results = await searchItineraries(origin, dest, formattedDate)

  setItineraries(results)
  setIsSearching(false)
}
```

### Step 4: Server Action Queries Database
```typescript
// app/actions.ts
export async function searchItineraries(origin, dest, date) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('itineraries_with_segments')
    .select('*')
    .eq('origin', origin)
    .eq('destination', dest)
    .gte('departure_time', `${date}T00:00:00`)
    .lt('departure_time', `${date}T23:59:59`)

  return data || []
}
```

### Step 5: Results Display
```typescript
// app/page.tsx
{itineraries.map(itinerary => (
  <ItineraryCard
    itinerary={itinerary}
    userPoints={userPoints}
    onSelect={() => handleItinerarySelect(itinerary)}
  />
))}
```

### Step 6: User Selects Itinerary
```typescript
// app/page.tsx
const handleItinerarySelect = async (itinerary) => {
  await selectItinerary(
    itinerary,
    2,  // sourceProgram (Amex)
    'value',  // optimization mode
    { 1: 35000, 2: 30000, 3: 20000 }  // userPoints
  )
}
```

### Step 7: Pathfinding Triggered
```typescript
// lib/features/flights/useFlightSearch.ts
const selectItinerary = async (itinerary, sourceProgram, mode, userPoints) => {
  setIsFindingPath(true)

  // Which programs can book this?
  const bookablePrograms = getBookableProgramsForItinerary(itinerary, userPoints)
  // Result: [{program_id: 1, canBook: true}, {program_id: 2, canBook: false}]

  // Can user afford with their source program?
  const canAffordWithSource = bookablePrograms
    .some(bp => bp.canBook && bp.program_id === sourceProgram)

  if (canAffordWithSource) {
    // No transfer needed!
    setTransferPath([])
    return
  }

  // Find transfer path to affordable programs
  const targetPrograms = [1]  // Aeroplan (user can afford this one)

  const result = await findTransferPath(
    sourceProgram,  // 2 (Amex)
    targetPrograms,  // [1] (Aeroplan)
    mode,  // 'value'
    userPoints
  )

  setTransferPath(result.path)
}
```

### Step 8: Algorithm Runs
```typescript
// lib/database/logic/findBestTransferPath.ts
export async function findBestTransferPath({
  sourceProgramId,  // 2 (Amex)
  destinationProgramIds,  // [1] (Aeroplan)
  mode  // 'value'
}) {
  // Fetch transfer paths from database
  const { data: edges } = await supabase
    .from('transfer_paths')
    .select('*')

  // Build graph: Amex → Aeroplan (1:1, 24h)
  const graph = buildGraph(edges)

  // Run Dijkstra's algorithm
  const result = dijkstra(graph, 2, [1], 'value')

  // Result: { path: [2, 1], cost: 1 }
  return {
    path: [2, 1],
    totalCost: 1,
    totalTime: 24,
    warnings: []
  }
}
```

### Step 9: Server Action Enriches Path
```typescript
// app/actions.ts
export async function findTransferPath(...) {
  // Get raw path from algorithm: [2, 1]
  const result = await findBestTransferPath(...)

  // Fetch program details
  const programs = await supabase.from('programs').select('*')
  const transferPaths = await supabase.from('transfer_paths').select('*')

  // Build detailed path
  const detailedPath = [
    {
      from: { id: 2, name: 'American Express Membership Rewards' },
      to: { id: 1, name: 'Air Canada Aeroplan' },
      ratio: '1:1',
      transferTime: 24
    }
  ]

  return { path: detailedPath, errorType: null }
}
```

### Step 10: UI Updates
```typescript
// components/transfer-path-stepper.tsx
// Calculates: Need 45,000 Aeroplan
// With 1:1 ratio: Transfer 45,000 Amex → Get 45,000 Aeroplan
// Displays with green background (excellent efficiency)
```

---

## Summary

### What You've Built

1. **Full-Stack Application**
   - React frontend (Next.js)
   - Server-side logic (Server Actions)
   - Database integration (Supabase)

2. **Complex Features**
   - Multi-segment flight search
   - Graph algorithms (Dijkstra's, BFS)
   - Real-time points calculations
   - Dynamic UI updates

3. **Clean Architecture**
   - Feature-based organization
   - Separation of concerns
   - Reusable components
   - Type-safe code (TypeScript)

4. **Production Patterns**
   - Custom hooks for state management
   - Server-side data fetching
   - Error handling
   - Loading states

### What Makes This Portfolio-Worthy

- ✅ Solves a real problem
- ✅ Complex enough to show skills
- ✅ Uses modern tech stack
- ✅ Clean code organization
- ✅ Demonstrates algorithms knowledge
- ✅ Full-stack implementation

---

**You didn't just copy code - you built a sophisticated application. Now you understand how it works!**
