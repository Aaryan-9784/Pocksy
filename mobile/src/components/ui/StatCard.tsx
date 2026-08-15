/**
 * StatCard — Compact stat display with vector badges
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';

const colors = Colors.light;

interface StatCardProps {
  label: string;
  amount: number;
  icon?: string;
  vectorIcon?: keyof typeof Ionicons.glyphMap;
  variant?: 'income' | 'expense' | 'neutral';
}

export function StatCard({
  label,
  amount,
  icon,
  vectorIcon,
  variant = 'neutral',
}: StatCardProps) {
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

  const defaultVectorIcon: keyof typeof Ionicons.glyphMap =
    variant === 'income'
      ? 'arrow-down'
      : variant === 'expense'
        ? 'arrow-up'
        : 'wallet';

  const iconToRender = vectorIcon || defaultVectorIcon;

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        {iconToRender ? (
          <Ionicons name={iconToRender} size={18} color={accentColor} />
        ) : (
          <Text style={styles.icon}>{icon || '📊'}</Text>
        )}
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing['2xs'],
  },
  amount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
});

