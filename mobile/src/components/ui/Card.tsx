/**
 * PocksyCard — Rounded card with subtle shadow
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

const colors = Colors.light;

interface PocksyCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function PocksyCard({ children, style, padded = true }: PocksyCardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  padded: {
    padding: Spacing.base,
  },
});
