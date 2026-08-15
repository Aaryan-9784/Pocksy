/**
 * Pocksy Tab Navigation Layout
 * Premium bottom bar with spacious label rendering, perfectly centered top/bottom margins, and elevated middle Add button
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Shadows } from '@/constants/theme';

const colors = Colors.light;

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
        style={tabStyles.addButtonSquare}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
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
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 76 + (insets.bottom > 0 ? insets.bottom : 0),
          paddingTop: 6,
          paddingBottom: bottomPadding,
          ...Shadows.md,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          marginBottom: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: FontWeight.semibold,
          marginTop: 1,
          letterSpacing: -0.2,
        },
      }}
    >
      {/* 1: Home */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 2: Activity */}
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 3: Middle Add Button */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => <CustomAddButton {...props} />,
        }}
      />

      {/* 4: Insights */}
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 5: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    top: -18,
    zIndex: 10,
  },
  addButtonSquare: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#4A121D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 18px rgba(107, 30, 43, 0.38)',
      } as any,
      default: {
        shadowColor: '#4A121D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
    }),
  },
});
