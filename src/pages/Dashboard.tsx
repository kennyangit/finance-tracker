import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/useDashboard';
import { useTransactions } from '@/store/transactionStore';
import { StatCard } from '@/components/StatCard';
import { DailyBalanceChart, CategoryPieChart, IncomeTrendChart } from '@/components/Charts';
import { MonthSelector } from '@/components/MonthSelector';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { getStatusColor, getStatusLabel, formatCurrency } from '@/utils/helpers';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

export function Dashboard() {
  const { state, setSelectedMonth } = useTransactions();
  const { summary, dailyBalances, healthStatus, topExpenseCategories, incomeTrend } = useDashboard();
  const { loading } = state;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '1.5rem'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)'
  };

  const healthIndicatorStyle = (_status: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    background: `${getStatusColor(healthStatus === 'good' ? 25 : healthStatus === 'warning' ? 10 : -5)}20`,
    color: getStatusColor(healthStatus === 'good' ? 25 : healthStatus === 'warning' ? 10 : -5)
  });

  const chartsRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  };

  if (loading && !summary) {
    return (
      <div style={containerStyle}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={containerStyle}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center',
          padding: '3rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--color-income)' }}>
            <FontAwesomeIcon icon={faSackDollar} size="4x" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Nenhum dado disponível
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Comece adicionando suas primeiras transações para ver o dashboard.
          </p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Receitas',
      value: summary.totalIncome,
      icon: <TrendingUp size={20} />,
      variant: 'income' as const,
      trend: undefined
    },
    {
      label: 'Despesas',
      value: summary.totalExpenses,
      icon: <TrendingDown size={20} />,
      variant: 'expense' as const,
      trend: undefined
    },
    {
      label: 'Saldo',
      value: summary.balance,
      icon: <Wallet size={20} />,
      variant: 'balance' as const,
      trend: undefined
    }
  ] as const;

  return (
    <motion.div
      style={containerStyle}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div style={headerStyle} variants={itemVariants}>
        <h1 style={titleStyle}>Painel</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={healthIndicatorStyle(healthStatus)}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'currentColor'
            }} />
            {getStatusLabel(healthStatus === 'good' ? 25 : healthStatus === 'warning' ? 10 : -5)}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <MonthSelector
          selectedMonth={state.selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </motion.div>

      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}
        variants={containerVariants}
      >
        {statsCards.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div style={chartsRowStyle} variants={containerVariants}>
        <motion.div style={{ display: 'flex', flexDirection: 'column' }} variants={itemVariants}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Evolução Diária
          </h3>
          {dailyBalances.length > 0 ? (
            <DailyBalanceChart data={dailyBalances} />
          ) : (
            <div style={{
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--card-bg)',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)'
            }}>
              Sem dados para o mês selecionado
            </div>
          )}
        </motion.div>

        <motion.div style={{ display: 'flex', flexDirection: 'column' }} variants={itemVariants}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Tendência de Receitas
          </h3>
          {incomeTrend.length > 0 ? (
            <IncomeTrendChart data={incomeTrend} />
          ) : (
            <div style={{
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--card-bg)',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)'
            }}>
              Sem dados suficientes
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div style={{ marginTop: '1rem' }} variants={itemVariants}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Despesas por Categoria
        </h3>
        {summary.categoryBreakdown.length > 0 ? (
          <CategoryPieChart data={summary.categoryBreakdown} />
        ) : (
          <div style={{
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--card-bg)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-tertiary)'
          }}>
            Nenhuma despesa registrada no mês
          </div>
        )}
      </motion.div>

      <motion.div style={{ marginTop: '1rem' }} variants={itemVariants}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Top 5 Categorias de Despesa
        </h3>
        {topExpenseCategories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topExpenseCategories.map((cat, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'var(--card-bg)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{cat.category}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(cat.amount)}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${cat.percentage}%`,
                      height: '100%',
                      background: 'var(--primary)',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {cat.percentage.toFixed(1)}%
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--card-bg)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-tertiary)'
          }}>
            Nenhuma despesa registrada no mês
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
