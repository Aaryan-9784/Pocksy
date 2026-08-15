/**
 * PocksyInput — Premium text input with label, focus glow, error state, and icon support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const colors = Colors.light;

interface PocksyInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function PocksyInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  ...inputProps
}: PocksyInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : isFocused
      ? colors.primary
      : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: isFocused ? colors.white : colors.offWhite,
          },
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 0 } : null,
            rightIcon ? { paddingRight: 0 } : null,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={colors.primary}
          {...inputProps}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  inputWrapperFocused: {
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  rightIcon: {
    marginLeft: Spacing.md,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing['2xs'],
    marginLeft: Spacing['2xs'],
  },
  error: {
    fontSize: FontSize.xs,
    color: colors.danger,
    fontWeight: FontWeight.medium,
  },
  hint: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: Spacing['2xs'],
    marginLeft: Spacing['2xs'],
  },
});

