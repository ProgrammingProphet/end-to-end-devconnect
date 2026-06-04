import { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export const useDashboardData = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch projects first
      const projectsRes = await API.get("/projects");
      const projectsData = projectsRes.data.data || [];
      setProjects(projectsData);

      // Fetch tasks for each project in parallel for better performance
      if (projectsData.length > 0) {
        const taskPromises = projectsData.map(project => 
          API.get(`/projects/${project._id}/tasks`)
            .catch(err => {
              console.warn(`Failed to fetch tasks for project ${project._id}:`, err);
              return { data: { data: [] } }; // Return empty tasks on error
            })
        );
        
        const tasksResponses = await Promise.all(taskPromises);
        const allTasks = tasksResponses.flatMap(res => res.data.data || []);
        setTasks(allTasks);

        // Calculate stats
        const completedTasks = allTasks.filter((t) => t?.status === "done").length;
        setStats({
          totalProjects: projectsData.length,
          totalTasks: allTasks.length,
          completedTasks,
          pendingTasks: allTasks.length - completedTasks,
        });
      } else {
        // No projects, reset stats
        setTasks([]);
        setStats({
          totalProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    projects,
    tasks,
    loading,
    error,
    stats,
    refetch: fetchDashboardData
  };
};
