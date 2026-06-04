import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import Card from "../ui/Card/Card";
import Button from "../ui/Button/Button";
import Badge from "../ui/Badge/Badge";
import Skeleton from "../ui/Skeleton/Skeleton";
import toast from "react-hot-toast";
import "./Projects.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");
      setProjects(response.data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await API.delete(`/projects/${id}`);
        setProjects(projects.filter((p) => p._id !== id));
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      }
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
  });

  const getStatusVariant = (status) => {
    const statusMap = {
      active: "success",
      completed: "info",
      archived: "neutral",
    };
    return statusMap[status] || "neutral";
  };

  if (loading) {
    return (
      <div className="projects-container container page-enter">
        <div className="projects-header">
          <Skeleton variant="text" width="200px" height="36px" />
          <Skeleton variant="rectangular" width="150px" height="40px" />
        </div>

        <div className="projects-filter">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" width="100px" height="40px" />
          ))}
        </div>

        <div className="projects-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} elevation="medium" padding="medium">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Skeleton variant="text" width="70%" height="24px" />
                  <Skeleton variant="rectangular" width="80px" height="24px" />
                </div>
                <Skeleton variant="text" width="100%" height="16px" />
                <Skeleton variant="text" width="90%" height="16px" />
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  <Skeleton variant="rectangular" width="80px" height="36px" />
                  <Skeleton variant="rectangular" width="80px" height="36px" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container container page-enter">
      <div className="projects-header">
        <h1>Projects</h1>
        <Button variant="primary" onClick={() => navigate("/projects/new")}>
          New Project
        </Button>
      </div>

      <div className="projects-filter">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={`filter-btn ${filter === "archived" ? "active" : ""}`}
          onClick={() => setFilter("archived")}
        >
          Archived
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h2 className="empty-state-title">No projects found</h2>
          <p className="empty-state-message">
            {filter === "all"
              ? "Get started by creating your first project"
              : `No ${filter} projects at the moment`}
          </p>
          {filter === "all" && (
            <Button variant="primary" onClick={() => navigate("/projects/new")}>
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              elevation="medium"
              padding="medium"
              hoverable={true}
              className="project-card-modern"
            >
              <div className="project-card-header">
                <h2 className="project-card-title">
                  <Link to={`/projects/${project._id}`}>{project.name}</Link>
                </h2>
                <Badge variant={getStatusVariant(project.status)} size="small">
                  {project.status}
                </Badge>
              </div>

              <p className="project-card-description">
                {project.description.length > 150
                  ? `${project.description.substring(0, 150)}...`
                  : project.description}
              </p>

              <div className="project-card-meta">
                <div className="project-card-meta-item">
                  <span className="meta-label">Owner:</span>
                  <span className="meta-value">{project.owner?.name}</span>
                </div>
                <div className="project-card-meta-item">
                  <span className="meta-label">Members:</span>
                  <span className="meta-value">
                    {project.members?.length || 0}
                  </span>
                </div>
              </div>

              <div className="project-card-actions">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate(`/projects/${project._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(project._id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
