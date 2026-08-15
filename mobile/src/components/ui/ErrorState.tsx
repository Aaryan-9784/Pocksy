/**
 * ErrorState — Error message with retry action
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { PocksyButton } from './Button';

const colors = Colors.light;

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <PocksyButton
          title="Try Again"
          onPress={onRetry}
          variant="secondary"
          size="md"
          fullWidth={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.base,
  },
  message: {
    fontSize: FontSize.base,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
});
