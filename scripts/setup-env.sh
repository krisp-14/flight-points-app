#!/bin/bash

# Setup environment variables from EJSON secrets
# Usage: ./scripts/setup-env.sh

set -e

KEYDIR=".ejson/keys"
PUBLIC_KEY="0e8b2ed031f10b285dfb58a84c3edaee4e53cc8fb498946a2f94a1ca783f667a"
PRIVATE_KEY_FILE="$KEYDIR/$PUBLIC_KEY"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔐 Flight Points Optimizer - Environment Setup"
echo "=============================================="
echo ""

# Check if ejson is installed
if ! command -v ejson &> /dev/null; then
    echo -e "${RED}Error: ejson is not installed${NC}"
    echo "Please install ejson first:"
    echo "  macOS: brew install ejson"
    echo "  Linux: go install github.com/Shopify/ejson/cmd/ejson@latest"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed${NC}"
    echo "jq is recommended for easier secret extraction"
    echo "  macOS: brew install jq"
    echo "  Linux: sudo apt-get install jq"
    echo ""
fi

# Check if private key exists
if [ ! -f "$PRIVATE_KEY_FILE" ]; then
    echo -e "${RED}Error: Private key not found${NC}"
    echo "Expected location: $PRIVATE_KEY_FILE"
    echo ""
    echo "Please obtain the private key from a team member and run:"
    echo "  mkdir -p $KEYDIR"
    echo "  echo 'YOUR_PRIVATE_KEY_HERE' > $PRIVATE_KEY_FILE"
    exit 1
fi

echo -e "${GREEN}✓ Private key found${NC}"

# Decrypt and create .env.local
if [ -f "secrets.ejson" ]; then
    echo "📝 Creating .env.local from secrets.ejson..."

    if command -v jq &> /dev/null; then
        EJSON_KEYDIR="$KEYDIR" ejson decrypt secrets.ejson | jq -r '
            "NEXT_PUBLIC_SUPABASE_URL=" + .next_public.supabase_url,
            "NEXT_PUBLIC_SUPABASE_ANON_KEY=" + .next_public.supabase_anon_key
        ' > .env.local

        echo -e "${GREEN}✓ .env.local created successfully${NC}"
        echo ""
        echo "Environment variables set:"
        cat .env.local | sed 's/=.*/=***/'
    else
        # Fallback without jq
        echo -e "${YELLOW}Creating basic .env.local (install jq for better formatting)${NC}"
        EJSON_KEYDIR="$KEYDIR" ejson decrypt secrets.ejson > .env.tmp
        echo "NEXT_PUBLIC_SUPABASE_URL=REPLACE_ME" > .env.local
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_ME" >> .env.local
        echo -e "${YELLOW}Please manually update .env.local with values from secrets.ejson${NC}"
        rm .env.tmp
    fi
else
    echo -e "${RED}Error: secrets.ejson not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo "You can now run: npm run dev"
