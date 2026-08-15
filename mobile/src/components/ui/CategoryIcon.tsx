/**
 * CategoryIcon — Renders a category icon with colored background circle
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius } from '@/constants/theme';
import { getCategoryById } from '@/constants/categories';

interface CategoryIconProps {
  categoryId: string;
  size?: number;
}

export function CategoryIcon({ categoryId, size = 44 }: CategoryIconProps) {
  const category = getCategoryById(categoryId);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: category?.bgColor || '#F8F9FA',
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: size * 0.45 }]}>
        {category?.icon || '📌'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {},
});
