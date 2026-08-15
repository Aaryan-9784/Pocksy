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
        colors={['#721B2A', '#4A111C', '#280A10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Background ambient lighting */}
        <View style={styles.glowCircle1} />
        <View style={styles.glowCircle2} />

        {/* Card Header: Brand, Contactless, and Privacy Eye */}
        <View style={styles.topRow}>
          <View style={styles.brandGroup}>
            <View style={styles.diamondPill}>
              <Ionicons name="shield-checkmark" size={12} color="#FBBF24" />
              <Text style={styles.pillText}>POCKSY WEALTH</Text>
            </View>
            <Ionicons name="radio-outline" size={18} color="rgba(255, 255, 255, 0.4)" style={styles.contactlessIcon} />
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
              color="rgba(255, 255, 255, 0.85)"
            />
          </TouchableOpacity>
        </View>

        {/* Hero Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.balanceLabel}>NET PORTFOLIO VALUE</Text>
          <Text style={styles.balance}>
            {isVisible ? formatAmount(balance) : '₹ ••••••••'}
          </Text>
        </View>

        {/* Bottom Income & Expense Inset Strip */}
        <View style={styles.statRow}>
          {/* Income Item */}
          <View style={styles.statItem}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.25)' }]}>
              <Ionicons name="arrow-down" size={13} color="#34D399" />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statLabel}>INFLOW</Text>
              <Text style={styles.statValue}>
                {isVisible ? `+${formatAmount(income)}` : '••••'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Expenses Item */}
          <View style={styles.statItem}>
            <View style={[styles.statIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}>
              <Ionicons name="arrow-up" size={13} color="#F87171" />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statLabel}>OUTFLOW</Text>
              <Text style={styles.statValue}>
                {isVisible ? `-${formatAmount(expenses)}` : '••••'}
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  glowCircle1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(232, 137, 154, 0.16)',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diamondPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pillText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
  },
  contactlessIcon: {
    transform: [{ rotate: '90deg' }],
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  amountContainer: {
    marginVertical: Spacing.sm,
  },
  balanceLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSize.sm,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: Spacing.sm,
  },
});

