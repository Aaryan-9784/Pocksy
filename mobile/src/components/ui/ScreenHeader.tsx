/**
 * ScreenHeader — Standardized luxury mobile header with navigation, typography hierarchy, status badges, and action buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';

const colors = Colors.light;

export interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
  badgeDot?: boolean;
  color?: string;
}

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightActions?: HeaderAction[];
  children?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  badge,
  showBack = false,
  onBackPress,
  rightActions = [],
  children,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleActionPress = (action: HeaderAction) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    action.onPress();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) }]}>
      <View style={styles.topRow}>
        {/* Left Side: Back button */}
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {/* Center/Left Titles */}
        <View style={[styles.textGroup, showBack && { marginLeft: Spacing.sm }]}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {badge ? (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right Actions */}
        {rightActions.length > 0 && (
          <View style={styles.actionsGroup}>
            {rightActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.7}
                accessibilityLabel={action.accessibilityLabel || 'Header action'}
                accessibilityRole="button"
              >
                <Ionicons
                  name={action.icon}
                  size={19}
                  color={action.color || colors.textPrimary}
                />
                {action.badgeDot && <View style={styles.badgeDot} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Embedded Children (e.g. Search Bar, Segmented Control) */}
      {children && <View style={styles.childrenWrapper}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  textGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  badgePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.heavy,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    ...Shadows.sm,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  childrenWrapper: {
    marginTop: Spacing.sm,
  },
});
