import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './Tasks.css';

const TaskForm = ({ projectId, task, onClose, onTaskCreated, onTaskUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: ''
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchProjectMembers = useCallback(async () => {
    try {
      const response = await API.get(`/projects/${projectId}`);
      const project = response.data.data;
      const members = project.members ? project.members.map(m => m.user) : [];
      setProjectMembers(members);
    } catch (error) {
      console.error('Error fetching project members:', error);
      toast.error('Failed to load project members');
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectMembers();
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    }
  }, [task, fetchProjectMembers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (formData.title.length > 200) {
      newErrors.title = 'Task title cannot exceed 200 characters';
    }
    if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      if (task) {
        // Update existing task
        const response = await API.put(`/tasks/${task._id}`, submitData);
        onTaskUpdated(response.data.data);
        toast.success('Task updated successfully');
      } else {
        // Create new task
        const response = await API.post(`/projects/${projectId}/tasks`, submitData);
        onTaskCreated(response.data.data);
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error saving task';
      toast.error(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyPress}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? '✏️ Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Enter clear, concise task title"
              maxLength="200"
              autoFocus
            />
            {errors.title && <span className="error-message">⚠️ {errors.title}</span>}
            <small className="character-count">
              {formData.title.length}/200 characters
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Add detailed task description (optional)"
              maxLength="1000"
              style={{ resize: 'vertical' }}
            />
            {errors.description && <span className="error-message">⚠️ {errors.description}</span>}
            <small className="character-count">
              {formData.description.length}/1000 characters
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="todo">📋 To Do</option>
                <option value="in-progress">⚙️ In Progress</option>
                <option value="review">👀 Review</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">📍 Low</option>
                <option value="medium">📌 Medium</option>
                <option value="high">🔴 High</option>
                <option value="critical">🚨 Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignedTo">Assign To</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option value="">👤 Unassigned</option>
                {projectMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  {task ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                task ? '✓ Update Task' : '✓ Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;