/**
 * StatCard — Compact stat display for income/expense summaries
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';

const colors = Colors.light;

interface StatCardProps {
  label: string;
  amount: number;
  icon: string;
  variant?: 'income' | 'expense' | 'neutral';
}

export function StatCard({ label, amount, icon, variant = 'neutral' }: StatCardProps) {
  const accentColor =
    variant === 'income'
      ? colors.income
      : variant === 'expense'
        ? colors.expense
        : colors.primary;

  const bgColor =
    variant === 'income'
      ? colors.successLight
      : variant === 'expense'
        ? colors.dangerLight
        : colors.primaryLight;

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color: accentColor }]}>
        {formatAmount(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
});
