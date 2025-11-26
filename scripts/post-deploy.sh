#!/bin/bash

# Post-Deployment Setup Script for Vercel
# Run this script after deploying to Vercel and setting up the database

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Standart PN Notice Filer - Post-Deployment Setup       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI is not installed${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✓ Vercel CLI is installed${NC}"
echo ""

# Step 1: Pull environment variables from Vercel
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Pulling environment variables from Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if vercel env pull .env.local; then
    echo -e "${GREEN}✓ Environment variables pulled successfully${NC}"
else
    echo -e "${RED}✗ Failed to pull environment variables${NC}"
    echo "Make sure you're logged in: vercel login"
    exit 1
fi

echo ""

# Step 2: Check if required environment variables are set
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Validating environment variables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUIRED_VARS=("POSTGRES_URL" "APP_PASSWORD" "JWT_SECRET" "SHOPIFY_STORE_DOMAIN" "SHOPIFY_ACCESS_TOKEN")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.local 2>/dev/null || [ -z "$(grep "^${var}=" .env.local | cut -d'=' -f2-)" ]; then
        MISSING_VARS+=("$var")
        echo -e "${RED}✗ Missing: $var${NC}"
    else
        echo -e "${GREEN}✓ Found: $var${NC}"
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo ""
    echo -e "${RED}Error: Missing required environment variables!${NC}"
    echo "Please set these in your Vercel project settings:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo ""

# Step 3: Install dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Installing dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm install; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Step 4: Generate Prisma Client
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Generating Prisma Client..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npx prisma generate; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo ""

# Step 5: Run database migrations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Running database migrations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npx prisma migrate deploy; then
    echo -e "${GREEN}✓ Database migrations completed${NC}"
else
    echo -e "${RED}✗ Failed to run migrations${NC}"
    echo "Check your database connection strings"
    exit 1
fi

echo ""

# Step 6: Seed the database
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Seeding database with default settings..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npx prisma db seed; then
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Failed to seed database${NC}"
    echo "You may need to seed manually or the database may already be seeded"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✓ Setup Complete!                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Visit your Vercel deployment URL"
echo "2. Login with your APP_PASSWORD"
echo "3. Add your first products in the Products page"
echo "4. Start generating CSV files!"
echo ""
echo "Deployment URL: Check your Vercel dashboard"
echo ""
