import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

const RecentTaskItem = React.memo(({ task }) => {
  const getStatusClass = (status) => {
    const statusMap = {
      'todo': 'statusTodo',
      'in-progress': 'statusInProgress',
      'review': 'statusReview',
      'done': 'statusDone'
    };
    return statusMap[status] || 'statusTodo';
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'low': 'priorityLow',
      'medium': 'priorityMedium',
      'high': 'priorityHigh',
      'critical': 'priorityCritical'
    };
    return priorityMap[priority] || 'priorityMedium';
  };

  return (
    <li className={styles.recentItem}>
      <div className={styles.recentItemInfo}>
        <h3>
          <Link to={`/projects/${task.project}/tasks`}>
            {task.title}
          </Link>
        </h3>
        <div className={styles.taskMeta}>
          <span className={`${styles.statusBadge} ${styles[getStatusClass(task.status || 'todo')]}`}>
            {task.status || 'todo'}
          </span>
          {task.priority && (
            <span className={`${styles.priorityBadge} ${styles[getPriorityClass(task.priority)]}`}>
              {task.priority}
            </span>
          )}
          {task.assignedTo?.name && (
            <span className={styles.assignedInfo}>
              👤 {task.assignedTo.name}
            </span>
          )}
        </div>
      </div>
      {task.dueDate && (
        <div className={`${styles.recentItemDate} ${styles.dueDate}`}>
          📅 Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </li>
  );
});

RecentTaskItem.displayName = 'RecentTaskItem';

export default RecentTaskItem;
