import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';
import type { Account } from '@/types';

const colors = Colors.light;

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  isSelected?: boolean;
}

export function AccountCard({ account, onPress, isSelected = false }: AccountCardProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    onPress?.();
  };

  const getAccountIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (account.type) {
      case 'cash':
        return 'cash-outline';
      case 'credit_card':
        return 'card-outline';
      case 'wallet':
        return 'wallet-outline';
      case 'savings':
        return 'cube-outline';
      case 'bank':
      default:
        return 'business-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        { borderLeftColor: account.color || colors.primary },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${account.color || colors.primary}18` },
          ]}
        >
          <Ionicons
            name={getAccountIcon()}
            size={18}
            color={account.color || colors.primary}
          />
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{account.type.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {account.name}
      </Text>

      <Text style={styles.balance}>
        {formatAmount(account.balance)}
      </Text>

      {account.accountNumber ? (
        <Text style={styles.accNumber}>•••• {account.accountNumber.slice(-4)}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 155,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    marginRight: Spacing.sm,
    ...Shadows.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: colors.cardMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: colors.textMuted,
  },
  name: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balance: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  accNumber: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 2,
  },
});
