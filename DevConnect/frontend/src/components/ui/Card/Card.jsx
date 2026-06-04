import React from 'react';
import styles from './Card.module.css';

const Card = React.memo(({
  elevation = 'medium',
  padding = 'medium',
  hoverable = false,
  glowBorder = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[`card-elevation-${elevation}`],
    styles[`card-padding-${padding}`],
    hoverable && styles['card-hoverable'],
    glowBorder && styles['card-glow-border'],
    onClick && styles['card-clickable'],
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const cardProps = {
    className: cardClasses,
    ...props
  };

  if (onClick) {
    cardProps.onClick = handleClick;
    cardProps.role = 'button';
    cardProps.tabIndex = 0;
    cardProps.onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e);
      }
    };
  }

  return (
    <div {...cardProps}>
      {glowBorder && <div className={styles.glowBorderEffect} />}
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
