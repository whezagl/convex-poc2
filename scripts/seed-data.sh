#!/bin/bash

# Seed Data Script
#
# This script populates the Convex database with initial mock data
# for demonstrating real-time data synchronization.
#
# Usage: bash scripts/seed-data.sh
# Or via npm: npm run seed-data
#
# The script requires CONVEX_ADMIN_KEY to be set in the .env file

set -euo pipefail

# ANSI color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo ""
    echo "Please create a .env file from .env.example:"
    echo "  cp .env.example .env"
    echo ""
    echo "Make sure to set CONVEX_ADMIN_KEY (run 'npm run generate-admin-key' to get one)"
    exit 1
fi

# Source the .env file to get environment variables
set -a
source .env
set +a

# Check if CONVEX_ADMIN_KEY is set
if [ -z "${CONVEX_ADMIN_KEY:-}" ]; then
    echo -e "${RED}Error: CONVEX_ADMIN_KEY not set in .env file${NC}"
    echo ""
    echo "Generate an admin key with:"
    echo "  npm run generate-admin-key"
    echo ""
    echo "Then add it to your .env file:"
    echo "  CONVEX_ADMIN_KEY=<paste-key-here>"
    exit 1
fi

# Check if CONVEX_DEPLOYMENT_URL is set
if [ -z "${CONVEX_DEPLOYMENT_URL:-}" ]; then
    echo -e "${YELLOW}Warning: CONVEX_DEPLOYMENT_URL not set, using default http://localhost:3210${NC}"
    CONVEX_DEPLOYMENT_URL="http://localhost:3210"
fi

# Find the convex-server container
# Try multiple approaches to find the container
CONTAINER_NAME=""

# Method 1: Look for the explicit container name from docker-compose.yml
CONTAINER_NAME=$(docker ps --filter "name=convex-backend" --format "{{.Names}}")

# Method 2: If not found, try filtering by image
if [ -z "$CONTAINER_NAME" ]; then
    CONTAINER_NAME=$(docker ps --filter "ancestor=ghcr.io/get-convex/convex-backend" --format "{{.Names}}")
fi

# Method 3: Legacy filter for Docker Hub image (if someone uses it)
if [ -z "$CONTAINER_NAME" ]; then
    CONTAINER_NAME=$(docker ps --filter "ancestor=get-convex/convex-backend" --format "{{.Names}}")
fi

if [ -z "$CONTAINER_NAME" ]; then
    echo -e "${RED}Error: convex-server container not found. Is it running?${NC}"
    echo ""
    echo "Start the Convex backend with:"
    echo "  python scripts/deploy.py up"
    echo ""
    echo "Or with docker-compose directly:"
    echo "  docker-compose up -d convex-server"
    exit 1
fi

echo -e "${GREEN}Found Convex container: $CONTAINER_NAME${NC}"
echo ""
echo "Seeding data into Convex database..."
echo "--------------------------------------------------"
echo ""

# Create a temporary JSON file with seed data
SEED_FILE=$(mktemp)
trap "rm -f $SEED_FILE" EXIT

cat > "$SEED_FILE" << 'EOF'
[
  {
    "name": "Alpha Sample",
    "value": 100,
    "description": "First sample data item for testing real-time updates"
  },
  {
    "name": "Beta Test",
    "value": 200,
    "description": "Second sample data item with a higher value"
  },
  {
    "name": "Gamma Demo",
    "value": 150,
    "description": "Third sample demonstrating the sync functionality"
  },
  {
    "name": "Delta Example",
    "value": 75,
    "description": "Fourth sample with a lower value for variety"
  },
  {
    "name": "Epsilon Test Case",
    "value": 300,
    "description": "Fifth sample item with the highest value"
  }
]
EOF

# Use npx convex import to seed the data
# The import command reads from a JSON file and inserts into the specified table
if ! npx convex import --url "$CONVEX_DEPLOYMENT_URL" --admin-key "$CONVEX_ADMIN_KEY" mockData "$SEED_FILE"; then
    echo ""
    echo -e "${RED}Error: Failed to seed data into Convex database${NC}"
    echo ""
    echo "Make sure:"
    echo "  1. The Convex container is fully initialized"
    echo "  2. The CONVEX_ADMIN_KEY is valid"
    echo "  3. The CONVEX_DEPLOYMENT_URL is correct ($CONVEX_DEPLOYMENT_URL)"
    echo ""
    echo "Check container logs with:"
    echo "  docker logs $CONTAINER_NAME"
    exit 1
fi

echo ""
echo -e "${GREEN}--------------------------------------------------${NC}"
echo -e "${GREEN}Data seeding complete!${NC}"
echo ""
echo "Successfully seeded 5 mock data items into the database."
echo ""
echo "View the data in your app:"
echo "  1. Start the React dev server: npm run dev"
echo "  2. Open http://localhost:5173/view in your browser"
echo ""
echo "Update the data in real-time:"
echo "  1. Open http://localhost:5173/update in another browser"
echo "  2. Make changes and watch them appear instantly!"
echo ""
