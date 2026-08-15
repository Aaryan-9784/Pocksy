/**
 * Pocksy Tab Navigation Layout
 * Premium bottom tabs with elevated center FAB
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Shadows, BorderRadius } from '@/constants/theme';

const colors = Colors.light;

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={tabStyles.iconContainer}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icon}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

function AddButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={tabStyles.addButton}
      onPress={() => {
        router.push('/(tabs)/add');
      }}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Add transaction"
    >
      <Text style={tabStyles.addButtonIcon}>+</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingTop: Spacing.sm,
          paddingBottom: insets.bottom,
          ...Shadows.sm,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Activity" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarButton: () => <AddButton />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" label="Insights" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: FontWeight.semibold,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...Shadows.lg,
  },
  addButtonIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    lineHeight: 30,
  },
});
