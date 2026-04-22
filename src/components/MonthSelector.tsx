import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { generateMonthsRange } from '@/utils/helpers';

const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (isSelected: boolean) => ({
    opacity: 1,
    scale: isSelected ? 1 : 1,
    transition: {
      duration: 0.2
    }
  }),
  hover: {
    scale: 1.05
  },
  tap: {
    scale: 0.95
  }
};

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  maxMonths?: number;
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  maxMonths = 24
}: MonthSelectorProps) {
  const months = generateMonthsRange(maxMonths);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handlePrev = () => {
    const prevMonth = months[months.indexOf(selectedMonth) - 1];
    if (prevMonth) onMonthChange(prevMonth);
  };

  const handleNext = () => {
    const nextMonth = months[months.indexOf(selectedMonth) + 1];
    if (nextMonth) onMonthChange(nextMonth);
  };

  const currentIndex = months.indexOf(selectedMonth);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < months.length - 1;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const scrollContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    padding: '0.25rem',
    flex: 1,
    WebkitOverflowScrolling: 'touch',
    scrollSnapType: 'x mandatory'
  };

  const scrollItemStyle: React.CSSProperties = {
    scrollSnapAlign: 'center',
    flexShrink: 0
  };

  // Scroll para o mês selecionado quando mudar
  useEffect(() => {
    const container = scrollContainerRef.current;
    const selectedButton = monthButtonRefs.current.get(selectedMonth);

    if (container && selectedButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();

      // Calcular posição para centralizar o botão selecionado
      const scrollLeft = selectedButton.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [selectedMonth]);

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const pillStyle = (_month: string, isSelected: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '2rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: isSelected ? 600 : 400,
    color: isSelected ? 'white' : 'var(--text-secondary)',
    background: isSelected
      ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
      : 'var(--bg-subtle)',
    transition: 'all 0.2s',
    minWidth: 'max-content'
  });

  return (
    <div style={containerStyle}>
      <motion.button
        onClick={handlePrev}
        disabled={!canGoPrev}
        aria-label="Mês anterior"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: canGoPrev ? 'var(--card-bg)' : 'transparent',
          color: canGoPrev ? 'var(--text-primary)' : 'var(--text-tertiary)',
          cursor: canGoPrev ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s'
        }}
        whileHover={canGoPrev ? { scale: 1.1, x: -2 } : {}}
        whileTap={canGoPrev ? { scale: 0.9 } : {}}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </motion.button>

      <motion.div
        ref={scrollContainerRef}
        style={scrollContainerStyle}
        variants={containerVariants}
        animate="animate"
      >
        {months.map((month, index) => (
          <motion.button
            key={month}
            ref={(el) => {
              if (el) {
                monthButtonRefs.current.set(month, el);
              } else {
                monthButtonRefs.current.delete(month);
              }
            }}
            onClick={() => onMonthChange(month)}
            className={cn('month-pill')}
            style={{ ...pillStyle(month, month === selectedMonth), ...scrollItemStyle }}
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            custom={month === selectedMonth}
            transition={{ delay: index * 0.03 }}
          >
            {formatMonthShort(month)}
          </motion.button>
        ))}
      </motion.div>

      <motion.button
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Próximo mês"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: canGoNext ? 'var(--card-bg)' : 'transparent',
          color: canGoNext ? 'var(--text-primary)' : 'var(--text-tertiary)',
          cursor: canGoNext ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s'
        }}
        whileHover={canGoNext ? { scale: 1.1, x: 2 } : {}}
        whileTap={canGoNext ? { scale: 0.9 } : {}}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </motion.button>
    </div>
  );
}

function formatMonthShort(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit'
  }).format(date);
}
