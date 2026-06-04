import React from 'react';
import styles from './Badge.module.css';

const Badge = React.memo(({
  variant = 'neutral',
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  const badgeClasses = [
    styles.badge,
    styles[`badge-${variant}`],
    styles[`badge-${size}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
