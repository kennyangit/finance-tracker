import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';
import { generateMonthsRange } from '../utils/helpers';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  maxMonths?: number;
}

function formatMonthShort(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  maxMonths = 24,
}: MonthSelectorProps) {
  const months = generateMonthsRange(maxMonths);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentIndex = months.indexOf(selectedMonth);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < months.length - 1;

  const handlePrev = () => {
    const prevMonth = months[currentIndex - 1];
    if (prevMonth) onMonthChange(prevMonth);
  };

  const handleNext = () => {
    const nextMonth = months[currentIndex + 1];
    if (nextMonth) onMonthChange(nextMonth);
  };

  // Auto-scroll to selected month
  useEffect(() => {
    if (scrollViewRef.current && currentIndex >= 0) {
      const itemWidth = 90; // approximate width of each pill
      const scrollX = Math.max(0, currentIndex * itemWidth - 100);
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [selectedMonth, currentIndex]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePrev}
        disabled={!canGoPrev}
        style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
        activeOpacity={0.7}
      >
        <Feather
          name="chevron-left"
          size={18}
          color={canGoPrev ? colors.textPrimary : colors.textMuted}
        />
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={90}
      >
        {months.map((month) => {
          const isSelected = month === selectedMonth;
          return (
            <TouchableOpacity
              key={month}
              onPress={() => onMonthChange(month)}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextSelected,
                ]}
              >
                {formatMonthShort(month)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        onPress={handleNext}
        disabled={!canGoNext}
        style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
        activeOpacity={0.7}
      >
        <Feather
          name="chevron-right"
          size={18}
          color={canGoNext ? colors.textPrimary : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCardSolid,
  },
  navButtonDisabled: {
    backgroundColor: 'transparent',
    opacity: 0.4,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSubtle,
    minWidth: 80,
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: '#ffffff',
    fontWeight: fontWeight.semibold,
  },
});
