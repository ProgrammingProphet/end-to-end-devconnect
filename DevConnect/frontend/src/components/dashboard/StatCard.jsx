import React from 'react';
import Card from '../ui/Card/Card';
import styles from './Dashboard.module.css';

const StatCard = React.memo(({ icon: Icon, color, value, label }) => {
  return (
    <Card elevation="medium" padding="medium" hoverable={true} glowBorder={true}>
      <div className={styles.statCardContent}>
        <div className={styles.statIcon} style={{ color }}>
          <Icon size={32} />
        </div>
        <div className={styles.statInfo}>
          <div className={styles.statNumber}>{value}</div>
          <div className={styles.statLabel}>{label}</div>
        </div>
      </div>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
