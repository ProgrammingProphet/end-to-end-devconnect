# DevConnect Docker Setup Guide

This guide describes how to run the DevConnect application locally in both Development and Production environments using Docker Compose, as well as how to build and publish images to Docker Hub.

---

## 🔌 Service Port Mappings

Below is the list of ports on which each service runs:

### Development Environment (`docker-compose-dev.yml`)

| Service | Host Port | Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** (React) | `3000` | `5173` | Hot-reloading Vite development server |
| **Backend** (Express) | `5000` | `5000` | Node.js REST API server |
| **MongoDB** | *Internal Only* | `27017` | Isolated MongoDB database service |

### Production Environment (`docker-compose.yml` / `docker-compose-prod.yml`)

| Service | Host Port | Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** (Nginx) | `3000` | `8080` | Production static asset server running as unprivileged user |
| **Backend** (Express) | `5000` | `5000` | Multi-stage built Node.js server running as non-root `node` user |
| **MongoDB** | *Internal Only* | `27017` | Isolated MongoDB database service |

---

## 🛠️ How to Run the Project

### 1. Development Mode (Quick Testing & Hot Reloading)

In development mode, database and JWT credentials are automatically hardcoded in the compose config for fast setup. Live reload is supported via volume mounts.

```bash
# Start development environment
docker-compose -f docker-compose-dev.yml up --build
```

- Access the frontend at: `http://localhost:3000`
- Access the backend API at: `http://localhost:5000`

### 2. Production Mode (Secure & Standardized)

In production mode, the environment configurations are strict. Secrets must be populated in the root `.env` file first.

```bash
# Ensure .env is populated with MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, JWT_SECRET, etc.
# Start production environment
docker-compose up --build
```

- Access the frontend at: `http://localhost:3000`
- Access the backend API at: `http://localhost:5000`

---

## 🚀 Building & Uploading Images to Docker Hub

You can build and publish the Docker images for deployment in Kubernetes clusters using the following format:

### Dev Image Builds (`dev1.0.0`)

To build and upload development-ready images:

```bash
# Log in to Docker Hub
docker login

# Build & tag Backend Dev Image
docker build -t programmingprobhet/devconnect-backend:dev1.0.0 -f backend/Dockerfile.dev backend/
docker push programmingprobhet/devconnect-backend:dev1.0.0

# Build & tag Frontend Dev Image
docker build -t programmingprobhet/devconnect-frontend:dev1.0.0 -f frontend/Dockerfile.dev frontend/
docker push programmingprobhet/devconnect-frontend:dev1.0.0
```

### Production Image Builds (`prod1.0.0`)

To build and upload production-ready images:

```bash
# Log in to Docker Hub
docker login

# Build & tag Backend Production Image
docker build -t programmingprobhet/devconnect-backend:prod1.0.0 -f backend/Dockerfile backend/
docker push programmingprobhet/devconnect-backend:prod1.0.0

# Build & tag Frontend Production Image
docker build -t programmingprobhet/devconnect-frontend:prod1.0.0 -f frontend/Dockerfile frontend/
docker push programmingprobhet/devconnect-frontend:prod1.0.0
```

---

## 🔒 Security Best Practices Implemented

1. **Non-Root Execution**:
   - Backend runs natively under the `node` user inside Alpine.
   - Frontend runs under the official unprivileged user `nginx` inside unprivileged Nginx base image.
2. **Multi-Stage Builds**:
   - Dependencies are installed in builder stages and only required assets are carried forward to production images to reduce attack surfaces.
3. **Environment & Secrets**:
   - Dev compose uses fallback hardcoded values for instant bootstrapping.
   - Production compose strictly consumes credentials from your active local `.env` file to prevent secret leakage.
