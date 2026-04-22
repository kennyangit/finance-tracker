import React from 'react';
import { cn } from '@/utils/helpers';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  style
}: SkeletonProps) {
  const combinedStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
    ...style
  };

  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circular' && 'skeleton-circular',
        variant === 'text' && 'skeleton-text',
        className
      )}
      style={combinedStyle}
      aria-hidden="true"
    />
  );
}

export function TransactionCardSkeleton() {
  return (
    <div className="transaction-card-skeleton" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'var(--card-bg)',
      borderRadius: '0.75rem',
      marginBottom: '0.5rem',
      border: '1px solid var(--border-subtle)'
    }}>
      <Skeleton variant="circular" width={40} height={40} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={16} style={{ marginBottom: '0.5rem' }} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
      <div style={{ textAlign: 'right' }}>
        <Skeleton variant="text" width={80} height={16} style={{ marginBottom: '0.5rem' }} />
        <Skeleton variant="rectangular" width={60} height={20} />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card-skeleton" style={{
      padding: '1.5rem',
      background: 'var(--card-bg)',
      borderRadius: '0.75rem',
      border: '1px solid var(--border-subtle)'
    }}>
      <Skeleton variant="text" width="40%" height={14} style={{ marginBottom: '0.5rem' }} />
      <Skeleton variant="text" width="70%" height={28} style={{ marginBottom: '0.5rem' }} />
      <Skeleton variant="text" width="30%" height={12} />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="chart-skeleton" style={{
      padding: '1.5rem',
      background: 'var(--card-bg)',
      borderRadius: '0.75rem',
      border: '1px solid var(--border-subtle)',
      height: '300px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Skeleton variant="rectangular" width={120} height={20} />
        <Skeleton variant="circular" width={12} height={12} />
        <Skeleton variant="circular" width={12} height={12} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width="100%"
            height={`${40 + Math.random() * 60}%`}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
