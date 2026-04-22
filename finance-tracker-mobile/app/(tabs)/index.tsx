import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useTransactions } from '../../src/store/transactionStore';
import { StatCard } from '../../src/components/StatCard';
import { DailyBalanceChart, CategoryPieChart, IncomeTrendChart } from '../../src/components/Charts';
import { MonthSelector } from '../../src/components/MonthSelector';
import { DashboardSkeleton } from '../../src/components/LoadingSkeleton';
import { EmptyState } from '../../src/components/EmptyState';
import { getStatusColor, getStatusLabel, formatCurrency } from '../../src/utils/helpers';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { state, setSelectedMonth, fetchTransactions, fetchSummary } = useTransactions();
  const { summary, dailyBalances, healthStatus, topExpenseCategories, incomeTrend } = useDashboard();
  const { loading } = state;

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTransactions(), fetchSummary()]);
    setRefreshing(false);
  };

  const statusValue = healthStatus === 'good' ? 25 : healthStatus === 'warning' ? 10 : -5;

  if (loading && !summary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Painel</Text>
        <View style={[styles.healthBadge, { backgroundColor: `${getStatusColor(statusValue)}20` }]}>
          <View style={[styles.healthDot, { backgroundColor: getStatusColor(statusValue) }]} />
          <Text style={[styles.healthText, { color: getStatusColor(statusValue) }]}>{getStatusLabel(statusValue)}</Text>
        </View>
      </View>

      {/* Month Selector */}
      <MonthSelector selectedMonth={state.selectedMonth} onMonthChange={setSelectedMonth} />

      {!summary ? (
        <EmptyState icon="bar-chart-2" title="Nenhum dado disponível" message="Comece adicionando suas primeiras transações para ver o dashboard." />
      ) : (
        <>
          {/* Stat Cards */}
          <View style={styles.statsRow}>
            <StatCard label="Receitas" value={summary.totalIncome} icon="trending-up" variant="income" index={0} />
            <StatCard label="Despesas" value={summary.totalExpenses} icon="trending-down" variant="expense" index={1} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Saldo" value={summary.balance} icon="credit-card" variant="balance" index={2} />
          </View>

          {/* Charts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolução Diária</Text>
            <DailyBalanceChart data={dailyBalances} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendência de Receitas</Text>
            <IncomeTrendChart data={incomeTrend} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
            {summary.categoryBreakdown.length > 0 ? (
              <CategoryPieChart data={summary.categoryBreakdown} />
            ) : (
              <EmptyState icon="pie-chart" title="Sem despesas" message="Nenhuma despesa registrada neste mês." />
            )}
          </View>

          {/* Top Categories */}
          {topExpenseCategories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top 5 Categorias</Text>
              {topExpenseCategories.map((cat, i) => (
                <View key={cat.category} style={styles.categoryRow}>
                  <View style={styles.categoryRank}><Text style={styles.categoryRankText}>{i + 1}</Text></View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{cat.category}</Text>
                      <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
                    </View>
                    <View style={styles.barBg}><View style={[styles.barFill, { width: `${cat.percentage}%` }]} /></View>
                  </View>
                  <Text style={styles.categoryPct}>{cat.percentage.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing['5xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.textPrimary },
  healthBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  healthDot: { width: 8, height: 8, borderRadius: 4 },
  healthText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.bgCardSolid, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.borderSubtle, marginBottom: spacing.sm },
  categoryRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bgSubtle, alignItems: 'center', justifyContent: 'center' },
  categoryRankText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  categoryInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  categoryName: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textPrimary },
  categoryAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  barBg: { height: 4, backgroundColor: colors.bgSubtle, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  categoryPct: { fontSize: fontSize.xs, color: colors.textTertiary, minWidth: 36, textAlign: 'right' },
});
