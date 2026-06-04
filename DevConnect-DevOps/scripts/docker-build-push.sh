#!/bin/bash

# Configuration
# You can set your Docker Hub username here or as an environment variable
# Get the Git commit SHA (matches github.sha in CI)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git-sha")
TIMESTAMP=$(date +%Y%m%d%H%M%S)
# Tag to use alongside latest (prioritizing Git SHA to match CI)
VERSION_TAG=${GIT_SHA}
PROJECT_NAME="devconnect"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if logged in to Docker Hub
echo -e "${BLUE}Checking Docker Hub login status...${NC}"
if ! docker system info | grep -q "Username"; then
    echo -e "${RED}You are not logged in to Docker Hub. Performing 'docker login'...${NC}"
    docker login
fi

# Confirm Username
if [ "$DOCKER_USERNAME" == "your-dockerhub-username" ]; then
    read -p "Enter your Docker Hub username: " DOCKER_USERNAME
fi

echo -e "${GREEN}Starting build and push for $PROJECT_NAME (Tag: $VERSION_TAG)...${NC}"

# Function to build and push
build_and_push() {
    local SERVICE_NAME=$1
    local CONTEXT_DIR=$2
    # Naming matches CI: ${{ secrets.DOCKER_USERNAME }}/devconnect-frontend
    local IMAGE_NAME="$DOCKER_USERNAME/${PROJECT_NAME}-${SERVICE_NAME}"
    
    echo -e "${BLUE}--- Building $SERVICE_NAME ---${NC}"
    docker build -t "$IMAGE_NAME:latest" -t "$IMAGE_NAME:$VERSION_TAG" "$CONTEXT_DIR"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}$SERVICE_NAME built successfully.${NC}"
        
        echo -e "${BLUE}--- Pushing $SERVICE_NAME to Docker Hub ---${NC}"
        docker push "$IMAGE_NAME:latest"
        docker push "$IMAGE_NAME:$VERSION_TAG"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}$SERVICE_NAME pushed successfully!${NC}"
        else
            echo -e "${RED}Failed to push $SERVICE_NAME.${NC}"
        fi
    else
        echo -e "${RED}Failed to build $SERVICE_NAME.${NC}"
    fi
}

# 1. Build and Push Frontend
build_and_push "frontend" "./frontend"

# 2. Build and Push Backend
build_and_push "backend" "./backend"

echo -e "${GREEN}All tasks completed.${NC}"
echo -e "Images: "
echo -e "  - $DOCKER_USERNAME/${PROJECT_NAME}-frontend:latest"
echo -e "  - $DOCKER_USERNAME/${PROJECT_NAME}-frontend:$TIMESTAMP"
echo -e "  - $DOCKER_USERNAME/${PROJECT_NAME}-backend:latest"
echo -e "  - $DOCKER_USERNAME/${PROJECT_NAME}-backend:$TIMESTAMP"
