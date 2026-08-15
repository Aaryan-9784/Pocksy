/**
 * PageTitle — Standardized attractive page header section for screen content
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

const colors = Colors.light;

export interface PageTitleProps {
  title: string;
  subtitle?: string;
  badge?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  noPaddingHorizontal?: boolean;
}

export function PageTitle({
  title,
  subtitle,
  badge,
  rightElement,
  style,
  noPaddingHorizontal = false,
}: PageTitleProps) {
  return (
    <View style={[styles.container, noPaddingHorizontal && styles.noPaddingHorizontal, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.titleWithBadge}>
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
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  noPaddingHorizontal: {
    paddingHorizontal: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  badgePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.heavy,
    color: colors.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  rightElement: {
    marginLeft: Spacing.md,
  },
});
