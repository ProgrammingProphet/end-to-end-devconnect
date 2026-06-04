# DevConnect Application Discovery Report

## Application Architecture Summary

Full-stack MERN (MongoDB, Express.js, React, Node.js) project with separated frontend/backend.

**Components**:
| Layer | Tech | Role |
|-------|------|------|
| Frontend | React 19 + Vite + Tailwind | SPA dashboard (auth, projects, tasks) |
| Backend | Node.js/Express + Mongoose | REST API (auth/projects/tasks) |
| Database | MongoDB 6 | Data persistence (users/projects/tasks) |
| Proxy (Prod) | Nginx | Static serve + API proxy |

**Dev vs Prod**:

- Dev: Vite dev server (3000) → proxy backend.
- Prod: Nginx serves `dist/` + proxy `/api` to backend.

**Current**: Docker Compose (dev/prod Dockerfiles).

## Ports Used by Each Service

| Service      | Dev Port | Prod Port           | Exposed (Compose) | Defined In                                       |
| ------------ | -------- | ------------------- | ----------------- | ------------------------------------------------ | --- | ------ |
| Frontend     | **3000** | **80**              | 3000:3000         | **vite.config.js** (server.port), docker-compose |
| Backend      | **5000** | **5000** (internal) | 5000:5000         | **server.js** (`process.env.PORT                 |     | 5000`) |
| MongoDB      | 27017    | 27017               | 27017:27017       | docker-compose.yml                               |
| Nginx (Prod) | -        | **80**              | -                 | frontend/nginx.conf                              |

**No conflicts**. Dev proxy via Vite; prod via Nginx.

## Environment Variables List

**Backend (dotenv)**:
| Var | Purpose | Sensitive? | Type |
|-----|---------|------------|------|
| `PORT` | Backend port | No | ConfigMap |
| `NODE_ENV` | Environment | No | ConfigMap |
| `MONGODB_URI` | DB connection (mongodb://admin:pass@mongo:27017) | **Yes** | Secret |
| `JWT_SECRET` | Auth tokens | **Yes** | Secret |
| `JWT_EXPIRE` | Token expiry | No | ConfigMap |

**Frontend (Vite)**: `DOCKER_ENV=true` (proxy target).

## Nginx Routing Configuration (frontend/nginx.conf)

```
server {
  listen 80;

  # React Router SPA
  location / { try_files $uri $uri/ /index.html; }

  # API proxy
  location /api {
    proxy_pass http://backend:5000/api;
    # Headers: X-Real-IP, X-Forwarded-For/Proto, etc.
  }

  # Static cache
  location /assets { expires 1y; }
}
```

- **Routes**: `/` → static SPA, `/api` → backend:5000/api.
- Features: Gzip, SPA fallback, asset caching.

## Startup Commands

| Service  | Dev                                   | Prod                 | Source                         |
| -------- | ------------------------------------- | -------------------- | ------------------------------ |
| Backend  | `npm run dev` (nodemon) / `npm start` | `node src/server.js` | package.json                   |
| Frontend | `npm run dev` (vite)                  | `vite build` → nginx | package.json / Dockerfile.prod |
| MongoDB  | Official image                        | Same                 | docker-compose                 |

## Database Configuration

- **MongoDB 6** (image: mongo:6).
- **URI**: `mongodb://admin:password123@mongodb:27017/devconnect?authSource=admin`.
- **Port**: 27017.
- **Auth**: Root user `admin` / `password123`.
- **Persistence**: Volume `mongo-data:/data/db`.
- **Connection**: backend/src/config/database.js (mongoose.connect(MONGODB_URI)).
- **Init**: mongo-init.js (external).

**Volumes for K8s**: PVC for `/data/db`.

## Potential Problems Before Dockerizing

- **Secrets hardcoded** in docker-compose (JWT_SECRET, DB creds) → Use Secrets.
- Dev volumes (`./backend:/usr/src/app`) → Avoid in prod (use multi-stage).
- No healthchecks on backend (use `/health`).
- Heavy deps: React deps (~200MB), mongoose/bcrypt (~150MB).
- No resource limits.
- Frontend dev exposes 3000 publicly → Prod only 80.
- Mongo auth weak (`password123`).

## Recommended Container Architecture

### Dockerfiles (Enhance)

**Backend (Multi-stage)**:

```
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
EXPOSE 5000
CMD ["node", "src/server.js"]
```

**Frontend Prod**: Current good (vite build → nginx:alpine).

### Docker Compose Prod

```yaml
services:
  mongodb: # As-is + healthcheck
  backend:
    env_file: .env.prod
    healthcheck: { test: "curl -f http://localhost:5000/health", ... }
    resources: { limits: { memory: 512M } }
  frontend:
    build: { dockerfile: Dockerfile.prod }
    # No dev volumes
```

### Kubernetes

- **Namespace**: `devconnect`.
- **Deployments** (HPA-ready):
  | Deployment | Replicas | CPU/Mem Req | Probes |
  |------------|----------|-------------|--------|
  | Backend | 2-5 | 200m/256Mi | `/health` |
  | Frontend | 3 | 100m/128Mi | `/` |
  | Mongo | 1 (StatefulSet) | 500m/1Gi | `mongosh --eval "db.adminCommand('ping')"` |
- **Services**: ClusterIP (backend/mongo), LoadBalancer/Ingress (frontend).
- **Ingress** (Nginx Ingress):
  ```
  / → frontend
  /api → backend
  ```
- **ConfigMap**: PORT=5000, NODE_ENV=production.
- **Secrets**: MONGODB_URI (replace creds), JWT_SECRET.
- **PVC**: mongo-data (10Gi).
- **Optimizations**: .dockerignore node_modules, multi-stage builds (reduce ~500MB → 200MB).

**Deploy Demo**: `docker compose up -d` (http://localhost:3000).
