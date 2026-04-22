import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';
import { formatCurrency } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

interface DailyBalanceChartProps {
  data: { date: string; balance: number }[];
}

export function DailyBalanceChart({ data }: DailyBalanceChartProps) {
  const chartData = data
    .filter((_, i) => i % 2 === 0 || i === data.length - 1) // Show every other day to avoid crowding
    .map((d) => ({
      value: Math.max(d.balance, 0),
      label: d.date.split('-')[2],
      frontColor: d.balance >= 0 ? colors.primary : colors.expense,
    }));

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sem dados para exibir</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <BarChart
        data={chartData}
        barWidth={12}
        spacing={8}
        roundedTop
        roundedBottom
        hideRules
        xAxisThickness={1}
        yAxisThickness={0}
        xAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 9 }}
        noOfSections={4}
        width={screenWidth - 120}
        barBorderRadius={4}
        isAnimated
        animationDuration={600}
      />
    </View>
  );
}

interface IncomeTrendChartProps {
  data: { month: string; amount: number }[];
}

export function IncomeTrendChart({ data }: IncomeTrendChartProps) {
  const chartData = data.map((d) => ({
    value: d.amount,
    label: d.month.split('-')[1],
    dataPointText: '',
  }));

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sem dados suficientes</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <LineChart
        data={chartData}
        color={colors.income}
        thickness={2}
        hideRules
        xAxisThickness={1}
        yAxisThickness={0}
        xAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
        noOfSections={4}
        width={screenWidth - 120}
        curved
        isAnimated
        animationDuration={800}
        dataPointsColor={colors.income}
        dataPointsRadius={4}
        startFillColor={colors.incomeGlow}
        endFillColor="transparent"
        areaChart
      />
    </View>
  );
}

interface CategoryPieChartProps {
  data: { category: string; amount: number; percentage: number }[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const COLORS = [
    '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444',
    '#10b981', '#ec4899', '#3b82f6', '#f97316',
  ];

  const pieData = data.map((item, index) => ({
    value: item.amount,
    color: COLORS[index % COLORS.length],
    text: `${item.percentage.toFixed(0)}%`,
    textColor: '#fff',
    textSize: 11,
  }));

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sem dados</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.pieContainer}>
        <PieChart
          data={pieData}
          donut
          radius={80}
          innerRadius={50}
          innerCircleColor={colors.bgCardSolid}
          centerLabelComponent={() => (
            <View style={styles.pieCenter}>
              <Text style={styles.pieCenterValue}>{formatCurrency(total)}</Text>
              <Text style={styles.pieCenterLabel}>Total</Text>
            </View>
          )}
          isAnimated
        />
      </View>
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={item.category} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS[index % COLORS.length] },
              ]}
            />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.category}
            </Text>
            <Text style={styles.legendPercentage}>
              {item.percentage.toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.bgCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  emptyContainer: {
    height: 200,
    backgroundColor: colors.bgCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  pieContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pieCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  pieCenterLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  legendContainer: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  legendPercentage: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
