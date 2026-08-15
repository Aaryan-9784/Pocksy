/**
 * Avatar — User avatar with LinearGradient fallback and border ring
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Shadows } from '@/constants/theme';

const colors = Colors.light;

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  return 'U';
}

export function Avatar({ name = '', imageUrl, size = 44 }: AvatarProps) {
  const fontSize = Math.round(size * 0.38);

  if (imageUrl) {
    return (
      <View style={[styles.avatarRing, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 },
          ]}
          accessibilityLabel={`${name}'s avatar`}
        />
      </View>
    );
  }

  return (
    <View style={[styles.avatarRing, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.fallback,
          { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 },
        ]}
        accessibilityLabel={`${name}'s avatar`}
      >
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials(name || '?')}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
    ...Shadows.sm,
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
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
});

