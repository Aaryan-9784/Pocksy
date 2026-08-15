/**
 * BalanceCard — Signature luxury Pocksy card with LinearGradient, ambient glow, and privacy toggle
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '@/constants/theme';
import { formatAmount } from '@/constants/currency';

const colors = Colors.light;

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    setIsVisible(!isVisible);
  };

  return (
    <View style={styles.shadowWrapper}>
      <LinearGradient
        colors={['#7E1D2E', '#52131E', '#3D0D15']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Background decorative glow rings */}
        <View style={styles.glowCircle1} />
        <View style={styles.glowCircle2} />

        {/* Card Header: Label & Privacy Eye */}
        <View style={styles.topRow}>
          <View style={styles.labelContainer}>
            <View style={styles.diamondPill}>
              <Ionicons name="sparkles" size={12} color="#FBBF24" />
              <Text style={styles.pillText}>Total Balance</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleVisibility}
            style={styles.eyeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={isVisible ? 'Hide balance' : 'Show balance'}
          >
            <Ionicons
              name={isVisible ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="rgba(255, 255, 255, 0.75)"
            />
          </TouchableOpacity>
        </View>

        {/* Hero Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.balance}>
            {isVisible ? formatAmount(balance) : '₹ ••••••'}
          </Text>
        </View>

        {/* Bottom Income & Expense Row */}
        <View style={styles.statRow}>
          {/* Income Pill */}
          <View style={styles.statItem}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="arrow-down-outline" size={14} color="#34D399" />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>
                {isVisible ? formatAmount(income) : '••••'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Expenses Pill */}
          <View style={styles.statItem}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Ionicons name="arrow-up-outline" size={14} color="#F87171" />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>
                {isVisible ? formatAmount(expenses) : '••••'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  glowCircle1: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(232, 137, 154, 0.12)',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diamondPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: FontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
  },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountContainer: {
    marginVertical: Spacing.md,
  },
  balance: {
    fontSize: FontSize['4xl'],
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    letterSpacing: -1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: FontSize['2xs'],
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSize.base,
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: Spacing.sm,
  },
});

