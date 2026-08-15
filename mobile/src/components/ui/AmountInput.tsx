/**
 * AmountInput — Large numeric input with currency symbol
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { DEFAULT_CURRENCY } from '@/constants/currency';

const colors = Colors.light;

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
}

export function AmountInput({
  value,
  onChangeText,
  error,
  placeholder = '0',
}: AmountInputProps) {
  const handleChange = (text: string) => {
    // Only allow numbers and a single decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    onChangeText(cleaned);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How much?</Text>
      <View style={styles.inputRow}>
        <Text style={[styles.currency, value ? styles.currencyActive : null]}>
          {DEFAULT_CURRENCY.symbol}
        </Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          selectionColor={colors.primary}
          accessibilityLabel="Amount"
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  label: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.base,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: FontSize['3xl'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    marginRight: Spacing.xs,
  },
  currencyActive: {
    color: colors.textPrimary,
  },
  input: {
    fontSize: FontSize['4xl'],
    color: colors.textPrimary,
    fontWeight: FontWeight.bold,
    minWidth: 100,
    textAlign: 'center',
    letterSpacing: -1,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  error: {
    fontSize: FontSize.xs,
    color: colors.danger,
    marginTop: Spacing.sm,
  },
});
