#!/bin/bash

# Generate Admin Key Script Wrapper
#
# This script finds the running convex-server container and executes
# the internal generate_admin_key.sh script inside it.
#
# Usage: bash scripts/generate_admin_key.sh
# Or via npm: npm run generate-admin-key
#
# The generated admin key should be copied to your .env file as CONVEX_ADMIN_KEY

set -euo pipefail

# ANSI color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

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
echo "Generating admin key in container: $CONTAINER_NAME"
echo "--------------------------------------------------"
echo ""

# Execute the generate_admin_key.sh script inside the container
if ! docker exec "$CONTAINER_NAME" ./generate_admin_key.sh; then
    echo ""
    echo -e "${RED}Error: Failed to generate admin key in container${NC}"
    echo ""
    echo "Make sure the Convex container is fully initialized."
    echo "Check container logs with:"
    echo "  docker logs $CONTAINER_NAME"
    exit 1
fi

echo ""
echo -e "${GREEN}--------------------------------------------------${NC}"
echo -e "${GREEN}Admin key generation complete!${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC} Copy the admin key above to your .env file:"
echo "  CONVEX_ADMIN_KEY=<paste-key-here>"
echo ""
echo "You can now seed the database with:"
echo "  npm run seed-data"
