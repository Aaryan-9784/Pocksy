/**
 * TransactionItem — Single transaction row for lists
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { formatSignedAmount } from '@/constants/currency';
import { getCategoryById } from '@/constants/categories';
import type { Transaction } from '@/types';

const colors = Colors.light;

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onLongPress?: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, onPress, onLongPress }: TransactionItemProps) {
  const category = getCategoryById(transaction.category);
  const isExpense = transaction.type === 'expense';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(transaction)}
      onLongPress={() => onLongPress?.(transaction)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description}, ${formatSignedAmount(transaction.amount, transaction.type)}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: category?.bgColor || '#F8F9FA' }]}>
        <Text style={styles.icon}>{category?.icon || '📌'}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.category}>
          {category?.label || transaction.category}
          {transaction.paymentMethod ? ` · ${transaction.paymentMethod}` : ''}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: isExpense ? colors.expense : colors.income },
          ]}
        >
          {formatSignedAmount(transaction.amount, transaction.type)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  details: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
  },
});
