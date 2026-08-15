/**
 * CategoryIcon — Renders a category icon with colored background badge
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors } from '@/constants/theme';
import { getCategoryById } from '@/constants/categories';

interface CategoryIconProps {
  categoryId: string;
  size?: number;
  iconSize?: number;
  variant?: 'rounded' | 'circle';
}

export function CategoryIcon({
  categoryId,
  size = 44,
  iconSize,
  variant = 'rounded',
}: CategoryIconProps) {
  const category = getCategoryById(categoryId);
  const calculatedIconSize = iconSize || Math.round(size * 0.5);
  const borderRadius = variant === 'circle' ? size / 2 : Math.round(size * 0.28);

  const iconName = (category?.vectorIcon || 'pricetag-outline') as keyof typeof Ionicons.glyphMap;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: category?.bgColor || Colors.light.cardMuted,
        },
      ]}
    >
      {category?.vectorIcon ? (
        <Ionicons
          name={iconName}
          size={calculatedIconSize}
          color={category.color}
        />
      ) : (
        <Text style={{ fontSize: calculatedIconSize }}>
          {category?.icon || '📌'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

