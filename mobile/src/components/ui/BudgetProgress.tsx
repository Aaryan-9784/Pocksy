/**
 * BudgetProgress — Visual budget progress bar
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';

const colors = Colors.light;

interface BudgetProgressProps {
  spent: number;
  total: number;
}

export function BudgetProgress({ spent, total }: BudgetProgressProps) {
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;
  const remaining = Math.max(total - spent, 0);

  const barColor = isExceeded
    ? colors.danger
    : isWarning
      ? colors.warning
      : colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Monthly Budget</Text>
        <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
      </View>

      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.spent}>
          {formatAmount(spent)} of {formatAmount(total)}
        </Text>
        {isExceeded ? (
          <Text style={styles.exceeded}>Budget exceeded</Text>
        ) : isWarning ? (
          <Text style={styles.warning}>
            {formatAmount(remaining)} remaining
          </Text>
        ) : (
          <Text style={styles.remaining}>
            {formatAmount(remaining)} remaining
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  percentage: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  barContainer: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spent: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
  },
  remaining: {
    fontSize: FontSize.xs,
    color: colors.income,
    fontWeight: FontWeight.medium,
  },
  warning: {
    fontSize: FontSize.xs,
    color: colors.warning,
    fontWeight: FontWeight.medium,
  },
  exceeded: {
    fontSize: FontSize.xs,
    color: colors.danger,
    fontWeight: FontWeight.medium,
  },
});
