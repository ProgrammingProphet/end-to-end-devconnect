import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import Navbar from "./components/layout/Navbar";
import Skeleton from "./components/ui/Skeleton/Skeleton";
import "./App.css";

// Lazy load route components
const Login = lazy(() => import("./components/auth/Login"));
const Register = lazy(() => import("./components/auth/Register"));
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const ProjectList = lazy(() => import("./components/projects/ProjectList"));
const ProjectForm = lazy(() => import("./components/projects/ProjectForm"));
const ProjectDetails = lazy(() => import("./components/projects/ProjectDetails"));
const TaskBoard = lazy(() => import("./components/tasks/TaskBoard"));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    padding: 'var(--space-4)', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 'var(--space-3)',
    minHeight: '400px'
  }}>
    <Skeleton variant="text" width="40%" height="36px" />
    <Skeleton variant="text" width="60%" height="20px" />
    <div style={{ marginTop: 'var(--space-4)' }}>
      <Skeleton variant="rectangular" width="100%" height="200px" />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Toaster position="top-right" />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <ProjectList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/new"
                element={
                  <PrivateRoute>
                    <ProjectForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <PrivateRoute>
                    <ProjectDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/:id/edit"
                element={
                  <PrivateRoute>
                    <ProjectForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/:projectId/tasks"
                element={
                  <PrivateRoute>
                    <TaskBoard />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
