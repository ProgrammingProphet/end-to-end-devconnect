import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Skeleton from '../ui/Skeleton/Skeleton';
import toast from 'react-hot-toast';
import './Tasks.css';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { projectId } = useParams();

  const columns = [
    { id: 'todo', title: '📋 To Do', colorClass: 'column-todo' },
    { id: 'in-progress', title: '⚙️ In Progress', colorClass: 'column-in-progress' },
    { id: 'review', title: '👀 Review', colorClass: 'column-review' },
    { id: 'done', title: '✅ Done', colorClass: 'column-done' }
  ];

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(`/projects/${projectId}/tasks`);
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setEditingTask(null);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(task => task._id !== taskId));
  };

  const handleMoveTask = async (taskId, newStatus) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistically update UI
    const updatedTasks = tasks.map(t =>
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task moved successfully');
    } catch (error) {
      setTasks(tasks);
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      toast.error(errorMessage);
      console.error('Update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="task-board-container page-enter">
        <div className="task-board-header">
          <div>
            <Skeleton variant="text" width="200px" height="36px" />
            <Skeleton variant="text" width="120px" height="16px" />
          </div>
          <Skeleton variant="rectangular" width="150px" height="48px" />
        </div>

        <div className="task-board">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="task-column column-todo">
              <div className="column-header">
                <Skeleton variant="text" width="120px" height="24px" />
                <Skeleton variant="circular" width="32px" height="32px" />
              </div>
              <div className="column-content">
                {[1, 2, 3].map((card) => (
                  <div key={card} style={{ 
                    background: 'var(--color-card-bg)', 
                    padding: 'var(--space-2)', 
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <Skeleton variant="text" width="80%" height="20px" />
                    <Skeleton variant="text" width="100%" height="16px" />
                    <Skeleton variant="text" width="60%" height="16px" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="task-board-container page-enter">
      <div className="task-board-header">
        <div>
          <h1>Task Board</h1>
          <p className="subtitle">{tasks.length} total tasks</p>
        </div>
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => setShowTaskForm(true)}
          aria-label="Add new task"
        >
          + Add New Task
        </button>
      </div>

      <div className="task-board">
        {columns.map(column => (
          <div
            key={column.id}
            className={`task-column ${column.colorClass}`}
          >
            <div className="column-header">
              <h2>{column.title}</h2>
              <span className="task-count">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>

            <div className="column-content">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    columns={columns}
                    onEdit={() => setEditingTask(task)}
                    onDelete={handleTaskDeleted}
                    onUpdate={handleTaskUpdated}
                    onMove={handleMoveTask}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskForm && (
        <TaskForm
          projectId={projectId}
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {editingTask && (
        <TaskForm
          projectId={projectId}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default TaskBoard;
