import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme';
import { formatCurrency } from '../utils/helpers';

interface StatCardProps {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  variant?: 'default' | 'income' | 'expense' | 'balance';
  index?: number;
  isCurrency?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  variant = 'default',
  index = 0,
  isCurrency = true,
}: StatCardProps) {
  const getValueColor = (): string => {
    switch (variant) {
      case 'income':
        return colors.income;
      case 'expense':
        return colors.expense;
      case 'balance':
        if (value > 0) return colors.income;
        if (value < 0) return colors.expense;
        return colors.textPrimary;
      default:
        return colors.textPrimary;
    }
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'income':
        return colors.income;
      case 'expense':
        return colors.expense;
      case 'balance':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getIconBgColor = (): string => {
    switch (variant) {
      case 'income':
        return colors.incomeGlow;
      case 'expense':
        return colors.expenseGlow;
      case 'balance':
        return colors.primaryGlow;
      default:
        return colors.bgElevated;
    }
  };

  const displayValue = isCurrency
    ? formatCurrency(value)
    : `${value.toFixed(1)}%`;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400).springify()}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
          <Feather name={icon} size={18} color={getIconColor()} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: getValueColor() }]}>
        {displayValue}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
    padding: spacing.lg,
    backgroundColor: colors.bgCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: 28,
  },
});
