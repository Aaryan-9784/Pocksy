/**
 * AppHeader — Fixed top navigation bar with project branding on the left & profile avatar on the right
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { Avatar } from './Avatar';
import { useAuthStore } from '@/store/authStore';

const colors = Colors.light;

export interface AppHeaderProps {
  showProfile?: boolean;
  onProfilePress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
}

export function AppHeader({
  showProfile = true,
  onProfilePress,
  showBack = false,
  onBackPress,
}: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const handleProfilePress = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/(tabs)/profile');
    }
  };

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

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topBar}>
        {/* Left Side: Brand Logo & Name or Back Button */}
        {showBack ? (
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
        ) : (
          <TouchableOpacity
            style={styles.brandContainer}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
            accessibilityLabel="Pocksy Home"
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.brandIcon}
            >
              <Ionicons name="wallet" size={16} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.brandTextGroup}>
              <Text style={styles.brandTitle}>Pocksy</Text>
              <Text style={styles.brandSubtitle}>Smart Wealth Manager</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Right Side: Profile Section */}
        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
            accessibilityLabel="View Profile"
            accessibilityRole="button"
          >
            <Avatar name={user?.name || 'AP'} size={38} showOnline={true} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
    marginTop: -1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  profileButton: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
