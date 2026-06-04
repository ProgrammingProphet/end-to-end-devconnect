# DevConnect - MERN Stack Application on Kubernetes

A full-stack Developer Collaboration & Task Management Platform deployed on Kubernetes (Kind) with production-ready features.

## 🏗️ Architecture

- **Frontend**: React.js with Vite, served by Nginx
- **Backend**: Node.js/Express.js
- **Database**: MongoDB with StatefulSet
- **Orchestration**: Kubernetes (Kind cluster: 1 master + 2 workers)
- **Container**: Docker multi-stage builds
- **Monitoring**: Prometheus & Grafana ready

## ✨ Features

- ✅ User authentication (JWT)
- ✅ Project management
- ✅ Task board with drag-and-drop
- ✅ Team collaboration
- ✅ Comments on tasks
- ✅ Horizontal Pod Autoscaling
- ✅ Health checks & self-healing
- ✅ Production-ready nginx configuration

## 🚀 Local Deployment

### Prerequisites
- Docker
- Kind (Kubernetes in Docker)
- kubectl
- Helm (optional)

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd DevConnect

# Build and load images
./scripts/build-and-load.sh

# Deploy to Kind
./scripts/deploy-to-kind.sh

# Access the application
kubectl port-forward -n devconnect-prod service/frontend-service 8080:80
# Open http://localhost:8080
