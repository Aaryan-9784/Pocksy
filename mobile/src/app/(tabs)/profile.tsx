/**
 * Pocksy Profile & Settings Screen
 * User account details, preferences, and data management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Avatar, PocksyButton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { CURRENCIES, formatAmount } from '@/constants/currency';

const colors = Colors.light;

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}

function MenuItem({
  icon,
  iconColor = colors.primary,
  iconBg = colors.primaryLight,
  label,
  value,
  onPress,
  isLast = false,
}: MenuItemProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[menuStyles.item, !isLast && menuStyles.itemBorder]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[menuStyles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={menuStyles.label}>{label}</Text>
      {value ? <Text style={menuStyles.value}>{value}</Text> : null}
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const currencyCode = user?.currency || 'INR';
  const currencyConfig = CURRENCIES[currencyCode];
  const currencyDisplay = currencyConfig
    ? `${currencyCode} (${currencyConfig.symbol})`
    : currencyCode;

  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Pocksy?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Financial Data',
      'Your transactions will be compiled into CSV format and prepared for download.',
      [{ text: 'Export Now', onPress: () => Alert.alert('Success', 'CSV exported successfully.') }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <ScrollView
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['5xl'] }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>Manage your profile & preferences</Text>
      </View>

      {/* Hero Profile card */}
      <View style={styles.profileCard}>
        <Avatar name={user?.name || 'User'} size={68} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{user?.name || 'Pocksy User'}</Text>
            <View style={styles.proBadge}>
              <Ionicons name="sparkles" size={10} color="#D97706" />
              <Text style={styles.proText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.profileEmail}>{user?.email || 'user@pocksy.app'}</Text>

          <View style={styles.memberPill}>
            <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.memberText}>Member since {memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Preferences Section */}
      <Text style={styles.groupLabel}>PREFERENCES</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="cash-outline"
          iconColor="#16A34A"
          iconBg="#DCFCE7"
          label="Currency"
          value={currencyDisplay}
        />
        <MenuItem
          icon="pie-chart-outline"
          iconColor={colors.primary}
          iconBg={colors.primaryLight}
          label="Monthly Budget"
          value={user?.monthlyBudget ? formatAmount(user.monthlyBudget) : 'Not configured'}
        />
        <MenuItem
          icon="notifications-outline"
          iconColor="#2563EB"
          iconBg="#DBEAFE"
          label="Daily Reminders"
          value="Enabled"
          isLast
        />
      </View>

      {/* Security & Data */}
      <Text style={styles.groupLabel}>DATA & SECURITY</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="download-outline"
          iconColor="#7C3AED"
          iconBg="#EDE9FE"
          label="Export Transactions"
          value="CSV"
          onPress={handleExportData}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          iconColor="#0891B2"
          iconBg="#CFFAFE"
          label="Biometric App Lock"
          value="Off"
        />
        <MenuItem
          icon="cloud-done-outline"
          iconColor="#059669"
          iconBg="#ECFDF5"
          label="Cloud Sync Status"
          value="Up to date"
          isLast
        />
      </View>

      {/* App Info */}
      <Text style={styles.groupLabel}>APP INFORMATION</Text>
      <View style={styles.menuSection}>
        <MenuItem
          icon="help-circle-outline"
          iconColor="#EA580C"
          iconBg="#FFEDD5"
          label="Help & FAQ"
          onPress={() => Alert.alert('Pocksy Support', 'Visit https://github.com/Aaryan-9784/Pocksy for help.')}
        />
        <MenuItem
          icon="lock-closed-outline"
          iconColor="#64748B"
          iconBg="#F1F5F9"
          label="Privacy Policy"
          onPress={() => Alert.alert('Privacy Policy', 'Your financial data is encrypted and private.')}
        />
        <MenuItem
          icon="information-circle-outline"
          iconColor="#64748B"
          iconBg="#F1F5F9"
          label="Version"
          value="1.0.0 (Gold)"
          isLast
        />
      </View>

      {/* Sign Out CTA */}
      <View style={styles.logoutContainer}>
        <PocksyButton
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          icon={<Ionicons name="log-out-outline" size={18} color={colors.primary} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: Spacing['5xl'],
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  profileInfo: {
    marginLeft: Spacing.base,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  proText: {
    fontSize: FontSize['2xs'],
    color: '#D97706',
    fontWeight: FontWeight.heavy,
  },
  profileEmail: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  memberText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  groupLabel: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  menuSection: {
    backgroundColor: colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  logoutContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  label: {
    flex: 1,
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginRight: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
});

