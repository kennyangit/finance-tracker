import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onUndo?: () => void;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onUndo
}: TransactionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(transaction.id);
    setShowMenu(false);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Salário': '#10b981',
      'Freelance': '#3b82f6',
      'Investimento': '#8b5cf6',
      'Presente': '#f59e0b',
      'Moradia': '#ef4444',
      'Alimentação': '#f97316',
      'Transporte': '#14b8a6',
      'Saúde': '#ec4899',
      'Educação': '#6366f1',
      'Entretenimento': '#a855f7',
      'Compras': '#f43f5e',
      'Outro': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'income') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    );
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--card-bg)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border-subtle)',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
  };

  const iconContainerStyle = (type: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '0.75rem',
    background: type === 'income'
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(239, 68, 68, 0.1)',
    color: type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
    flexShrink: 0
  });

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  };

  const categoryBadgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.5rem',
    background: `${color}15`,
    color: color,
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500
  });

  const dateStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)'
  };

  const valueStyle = (type: string): React.CSSProperties => ({
    fontSize: '1.125rem',
    fontWeight: 700,
    color: type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
    textAlign: 'right' as const,
    marginBottom: '0.25rem'
  });

  const menuButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-tertiary)',
    opacity: isDeleting ? 0 : 1,
    transition: 'opacity 0.2s'
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2.5rem',
    right: '0.5rem',
    minWidth: '140px',
    background: 'var(--card-bg)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    overflow: 'hidden'
  };

  const menuItemStyle = (isDanger: boolean = false): React.CSSProperties => ({
    width: '100%',
    padding: '0.625rem 1rem',
    border: 'none',
    background: 'transparent',
    color: isDanger ? 'var(--danger)' : 'var(--text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background 0.2s'
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
        style={containerStyle}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
        role="listitem"
      >
        <div style={iconContainerStyle(transaction.type)}>
          {getTypeIcon(transaction.type)}
        </div>

        <div style={contentStyle}>
          <h3 style={titleStyle}>{transaction.title}</h3>
          <div style={metaStyle}>
            <span style={categoryBadgeStyle(getCategoryColor(transaction.category))}>
              {transaction.category}
            </span>
            <span style={dateStyle}>{formatDate(transaction.date)}</span>
          </div>
        </div>

        <div style={valueStyle(transaction.type)}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.value)}
        </div>

        <button
          ref={menuRef}
          style={menuButtonStyle}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Opções"
          aria-expanded={showMenu}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={menuStyle}
            >
              <button
                style={menuItemStyle()}
                onClick={() => {
                  setShowMenu(false);
                  onEdit(transaction);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
              <button
                style={menuItemStyle(true)}
                onClick={handleDelete}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Excluir
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
