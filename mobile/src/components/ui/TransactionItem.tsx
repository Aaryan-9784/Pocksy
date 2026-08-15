/**
 * TransactionItem — Premium transaction row with vector badges and metadata
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { formatSignedAmount } from '@/constants/currency';
import { getCategoryById } from '@/constants/categories';
import { CategoryIcon } from './CategoryIcon';
import type { Transaction } from '@/types';

const colors = Colors.light;

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onLongPress?: (transaction: Transaction) => void;
  isLast?: boolean;
}

export function TransactionItem({ transaction, onPress, onLongPress, isLast = false }: TransactionItemProps) {
  const category = getCategoryById(transaction.category);
  const isExpense = transaction.type === 'expense';

  const formattedDate = formatDate(transaction.date);

  const handleLongPress = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    onLongPress?.(transaction);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(transaction)}
      onLongPress={handleLongPress}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description}, ${formatSignedAmount(transaction.amount, transaction.type)}`}
    >
      <CategoryIcon categoryId={transaction.category} size={42} />

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.categoryName}>
            {category?.label || transaction.category}
          </Text>
          {transaction.paymentMethod ? (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.paymentMethod}>
                {transaction.paymentMethod.toUpperCase()}
              </Text>
            </>
          ) : null}
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            {
              color:
                transaction.type === 'expense'
                  ? colors.textPrimary
                  : colors.income,
            },
          ]}
        >
          {formatSignedAmount(transaction.amount, transaction.type)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  details: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  categoryName: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  dot: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  paymentMethod: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
  },
  date: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
});
