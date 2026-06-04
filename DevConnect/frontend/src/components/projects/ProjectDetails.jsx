import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Projects.css";

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProject = useCallback(async () => {
    try {
      const response = await API.get(`/projects/${id}`);
      setProject(response.data.data);
    } catch {
      toast.error("Error fetching project");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);

    try {
      // First, find user by email
      const userRes = await API.get(`/users?email=${newMemberEmail}`);
      const userId = userRes.data.data[0]._id;

      await API.post(`/projects/${id}/members`, {
        userId,
        role: "member",
      });

      toast.success("Member added successfully");
      setNewMemberEmail("");
      fetchProject(); // Refresh project data
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding member");
    } finally {
      setAddingMember(false);
    }
  };

  const canManageProject = () => {
    if (!project || !user) return false;
    return project.owner._id === user.id || user.role === "admin";
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!project) {
    return <div className="container">Project not found</div>;
  }

  return (
    <div className="project-details container page-enter">
      <div className="project-header">
        <div>
          <h1>{project.name}</h1>
          <p className="project-status">
            Status:{" "}
            <span className={`status-badge status-${project.status}`}>
              {project.status}
            </span>
          </p>
        </div>
        <div className="project-actions">
          {canManageProject() && (
            <>
              <Link to={`/projects/${id}/edit`} className="btn btn-secondary">
                Edit Project
              </Link>
              <Link to={`/projects/${id}/tasks`} className="btn btn-primary">
                View Tasks
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="project-info">
        <div className="info-section">
          <h2>Description</h2>
          <p>{project.description}</p>
        </div>

        <div className="info-section">
          <h2>Project Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Owner:</strong> {project.owner?.name}
            </div>
            <div className="detail-item">
              <strong>Created:</strong>{" "}
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            {project.startDate && (
              <div className="detail-item">
                <strong>Start Date:</strong>{" "}
                {new Date(project.startDate).toLocaleDateString()}
              </div>
            )}
            {project.endDate && (
              <div className="detail-item">
                <strong>End Date:</strong>{" "}
                {new Date(project.endDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>Team Members ({project.members?.length || 0})</h2>
          <ul className="members-list">
            {project.members?.map((member) => (
              <li key={member.user._id} className="member-item">
                <div className="member-info">
                  <strong>{member.user.name}</strong>
                  <span className="member-role">{member.role}</span>
                </div>
                <span className="member-email">{member.user.email}</span>
              </li>
            ))}
          </ul>

          {canManageProject() && (
            <form onSubmit={handleAddMember} className="add-member-form">
              <label htmlFor="member-email" className="visually-hidden">
                Member email address
              </label>
              <input
                id="member-email"
                type="email"
                placeholder="Enter member email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={addingMember}
              >
                {addingMember ? "Adding..." : "Add Member"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
