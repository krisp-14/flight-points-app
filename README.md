# Flight Points Optimizer

A Next.js application that helps users optimize their loyalty points by finding the best transfer paths between different reward programs for booking award flights.

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- [EJSON](https://github.com/Shopify/ejson) for secrets management
- [jq](https://stedolan.github.io/jq/) (recommended)

```bash
# macOS
brew install ejson jq

# Linux
sudo apt-get install jq
go install github.com/Shopify/ejson/cmd/ejson@latest
```

### 2. Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd flight-points-app

# Install dependencies
npm install

# Setup secrets (you'll need the private key from a team member)
# See SECRETS.md for details
mkdir -p .ejson/keys
echo "YOUR_PRIVATE_KEY" > .ejson/keys/0e8b2ed031f10b285dfb58a84c3edaee4e53cc8fb498946a2f94a1ca783f667a

# Generate .env.local from encrypted secrets
npm run secrets:env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Architecture overview and development guide for Claude Code
- **[SECRETS.md](./SECRETS.md)** - Comprehensive guide to secrets management with EJSON

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: Supabase (PostgreSQL)
- **UI**: Radix UI + shadcn/ui, Tailwind CSS
- **Forms**: react-hook-form + zod
- **Secrets**: EJSON for encrypted configuration

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run secrets:view # View decrypted secrets
npm run secrets:env  # Generate .env.local from secrets
```

## Project Structure

```
app/              # Next.js app directory (routes & server actions)
components/       # React components (UI + feature components)
lib/
  core/          # Constants, types, configuration
  database/      # Supabase client & business logic
  features/      # Feature modules (custom hooks)
  shared/        # Shared utilities & API layer
scripts/         # Helper scripts
supabase/        # Supabase configuration
```

## Environment Setup

This project uses EJSON for managing secrets. The encrypted `secrets.ejson` file is committed to git, but you need the private key to decrypt it.

**First time setup:**
1. Get the private key from a team member (via secure channel)
2. Run `./scripts/setup-env.sh` or `npm run secrets:env`
3. This creates `.env.local` with the required environment variables

See [SECRETS.md](./SECRETS.md) for detailed instructions.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting: `npm run lint`
4. Create a pull request

## License

Private project
