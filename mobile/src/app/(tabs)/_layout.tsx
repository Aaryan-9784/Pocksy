/**
 * Pocksy Tab Navigation Layout
 * Premium bottom bar with sleek gradient Add action button, Ionicons, and responsive safe area handling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Shadows } from '@/constants/theme';

const colors = Colors.light;

interface TabIconProps {
  iconFocused: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}

function TabIcon({ iconFocused, iconOutline, label, focused }: TabIconProps) {
  return (
    <View style={tabStyles.iconContainer}>
      <Ionicons
        name={focused ? iconFocused : iconOutline}
        size={23}
        color={focused ? colors.primary : '#64748B'}
      />
      <Text
        style={[
          tabStyles.label,
          focused ? tabStyles.labelFocused : tabStyles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function CustomAddButton(props: any) {
  const handlePress = (e: any) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    props.onPress?.(e);
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      style={[props.style, tabStyles.addButtonContainer]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Add transaction"
    >
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tabStyles.addButtonCircle}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: '#EEF2F6',
          borderTopWidth: 1,
          height: 60 + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          ...Shadows.sm,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconFocused="home"
              iconOutline="home-outline"
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconFocused="receipt"
              iconOutline="receipt-outline"
              label="Activity"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarButton: (props) => <CustomAddButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconFocused="pie-chart"
              iconOutline="pie-chart-outline"
              label="Insights"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              iconFocused="person"
              iconOutline="person-outline"
              label="Profile"
              focused={focused}
            />
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
    paddingTop: 2,
    minWidth: 54,
  },
  label: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: -0.2,
  },
  labelInactive: {
    color: '#64748B',
    fontWeight: FontWeight.medium,
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    top: -8,
  },
  addButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#52131E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});



