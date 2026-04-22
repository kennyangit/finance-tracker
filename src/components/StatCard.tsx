import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { formatCurrency } from '@/utils/helpers';

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

interface StatCardProps {
  label: string;
  value: number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'income' | 'expense' | 'balance';
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel = 'vs mês anterior',
  icon,
  variant = 'default'
}: StatCardProps) {
  const getValueColor = (): string => {
    switch (variant) {
      case 'income':
        return 'var(--color-income)';
      case 'expense':
        return 'var(--color-expense)';
      case 'balance':
        if (value > 0) return 'var(--color-income)';
        if (value < 0) return 'var(--color-expense)';
        return 'var(--text-primary)';
      default:
        return 'var(--text-primary)';
    }
  };

  const getTrendColor = (): string => {
    if (!trend) return 'var(--text-tertiary)';
    return trend > 0 ? 'var(--color-income)' : 'var(--color-expense)';
  };

  const getTrendArrow = (): string => {
    if (!trend) return '';
    return trend > 0 ? '↑' : '↓';
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1.5rem',
    background: 'var(--card-bg)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border-subtle)',
    backdropFilter: 'blur(12px)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'space-between'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: getValueColor(),
    margin: 0,
    lineHeight: 1.2
  };

  const trendStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: getTrendColor(),
    marginTop: '0.25rem'
  };

  return (
    <motion.div
      className={cn('stat-card', variant)}
      style={containerStyle}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div style={headerStyle}>
        {icon && (
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '0.5rem',
              background: 'var(--bg-subtle)',
              color: 'var(--text-secondary)'
            }}
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        <span style={labelStyle}>{label}</span>
      </div>
      <p style={valueStyle}>{formatCurrency(value)}</p>
      {trend !== undefined && (
        <motion.div
          style={trendStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span style={{ fontWeight: 600 }}>
            {getTrendArrow()} {Math.abs(trend).toFixed(1)}%
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>{trendLabel}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
