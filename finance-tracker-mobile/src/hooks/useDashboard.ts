import { useMemo } from 'react';
import { useTransactions } from '../store/transactionStore';
import { MonthlySummary } from '../types';

export function useDashboard(): {
  summary: MonthlySummary | null;
  dailyBalances: { date: string; balance: number }[];
  healthStatus: 'good' | 'warning' | 'critical';
  topExpenseCategories: { category: string; amount: number; percentage: number }[];
  incomeTrend: { month: string; amount: number }[];
} {
  const { state } = useTransactions();
  const { transactions, selectedMonth, summary } = state;

  // Calculate daily balance evolution for the selected month
  const dailyBalances = useMemo(() => {
    const balances: { date: string; balance: number }[] = [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));

      const dayIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);

      const dayExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0);

      const previousBalance = balances.length > 0
        ? balances[balances.length - 1].balance
        : 0;

      balances.push({
        date: dateStr,
        balance: previousBalance + dayIncome - dayExpenses
      });
    }

    return balances;
  }, [transactions, selectedMonth]);

  // Determine health status based on savings rate
  const healthStatus = useMemo((): 'good' | 'warning' | 'critical' => {
    if (!summary) return 'critical';
    if (summary.savingsRate >= 20) return 'good';
    if (summary.savingsRate >= 0) return 'warning';
    return 'critical';
  }, [summary]);

  // Top expense categories sorted by amount
  const topExpenseCategories = useMemo(() => {
    if (!summary) return [];
    return [...summary.categoryBreakdown]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [summary]);

  // Income trend for the last 6 months
  const incomeTrend = useMemo(() => {
    const trends: { month: string; amount: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);

      trends.push({
        month: monthStr,
        amount: income
      });
    }

    return trends;
  }, [transactions]);

  return {
    summary,
    dailyBalances,
    healthStatus,
    topExpenseCategories,
    incomeTrend
  };
}
