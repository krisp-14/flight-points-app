# ✈️ Flight Points Optimizer

> **A full-stack web application that helps travelers maximize their loyalty points by finding optimal transfer paths between reward programs for booking award flights.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Private-red)](/)

---

## 🎯 The Problem

Travelers with credit card or airline loyalty points often can't book their desired flights directly because:
- They don't have enough points in the right program
- Different programs have different transfer ratios and fees
- Multi-step transfers are complex to calculate manually

## 💡 The Solution

This app automatically finds the optimal way to transfer points between programs using **graph traversal algorithms** (Dijkstra's & BFS), calculating:
- **Best Value** - Minimize points lost in transfers
- **Fastest Transfer** - Minimize transfer time
- **Fewest Steps** - Simplest transfer path

---

## ✨ Key Features

### 🔍 Intelligent Flight Search
- Search multi-segment itineraries across loyalty programs
- Real-time availability checking
- Timezone-aware departure/arrival times

### 🧮 Points Transfer Pathfinding
- **Dijkstra's Algorithm** for optimal value and time paths
- **Breadth-First Search (BFS)** for fewest transfer steps
- Automatic affordability calculations
- Visual step-by-step transfer plans

### 💳 Points Balance Management
- Track points across multiple programs
- Auto-save with debouncing (500ms)
- Real-time bookability indicators

### 📊 Smart Recommendations
- Color-coded transfer efficiency (1:1 = green, 2:1 = red)
- Detailed points calculations at each transfer step
- Transfer time warnings for slow transfers (>72 hours)

### 🎨 Modern UI/UX
- 50+ Radix UI components with Tailwind CSS
- Loading states and error boundaries
- Responsive design for mobile/tablet/desktop

---

## 🛠️ Technical Highlights

### Architecture
- **Feature-based organization** with custom React hooks for state management
- **Next.js 15 App Router** with React Server Components
- **Server Actions** for secure backend communication
- **Singleton pattern** for database connections
- **Type-safe** end-to-end with TypeScript

### Algorithms
Implemented classic computer science algorithms from scratch:
- **Dijkstra's Algorithm** - Single-source shortest path (weighted graph)
- **BFS (Breadth-First Search)** - Shortest path by number of steps
- **Priority Queue** - Custom implementation for optimal pathfinding
- **Graph construction** - Adjacency list from relational data

### Database Design
- **PostgreSQL** via Supabase with complex views
- **Normalized schema** (programs, flights, transfer_paths, user_points)
- **Computed views** for multi-segment itinerary queries
- **Efficient indexing** for fast lookups

### Code Quality
- **Strict TypeScript** with no `any` types
- **Modular architecture** - easy to test and maintain
- **Separation of concerns** - UI, business logic, data layers
- **Error handling** throughout with graceful fallbacks

---

## 🚀 Live Demo

<!-- TODO: Add deployed link -->
[View Live Demo](#) | [Watch Video Walkthrough](#)

### Screenshots

<!-- TODO: Add screenshots -->
_Coming soon: Search interface, transfer path visualization, points management_

---

## 💻 Tech Stack

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

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main application
│   ├── actions.ts         # Server-side data fetching
│   └── layout.tsx         # Root layout
│
├── lib/
│   ├── core/              # Constants, types, configuration
│   ├── database/          # Supabase client & business logic
│   │   └── logic/         # Pathfinding algorithms
│   ├── features/          # Feature modules (custom hooks)
│   │   ├── flights/       # Search & transfer path logic
│   │   ├── points/        # Points management
│   │   ├── programs/      # Loyalty programs data
│   │   └── routes/        # Search form state
│   └── shared/            # Utilities & API layer
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components (50+)
│   └── [features]/       # Feature-specific components
│
└── supabase/             # Database configuration
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanation of how everything works.

---

## 🔧 Local Development Setup

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

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete system architecture, data flow, and algorithm explanations |
| [CLAUDE.md](./CLAUDE.md) | Development guide and codebase overview |
| [SECRETS.md](./SECRETS.md) | EJSON secrets management guide |

---

## 🧪 Testing

```bash
# Run unit tests (pathfinding algorithms)
npm test

# Run with coverage
npm test -- --coverage
```

Test files are located in `lib/database/logic/__tests__/`

---

## 🎓 What I Learned

Building this project taught me:

### Full-Stack Development
- Server-side rendering with Next.js 15
- Server Actions for backend communication
- Database design and optimization
- Real-time data synchronization

### Algorithms & Data Structures
- Implementing Dijkstra's algorithm from scratch
- Graph traversal techniques (BFS, DFS concepts)
- Priority queues and heap operations
- Time/space complexity optimization

### React & State Management
- Custom hooks for complex state logic
- Component composition patterns
- Server vs. Client Components
- Debouncing and performance optimization

### TypeScript
- Advanced type inference
- Generic types and constraints
- Type-safe API contracts
- Discriminated unions

### Database & Backend
- PostgreSQL views and complex queries
- Supabase real-time features
- Database indexing strategies
- Row-level security

### UI/UX
- Responsive design principles
- Loading states and error handling
- Accessibility best practices
- Design system implementation

---

## 🚧 Roadmap

- [ ] **Multi-page structure** - Separate landing, search, and program pages
- [ ] **User authentication** - Replace mock user with real auth
- [ ] **Real-time collaboration** - Share search results with shareable links
- [ ] **Transfer path visualization** - Interactive graph showing program connections
- [ ] **Calendar view** - Show cheapest days to fly
- [ ] **Export functionality** - Download transfer plans as PDF
- [ ] **API integration** - Live flight availability data
- [ ] **Mobile app** - React Native version

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This is a private portfolio project. All rights reserved.

---

## 👤 Author

**[Your Name]**

- Portfolio: [your-portfolio.com](#)
- LinkedIn: [linkedin.com/in/yourprofile](#)
- GitHub: [@yourusername](#)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Inspired by [roame.travel](https://roame.travel) and [point.me](https://point.me)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database hosted by [Supabase](https://supabase.com/)

---

<div align="center">

**⭐ Star this repo if you found it interesting!**

Built with ❤️ using Next.js and TypeScript

</div>
