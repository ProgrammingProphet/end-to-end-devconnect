import React from 'react';
import './Skeleton.module.css';

const Skeleton = React.memo(({ 
  variant = 'text', 
  width, 
  height, 
  className = '',
  count = 1 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton skeleton-${variant} ${className}`}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1em' : undefined)
      }}
    />
  ));

  return count === 1 ? skeletons[0] : <>{skeletons}</>;
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;
