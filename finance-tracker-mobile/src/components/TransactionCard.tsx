import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme';
import { categoryColors } from '../theme';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  index = 0,
}: TransactionCardProps) {
  const [showActions, setShowActions] = useState(false);
  const isIncome = transaction.type === 'income';
  const categoryColor = categoryColors[transaction.category] || colors.textMuted;

  const handleLongPress = () => {
    Alert.alert(
      transaction.title,
      'O que deseja fazer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => onEdit(transaction) },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Excluir Transação',
              'Tem certeza que deseja excluir esta transação?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Excluir',
                  style: 'destructive',
                  onPress: () => onDelete(transaction.id),
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 60).duration(300)}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.7}
        onLongPress={handleLongPress}
        onPress={() => onEdit(transaction)}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isIncome
                ? colors.incomeGlow
                : colors.expenseGlow,
            },
          ]}
        >
          <Feather
            name={isIncome ? 'arrow-up-right' : 'arrow-down-left'}
            size={20}
            color={isIncome ? colors.income : colors.expense}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {transaction.title}
          </Text>
          <View style={styles.meta}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${categoryColor}20` },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {transaction.category}
              </Text>
            </View>
            <Text style={styles.date}>{formatDate(transaction.date)}</Text>
          </View>
        </View>

        <View style={styles.valueContainer}>
          <Text
            style={[
              styles.value,
              { color: isIncome ? colors.income : colors.expense },
            ]}
          >
            {isIncome ? '+' : '-'} {formatCurrency(transaction.value)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bgCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
