/**
 * Avatar — User avatar with fallback initials
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

const colors = Colors.light;

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name = '', imageUrl, size = 44 }: AvatarProps) {
  const fontSize = size * 0.38;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        accessibilityLabel={`${name}'s avatar`}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityLabel={`${name}'s avatar`}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials(name || '?')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
