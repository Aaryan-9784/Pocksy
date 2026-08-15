/**
 * EmptyState — Polished empty state with decorative icon badge and CTA
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PocksyButton } from './Button';

const colors = Colors.light;

interface EmptyStateProps {
  icon?: string;
  vectorIcon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  vectorIcon = 'receipt-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircleOuter}>
        <View style={styles.iconCircleInner}>
          {vectorIcon ? (
            <Ionicons name={vectorIcon} size={36} color={colors.primary} />
          ) : (
            <Text style={styles.iconEmoji}>{icon || '📭'}</Text>
          )}
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <View style={styles.buttonWrapper}>
          <PocksyButton
            title={actionLabel}
            onPress={onAction}
            size="md"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  iconCircleOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircleInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  buttonWrapper: {
    marginTop: Spacing.xs,
  },
});

