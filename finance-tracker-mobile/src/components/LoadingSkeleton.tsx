import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '../theme';

function Skeleton({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => { opacity.value = withRepeat(withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true); }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ width: width as any, height, backgroundColor: colors.bgElevated, borderRadius: borderRadius.sm }, style, animStyle]} />;
}

export function TransactionCardSkeleton() {
  return (
    <View style={s.card}>
      <Skeleton width={44} height={44} style={{ borderRadius: borderRadius.md }} />
      <View style={{ flex: 1 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={12} />
      </View>
      <View>
        <Skeleton width={80} height={16} style={{ marginBottom: 8 }} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View style={s.statCard}>
      <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={28} style={{ marginBottom: 8 }} />
      <Skeleton width="30%" height={12} />
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={s.statsRow}>
        {[0, 1].map(i => <StatCardSkeleton key={i} />)}
      </View>
      <View style={s.statsRow}>
        {[2, 3].map(i => <StatCardSkeleton key={i} />)}
      </View>
      <Skeleton width="100%" height={200} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.bgCardSolid, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.borderSubtle, marginBottom: spacing.sm },
  statCard: { flex: 1, padding: spacing.lg, backgroundColor: colors.bgCardSolid, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.borderSubtle },
  statsRow: { flexDirection: 'row', gap: spacing.md },
});
