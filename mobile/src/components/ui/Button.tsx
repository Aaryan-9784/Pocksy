/**
 * PocksyButton — Premium interactive button component
 * Supports gradient, solid, outline, ghost, and danger variants with tactile haptics
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';

type ButtonVariant = 'primary' | 'gradient' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PocksyButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  enableHaptics?: boolean;
}

const colors = Colors.light;

const sizeStyles: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number; minHeight: number }> = {
  sm: { paddingV: Spacing.xs, paddingH: Spacing.md, fontSize: FontSize.xs, minHeight: 36 },
  md: { paddingV: Spacing.sm, paddingH: Spacing.lg, fontSize: FontSize.sm, minHeight: 46 },
  lg: { paddingV: Spacing.md, paddingH: Spacing.xl, fontSize: FontSize.base, minHeight: 54 },
};

export function PocksyButton({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
  enableHaptics = true,
}: PocksyButtonProps) {
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    if (enableHaptics && Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress();
  };

  const isGradient = variant === 'primary' || variant === 'gradient';

  if (isGradient) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled }}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            {
              paddingVertical: s.paddingV,
              paddingHorizontal: s.paddingH,
              minHeight: s.minHeight,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text
                style={[
                  styles.text,
                  {
                    color: '#FFFFFF',
                    fontSize: s.fontSize,
                    marginLeft: icon ? Spacing.sm : 0,
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.primaryLight, text: colors.primary, border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', text: colors.primary, border: colors.border };
      case 'ghost':
        return { bg: 'transparent', text: colors.textPrimary, border: 'transparent' };
      case 'danger':
        return { bg: colors.danger, text: '#FFFFFF', border: 'transparent' };
      default:
        return { bg: colors.primary, text: '#FFFFFF', border: 'transparent' };
    }
  };

  const v = getVariantStyle();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          borderColor: v.border,
          borderWidth: v.border !== 'transparent' ? 1.5 : 0,
          minHeight: s.minHeight,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'outline' && { backgroundColor: colors.white },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              {
                color: v.text,
                fontSize: s.fontSize,
                marginLeft: icon ? Spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
  },
});

