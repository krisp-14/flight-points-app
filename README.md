# Flight Points Optimizer

> **A full-stack web application that helps travelers maximize their loyalty points by finding optimal transfer paths between reward programs for booking award flights.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-red)](/)

---

## The Problem

Travelers with credit card or airline loyalty points often can't book their desired flights directly because:
- They don't have enough points in the right program
- Different programs have different transfer ratios and fees
- Multi-step transfers are complex to calculate manually
- Transfer bonuses (like Marriott's 60k threshold) add complexity to calculations

## The Solution

This app automatically finds the optimal way to transfer points between programs using **graph traversal algorithms** (Dijkstra's & BFS), calculating:
- **Best Value** - Minimize points lost in transfers, accounting for bonus thresholds
- **Fastest Transfer** - Minimize transfer time
- **Fewest Steps** - Simplest transfer path

---

## Key Features

### Intelligent Flight Search
- Search multi-segment itineraries across loyalty programs
- Real-time availability checking with ±3 day date range
- Timezone-aware departure/arrival times
- Route validation against available database routes

### Points Transfer Pathfinding
- **Dijkstra's Algorithm** for optimal value and time paths
- **Breadth-First Search (BFS)** for fewest transfer steps
- **Bonus-aware calculations** - Automatically optimizes transfer amounts to hit bonus thresholds (e.g., 60k Marriott for +5k bonus)
- Automatic affordability calculations
- Visual step-by-step transfer plans with bonus mile indicators

### Points Balance Management
- Track points across multiple programs
- Inline dropdown editor for easy point updates
- Auto-calculated total points (sum of all programs)
- Real-time bookability indicators

### Explore & Discovery
- Browse available routes from database
- Recent searches tracking (last 3 routes viewed)
- Quick navigation to previously explored routes
- Route cards showing earliest departure dates and option counts

### Smart Recommendations
- Color-coded transfer efficiency (1:1 = green, 2:1 = red)
- Detailed points calculations at each transfer step
- Bonus miles displayed with visual indicators
- Transfer time warnings for slow transfers (>72 hours)

### Modern UI/UX
- 50+ Radix UI components with Tailwind CSS
- Loading states and error boundaries
- Responsive design for mobile/tablet/desktop
- Simplified search form with route validation

---

## Technical Highlights

### Architecture
- **Feature-based organization** with custom React hooks for state management
- **Next.js 15 App Router** with React Server Components
- **Server Actions** for secure backend communication
- **Singleton pattern** for database connections
- **Type-safe** end-to-end with TypeScript

### Algorithms
Implemented classic computer science algorithms from scratch:
- **Dijkstra's Algorithm** - Single-source shortest path (weighted graph) with bonus-aware edge weights
- **BFS (Breadth-First Search)** - Shortest path by number of steps
- **Priority Queue** - Custom binary min-heap implementation for optimal pathfinding
- **Graph construction** - Adjacency list from relational data
- **Bonus optimization** - Calculates optimal transfer amounts to maximize bonus miles

### Database Design
- **PostgreSQL** via Supabase with complex views
- **Normalized schema** (programs, flights, transfer_paths, user_points, airports)
- **Computed views** for multi-segment itinerary queries
- **Transfer bonuses** - bonus_threshold, bonus_amount, bonus_applies columns
- **Efficient indexing** for fast lookups

### Code Quality
- **Strict TypeScript** with no `any` types
- **Modular architecture** - easy to test and maintain
- **Separation of concerns** - UI, business logic, data layers
- **Error handling** throughout with graceful fallbacks
- **Client-side caching** for airport searches and recent routes

---

## Live Demo

<!-- TODO: Add deployed link -->
[View Live Demo](#) | [Watch Video Walkthrough](#)

### Screenshots

<!-- TODO: Add screenshots -->
_Coming soon: Search interface, transfer path visualization, points management_

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5 |
| **UI Library** | Radix UI, shadcn/ui, Tailwind CSS |
| **Backend** | Next.js Server Actions, Supabase |
| **Database** | PostgreSQL (Supabase-hosted) |
| **Forms** | react-hook-form, Zod validation |
| **Date Handling** | date-fns, date-fns-tz |
| **Secrets** | EJSON (encrypted configuration) |

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage with search form
│   ├── explore/           # Explore available routes
│   │   └── page.tsx
│   ├── search/            # Search results page
│   │   └── page.tsx
│   ├── actions.ts         # Server-side data fetching
│   └── layout.tsx         # Root layout with header
│
├── lib/
│   ├── core/              # Constants, types, configuration
│   ├── database/          # Supabase client & business logic
│   │   ├── cache.ts      # Server-side caching
│   │   └── logic/         # Pathfinding algorithms
│   │       └── findBestTransferPath.ts  # Dijkstra's & BFS with bonus calculations
│   ├── features/          # Feature modules (custom hooks)
│   │   ├── flights/       # Search & transfer path logic
│   │   ├── points/        # Points management
│   │   ├── programs/      # Loyalty programs data
│   │   └── routes/        # Recent routes tracking
│   └── shared/            # Utilities & API layer
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components (50+)
│   ├── Header.tsx        # App header with points display
│   ├── SearchForm.tsx    # Simplified search with validation
│   ├── PointsBalance.tsx # Inline dropdown points editor
│   ├── ItineraryCard.tsx # Flight itinerary display
│   ├── TransferPathPanel.tsx # Transfer path container
│   └── transfer-path-stepper.tsx # Step-by-step visualization
│
└── supabase/             # Database configuration
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanation of how everything works.

---

## Local Development Setup

### Prerequisites
- **Node.js 18+** and npm
- **[EJSON](https://github.com/Shopify/ejson)** for secrets management
- **[jq](https://stedolan.github.io/jq/)** (recommended)

```bash
# macOS
brew install ejson jq

# Linux
sudo apt-get install jq
go install github.com/Shopify/ejson/cmd/ejson@latest
```

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd flight-points-app

# 2. Install dependencies
npm install

# 3. Setup environment variables
#    Option A: Quick setup (if you have the private key)
./scripts/setup-env.sh

#    Option B: Manual setup
mkdir -p .ejson/keys
echo "YOUR_PRIVATE_KEY" > .ejson/keys/0e8b2ed031f10b285dfb58a84c3edaee4e53cc8fb498946a2f94a1ca783f667a
npm run secrets:env

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Secrets management
npm run secrets:view # View decrypted secrets
npm run secrets:env  # Generate .env.local from secrets
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete system architecture, data flow, and algorithm explanations |
| [SECRETS.md](./SECRETS.md) | EJSON secrets management guide |

---

## Testing

```bash
# Run unit tests (pathfinding algorithms)
npm test

# Run with coverage
npm test -- --coverage
```

Test files are located in `lib/database/logic/__tests__/`

---

## Roadmap

- [ ] **User authentication** - Replace mock user with real auth
- [ ] **Real-time collaboration** - Share search results with shareable links
- [ ] **Transfer path visualization** - Interactive graph showing program connections
- [ ] **Calendar view** - Show cheapest days to fly
- [ ] **Export functionality** - Download transfer plans as PDF
- [ ] **API integration** - Live flight availability data
- [ ] **Mobile app** - React Native version

---

## Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This is a private portfolio project. All rights reserved.

---

## Acknowledgments

- Inspired by [roame.travel](https://roame.travel) and [point.me](https://point.me)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database hosted by [Supabase](https://supabase.com/)

---

<div align="center">

**Star this repo if you found it interesting!**

Built with Next.js and TypeScript

</div>
