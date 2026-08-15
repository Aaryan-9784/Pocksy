/**
 * Avatar — Luxury circular user avatar with LinearGradient fallback, outer ring, and online status badge
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontWeight } from '@/constants/theme';

const colors = Colors.light;

export interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: number;
  showOnline?: boolean;
  onlineColor?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AP';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  name = '',
  imageUrl,
  size = 44,
  showOnline = false,
  onlineColor = colors.success,
}: AvatarProps) {
  // Ring offset calculation for outer ring & inner circle
  const ringPadding = Math.max(3, Math.round(size * 0.07));
  const innerSize = size - ringPadding * 2;
  const fontSize = Math.round(innerSize * 0.42);
  const dotSize = Math.max(10, Math.round(size * 0.28));
  const dotBorder = Math.max(2, Math.round(size * 0.055));

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.avatarRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
            accessibilityLabel={`${name}'s avatar`}
          />
        ) : (
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.fallback,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
            accessibilityLabel={`${name}'s avatar`}
          >
            <Text
              style={[
                styles.initials,
                {
                  fontSize,
                  lineHeight: Math.round(fontSize * 1.22),
                },
              ]}
            >
              {getInitials(name || 'AP')}
            </Text>
          </LinearGradient>
        )}
      </View>

      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: dotBorder,
              backgroundColor: onlineColor,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 4px rgba(30, 23, 25, 0.06)',
      } as any,
      default: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
    }),
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  onlineDot: {
    position: 'absolute',
    borderColor: '#FFFFFF',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.15)',
      } as any,
      default: {},
    }),
  },
});


