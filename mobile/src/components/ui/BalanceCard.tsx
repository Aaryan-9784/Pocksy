/**
 * BalanceCard — Signature Pocksy maroon card showing total balance
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';

const colors = Colors.light;

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.balance}>{formatAmount(balance)}</Text>

      <View style={styles.row}>
        <View style={styles.statItem}>
          <View style={[styles.indicator, styles.incomeIndicator]} />
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatAmount(income)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={[styles.indicator, styles.expenseIndicator]} />
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{formatAmount(expenses)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  label: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  balance: {
    fontSize: FontSize['4xl'],
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    letterSpacing: -1,
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  incomeIndicator: {
    backgroundColor: '#4ADE80',
  },
  expenseIndicator: {
    backgroundColor: '#FF9F9F',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSize.base,
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: Spacing.md,
  },
});
