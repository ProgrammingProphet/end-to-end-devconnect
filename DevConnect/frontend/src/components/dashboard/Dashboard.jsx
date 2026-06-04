import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { FaProjectDiagram, FaTasks, FaCheckCircle, FaClock } from "react-icons/fa";
import { useDashboardData } from "../../hooks/useDashboardData";
import Card from "../ui/Card/Card";
import Skeleton from "../ui/Skeleton/Skeleton";
import StatCard from "./StatCard";
import RecentProjectItem from "./RecentProjectItem";
import RecentTaskItem from "./RecentTaskItem";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { projects, tasks, loading, error, stats, refetch } = useDashboardData();
  const { user } = useAuth();

  // Helper function to safely get project description
  const getProjectDescription = (description) => {
    if (!description) return "No description provided";
    return description.length > 100 
      ? `${description.substring(0, 100)}...` 
      : description;
  };

  // Helper function to format date safely
  const formatDate = (date) => {
    if (!date) return "No date";
    try {
      return formatDistanceToNow(new Date(date)) + " ago";
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className={`${styles.dashboard} container page-enter`}>
        <div className={styles.welcomeSection}>
          <Skeleton variant="text" width="60%" height="36px" />
          <Skeleton variant="text" width="40%" height="18px" />
        </div>

        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} elevation="medium" padding="medium">
              <div className={styles.statCardContent}>
                <Skeleton variant="circular" width="48px" height="48px" />
                <div className={styles.statInfo} style={{ flex: 1 }}>
                  <Skeleton variant="text" width="80px" height="36px" />
                  <Skeleton variant="text" width="120px" height="14px" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className={styles.recentSection}>
          <Skeleton variant="text" width="200px" height="24px" />
          <div style={{ marginTop: 'var(--space-3)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
                <Skeleton variant="text" width="100%" height="20px" />
                <Skeleton variant="text" width="80%" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.dashboardError} container`}>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={refetch} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} container page-enter`}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeHeading}>Welcome back, {user?.name || "Developer"}! 👋</h1>
        <p className={styles.welcomeSubtext}>Here's what's happening with your projects today</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard 
          icon={FaProjectDiagram}
          color="var(--color-accent)"
          value={stats.totalProjects}
          label="Total Projects"
        />
        <StatCard 
          icon={FaTasks}
          color="var(--color-info)"
          value={stats.totalTasks}
          label="Total Tasks"
        />
        <StatCard 
          icon={FaCheckCircle}
          color="var(--color-success)"
          value={stats.completedTasks}
          label="Completed Tasks"
        />
        <StatCard 
          icon={FaClock}
          color="var(--color-warning)"
          value={stats.pendingTasks}
          label="Pending Tasks"
        />
      </div>

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Projects</h2>
          <Link to="/projects" className={styles.viewAllLink}>View All →</Link>
        </div>
        
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects yet.</p>
            <Link to="/projects/new" className="btn btn-primary">
              Create your first project
            </Link>
          </div>
        ) : (
          <ul className={styles.recentList}>
            {projects.slice(0, 5).map((project) => (
              <RecentProjectItem 
                key={project._id}
                project={project}
                formatDate={formatDate}
                getProjectDescription={getProjectDescription}
              />
            ))}
          </ul>
        )}
      </div>

      <div className={styles.recentSection} style={{ marginTop: "30px" }}>
        <div className={styles.sectionHeader}>
          <h2>Recent Tasks</h2>
          {projects.length > 0 && (
            <Link to={`/projects/${projects[0]?._id}/tasks`} className={styles.viewAllLink}>
              View All Tasks →
            </Link>
          )}
        </div>
        
        {tasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tasks yet.</p>
            {projects.length > 0 && (
              <Link to={`/projects/${projects[0]?._id}/tasks`} className="btn btn-primary">
                Create your first task
              </Link>
            )}
          </div>
        ) : (
          <ul className={styles.recentList}>
            {tasks.slice(0, 5).map((task) => (
              <RecentTaskItem key={task._id} task={task} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;