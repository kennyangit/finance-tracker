import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'info',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus trap
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      firstElement?.focus();
      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const dialogStyle: React.CSSProperties = {
    background: 'var(--card-bg)',
    backdropFilter: 'blur(12px)',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    border: '1px solid var(--border-subtle)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
  };

  const getConfirmButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      flex: 1,
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s'
    };

    switch (variant) {
      case 'danger':
        return {
          ...baseStyle,
          background: 'var(--danger)',
          color: 'white'
        };
      case 'warning':
        return {
          ...baseStyle,
          background: 'var(--warning)',
          color: 'white'
        };
      default:
        return {
          ...baseStyle,
          background: 'var(--primary)',
          color: 'white'
        };
    }
  };

  const dialog = (
    <div style={overlayStyle} onClick={onCancel}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="dialog-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}
        >
          {title}
        </h2>
        <p
          id="dialog-message"
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            lineHeight: 1.6
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            ref={confirmButtonRef}
            style={getConfirmButtonStyle()}
            onClick={onConfirm}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {confirmLabel}
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={onCancel}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
