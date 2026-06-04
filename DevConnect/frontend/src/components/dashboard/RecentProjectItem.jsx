import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

const RecentProjectItem = React.memo(({ project, formatDate, getProjectDescription }) => {
  return (
    <li className={styles.recentItem}>
      <div className={styles.recentItemInfo}>
        <h3>
          <Link to={`/projects/${project._id}`}>{project.name}</Link>
        </h3>
        <p>{getProjectDescription(project.description)}</p>
      </div>
      <div className={styles.recentItemMeta}>
        <span className={`${styles.statusBadge} ${styles[`status${project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Active'}`]}`}>
          {project.status || 'active'}
        </span>
        <span className={styles.recentItemDate}>
          {formatDate(project.createdAt)}
        </span>
      </div>
    </li>
  );
});

RecentProjectItem.displayName = 'RecentProjectItem';

export default RecentProjectItem;
