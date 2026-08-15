/**
 * Pocksy Profile Screen
 * Displays real user data and settings
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Avatar, PocksyButton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { CURRENCIES } from '@/constants/currency';

const colors = Colors.light;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const currencyCode = user?.currency || 'INR';
  const currencyConfig = CURRENCIES[currencyCode];
  const currencyDisplay = currencyConfig
    ? `${currencyCode} (${currencyConfig.symbol})`
    : currencyCode;

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation handled by root layout
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <Avatar name={user?.name || 'User'} size={64} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Pocksy User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@pocksy.app'}</Text>
        </View>
      </View>

      {/* Settings list */}
      <View style={styles.menuSection}>
        <MenuItem icon="💰" label="Currency" value={currencyDisplay} />
        <MenuItem
          icon="🎯"
          label="Monthly Budget"
          value={user?.monthlyBudget ? `₹${user.monthlyBudget.toLocaleString()}` : 'Not set'}
        />
        <MenuItem icon="🔔" label="Notifications" value="Coming soon" />
        <MenuItem icon="🌙" label="Dark Mode" value="Coming soon" />
        <MenuItem icon="🔒" label="Security" value="Coming soon" />
      </View>

      {/* Account info */}
      {user?.createdAt && (
        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoText}>
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      )}

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <PocksyButton
          title="Log Out"
          onPress={handleLogout}
          variant="outline"
        />
      </View>

      {/* Version */}
      <Text style={styles.version}>Pocksy v1.0.0</Text>
    </View>
  );
}

function MenuItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <TouchableOpacity style={menuStyles.item} activeOpacity={0.7}>
      <Text style={menuStyles.icon}>{icon}</Text>
      <Text style={menuStyles.label}>{label}</Text>
      <Text style={menuStyles.value}>{value}</Text>
      <Text style={menuStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  profileInfo: {
    marginLeft: Spacing.base,
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.white,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    marginBottom: Spacing.xl,
  },
  accountInfo: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  accountInfoText: {
    fontSize: FontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  logoutContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: colors.textMuted,
  },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  label: {
    flex: 1,
    fontSize: FontSize.base,
    color: colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize.sm,
    color: colors.textMuted,
    marginRight: Spacing.sm,
  },
  arrow: {
    fontSize: FontSize.lg,
    color: colors.textMuted,
  },
});
