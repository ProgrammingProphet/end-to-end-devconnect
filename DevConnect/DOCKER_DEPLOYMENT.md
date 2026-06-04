# DevConnect - Docker Deployment Guide

## 🚀 Application Status: RUNNING

The entire DevConnect full-stack application is now running using Docker Compose!

## 📦 Running Services

| Service | Container Name | Port | Status |
|---------|---------------|------|--------|
| MongoDB | devconnect-mongodb | 27017 | ✅ Running (Healthy) |
| Backend API | devconnect-backend | 5000 | ✅ Running |
| Frontend | devconnect-frontend | 3000 | ✅ Running |

## 🌐 Access URLs

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **MongoDB**: mongodb://localhost:27017

## 🔑 Default Credentials

### MongoDB
- Username: `admin`
- Password: `password123`
- Database: `devconnect`

### Application
You'll need to register a new user through the frontend at http://localhost:3000/register

## 🛠️ Docker Commands

### Start the Application
```bash
docker-compose up
```

### Start in Detached Mode (Background)
```bash
docker-compose up -d
```

### Stop the Application
```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs devconnect-frontend -f
docker logs devconnect-backend -f
docker logs devconnect-mongodb -f
```

### Rebuild Containers
```bash
docker-compose build --no-cache
docker-compose up
```

### Check Container Status
```bash
docker ps
```

## 📁 Project Structure

```
DevConnect/
├── backend/                 # Node.js/Express API
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React/Vite Application
│   ├── src/
│   ├── Dockerfile.dev
│   └── package.json
├── docker-compose.yml      # Main orchestration file
└── DOCKER_DEPLOYMENT.md    # This file
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/devconnect?authSource=admin
JWT_SECRET=64afc1141e3969877c936171c9548fd3
JWT_EXPIRE=7d
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=/api
VITE_ENVIRONMENT=development
```

### Network Configuration

All services run on a custom Docker network called `devconnect-network`, allowing them to communicate using service names:
- Frontend → Backend: `http://backend:5000`
- Backend → MongoDB: `mongodb://mongodb:27017`

## 🎯 Features Implemented

### UI/UX Redesign (Completed)
- ✅ Modern design system with dark/light theme support
- ✅ Reusable UI components (Button, Card, Badge, Modal, Dropdown)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Glassmorphism effects on navbar
- ✅ Smooth animations and micro-interactions
- ✅ Accessibility improvements (keyboard navigation, ARIA labels)

### Performance Optimizations (Completed)
- ✅ Component refactoring (Dashboard split into sub-components)
- ✅ CSS Modules implementation
- ✅ React.memo for pure components
- ✅ Lazy loading for route components
- ✅ Code splitting in production build

### Backend Features
- User authentication (JWT)
- Project management (CRUD)
- Task management with Kanban board
- Comments on tasks
- RESTful API

## 🧪 Testing the Application

1. **Access the Frontend**: Open http://localhost:3000 in your browser
2. **Register a New User**: Click "Register" and create an account
3. **Login**: Use your credentials to log in
4. **Create a Project**: Navigate to Projects and create a new project
5. **Add Tasks**: Go to the project's task board and add tasks
6. **Test Theme Toggle**: Switch between light and dark modes

## 📊 Health Check

Verify the backend is running correctly:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2026-02-19T19:10:06.671Z",
  "mongodb": "connected"
}
```

## 🐛 Troubleshooting

### Port Already in Use
If you get port conflicts, stop any services using ports 3000, 5000, or 27017:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :27017

# Kill process by PID
taskkill /PID <PID> /F
```

### Container Won't Start
```bash
# Check logs
docker logs devconnect-backend
docker logs devconnect-frontend
docker logs devconnect-mongodb

# Rebuild from scratch
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
docker-compose up
```

### MongoDB Connection Issues
Ensure MongoDB is healthy:
```bash
docker exec -it devconnect-mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

## 🔄 Development Workflow

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite dev server with HMR
- Backend: Changes require container restart (or use nodemon in dev mode)

### Making Code Changes
1. Edit files in `frontend/src/` or `backend/src/`
2. Frontend changes reflect immediately
3. Backend changes require: `docker-compose restart backend`

## 📝 Notes

- The application uses Docker volumes for MongoDB data persistence
- Frontend uses Vite proxy to forward `/api` requests to the backend
- All services are connected via a custom Docker network
- The setup is optimized for development with hot reload support

## 🎉 Success!

Your DevConnect application is now running in Docker containers with:
- ✅ MongoDB database
- ✅ Node.js/Express backend API
- ✅ React/Vite frontend with modern UI
- ✅ Full-stack integration
- ✅ Production-ready containerization

Enjoy developing with DevConnect! 🚀
