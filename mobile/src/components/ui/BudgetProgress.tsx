/**
 * BudgetProgress — Premium visual budget tracker with gradient bar and status indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';

const colors = Colors.light;

interface BudgetProgressProps {
  spent: number;
  total: number;
}

export function BudgetProgress({ spent, total }: BudgetProgressProps) {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isExceeded = percentage >= 100;
  const remaining = Math.max(total - spent, 0);

  const getStatusBadge = () => {
    if (isExceeded) {
      return {
        label: 'Exceeded',
        icon: 'alert-circle',
        color: colors.danger,
        bg: colors.dangerLight,
        gradient: ['#EF4444', '#DC2626'] as const,
      };
    }
    if (isWarning) {
      return {
        label: 'Near Limit',
        icon: 'warning',
        color: colors.warning,
        bg: colors.warningLight,
        gradient: ['#F59E0B', '#D97706'] as const,
      };
    }
    return {
      label: 'On Track',
      icon: 'checkmark-circle',
      color: colors.success,
      bg: colors.successLight,
      gradient: ['#10B981', '#059669'] as const,
    };
  };

  const status = getStatusBadge();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="pie-chart" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Monthly Budget</Text>
            <Text style={styles.subtitle}>
              {formatAmount(spent)} of {formatAmount(total)}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon as any} size={13} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={styles.barTrack}>
        <LinearGradient
          colors={status.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.barFill,
            { width: `${Math.min(Math.max(percentage, 3), 100)}%` },
          ]}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>
          {isExceeded
            ? `Exceeded by ${formatAmount(spent - total)}`
            : `${formatAmount(remaining)} left to spend`}
        </Text>
        <Text style={[styles.statusSummary, { color: status.color }]}>
          {status.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  barTrack: {
    height: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing['2xs'],
  },
  footerLabel: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  statusSummary: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});

