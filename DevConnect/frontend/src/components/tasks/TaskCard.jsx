import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiMessageCircle, FiX, FiMoreVertical } from 'react-icons/fi';
import Badge from '../ui/Badge/Badge';
import './Tasks.css';

const TaskCard = ({ task, onEdit, onDelete, onUpdate, onMove, columns }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(task.comments || []);
  const [addingComment, setAddingComment] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const priorityConfig = {
    low: { color: 'var(--color-success)', borderColor: 'var(--color-success)', label: 'Low', icon: '📍' },
    medium: { color: 'var(--color-warning)', borderColor: 'var(--color-warning)', label: 'Medium', icon: '📌' },
    high: { color: 'var(--color-error)', borderColor: 'var(--color-error)', label: 'High', icon: '🔴' },
    critical: { color: '#DC2626', borderColor: '#DC2626', label: 'Critical', icon: '🚨' }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await API.delete(`/tasks/${task._id}`);
        onDelete(task._id);
        toast.success('Task deleted successfully');
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting task';
        toast.error(errorMessage);
      }
    }
  };

  const handleMove = (newStatus) => {
    setShowMoveMenu(false);
    if (onMove) {
      onMove(task._id, newStatus);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setAddingComment(true);
    try {
      const response = await API.post(`/tasks/${task._id}/comments`, {
        text: newComment.trim()
      });
      setComments(response.data.data.comments || []);
      setNewComment('');
      toast.success('Comment added');
      onUpdate({ ...task, comments: response.data.data.comments });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error adding comment';
      toast.error(errorMessage);
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentIndex) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      const updatedComments = comments.filter((_, index) => index !== commentIndex);
      
      const response = await API.put(`/tasks/${task._id}`, {
        comments: updatedComments
      });
      
      setComments(response.data.data.comments || []);
      onUpdate(response.data.data);
      toast.success('Comment deleted');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error deleting comment';
      toast.error(errorMessage);
    }
  };

  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;

  // Get initials from assignee name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Map priority to badge variant
  const getPriorityBadgeVariant = (priority) => {
    const variantMap = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return variantMap[priority] || 'neutral';
  };

  return (
    <div 
      className="task-card" 
      style={{ borderLeftColor: priorityInfo.borderColor }}
    >
      <div className="task-card-header">
        <div className="task-title-section">
          <h4 className="task-title">{task.title}</h4>
          {task.priority && (
            <Badge 
              variant={getPriorityBadgeVariant(task.priority)}
              size="small"
            >
              {priorityInfo.icon} {priorityInfo.label}
            </Badge>
          )}
        </div>
        <div className="task-actions">
          {onMove && columns && (
            <div className="move-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoveMenu(!showMoveMenu);
                }} 
                className="icon-btn move-btn" 
                title="Move to column"
                aria-label="Move task to another column"
              >
                <FiMoreVertical />
              </button>
              {showMoveMenu && (
                <div className="move-menu">
                  {columns.map(column => (
                    <button
                      key={column.id}
                      className={`move-option ${column.id === task.status ? 'active' : ''}`}
                      onClick={() => handleMove(column.id)}
                      style={{ borderLeftColor: column.color }}
                      disabled={column.id === task.status}
                    >
                      {column.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }} 
            className="icon-btn edit-btn" 
            title="Edit task"
            aria-label="Edit task"
          >
            <FiEdit2 />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }} 
            className="icon-btn delete-btn" 
            title="Delete task"
            aria-label="Delete task"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.assignedTo && (
          <div className="assigned-badge">
            <span className="avatar" title={task.assignedTo.name}>
              {getInitials(task.assignedTo.name)}
            </span>
            <span className="assigned-name">{task.assignedTo.name}</span>
          </div>
        )}

        {task.dueDate && (
          <Badge variant="info" size="small">
            📅 {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
          </Badge>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="neutral" size="small">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="task-footer">
        <button 
          className="comments-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
          aria-label={`${showComments ? 'Hide' : 'Show'} comments (${comments.length})`}
        >
          <FiMessageCircle size={16} /> {comments.length}
        </button>
        <span className="created-by">
          by {task.createdBy?.name || 'Unknown'}
        </span>
      </div>

      {showComments && (
        <div className="task-comments-section">
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">No comments yet</div>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <div className="comment-header">
                    <strong className="comment-author">
                      {comment.user?.name || 'Unknown'}
                    </strong>
                    <button
                      className="comment-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComment(index);
                      }}
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <small className="comment-time">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </small>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <label htmlFor={`comment-input-${task._id}`} className="visually-hidden">
              Add a comment
            </label>
            <input
              id={`comment-input-${task._id}`}
              type="text"
              placeholder="Add a comment... (press Enter)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={addingComment}
              className="comment-input"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              type="submit" 
              disabled={addingComment || !newComment.trim()}
              className="comment-submit-btn"
              title="Post comment"
              aria-label="Post comment"
            >
              {addingComment ? '...' : '→'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
