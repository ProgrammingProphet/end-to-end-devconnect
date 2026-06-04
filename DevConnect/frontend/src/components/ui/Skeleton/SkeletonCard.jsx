import React from 'react';
import Card from '../Card/Card';
import Skeleton from './Skeleton';
import './Skeleton.module.css';

const SkeletonCard = React.memo(({ count = 1 }) => {
  const cards = Array.from({ length: count }, (_, index) => (
    <Card key={index} elevation="medium" padding="medium">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Skeleton variant="text" width="70%" height="24px" />
        <Skeleton variant="text" width="100%" height="16px" />
        <Skeleton variant="text" width="90%" height="16px" />
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <Skeleton variant="rectangular" width="80px" height="32px" />
          <Skeleton variant="rectangular" width="80px" height="32px" />
        </div>
      </div>
    </Card>
  ));

  return <>{cards}</>;
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;
