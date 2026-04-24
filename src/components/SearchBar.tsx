import React, { useState, useEffect, useRef } from 'react';
import { debounce } from '@/utils/helpers';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalResults?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar transações...',
  totalResults = 0
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedChange = debounce((newValue: string) => {
    onChange(newValue);
  }, 300);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedChange(newValue);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar" style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        transition: 'border-color 0.2s',
        backdropFilter: 'blur(12px)'
      }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label="Buscar transações"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            fontSize: '1rem',
            color: 'var(--text-primary)',
            minWidth: 0
          }}
        />
        {totalResults > 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              padding: '0.25rem 0.5rem',
              background: 'var(--bg-subtle)',
              borderRadius: '0.25rem'
            }}
          >
            {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              background: 'var(--bg-subtle)',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: 0
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
