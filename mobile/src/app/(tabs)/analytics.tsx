/**
 * Pocksy Analytics/Insights Screen
 * Shows category-wise spending breakdown
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { EmptyState, LoadingState } from '@/components/ui';
import { transactionService } from '@/services/transactionService';
import { getCategoryById, EXPENSE_CATEGORIES } from '@/constants/categories';
import { formatAmount } from '@/constants/currency';
import type { Transaction } from '@/types';

const colors = Colors.light;

interface CategoryBreakdown {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  total: number;
  count: number;
  percentage: number;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const fetchAnalytics = async () => {
    try {
      // Get current month's date range
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const data = await transactionService.list({
        startDate,
        endDate,
        limit: 500,
      });

      // Calculate category breakdown for expenses
      const categoryMap = new Map<string, { total: number; count: number }>();
      let expTotal = 0;
      let incTotal = 0;

      for (const t of data.transactions) {
        if (t.type === 'expense') {
          expTotal += t.amount;
          const existing = categoryMap.get(t.category) || { total: 0, count: 0 };
          categoryMap.set(t.category, {
            total: existing.total + t.amount,
            count: existing.count + 1,
          });
        } else {
          incTotal += t.amount;
        }
      }

      const breakdownArr: CategoryBreakdown[] = [];
      categoryMap.forEach((value, key) => {
        const cat = getCategoryById(key);
        breakdownArr.push({
          id: key,
          label: cat?.label || key,
          icon: cat?.icon || '📌',
          color: cat?.color || '#868E96',
          bgColor: cat?.bgColor || '#F8F9FA',
          total: value.total,
          count: value.count,
          percentage: expTotal > 0 ? Math.round((value.total / expTotal) * 100) : 0,
        });
      });

      // Sort by total descending
      breakdownArr.sort((a, b) => b.total - a.total);

      setBreakdown(breakdownArr);
      setTotalExpenses(expTotal);
      setTotalIncome(incTotal);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingState message="Analyzing your spending..." />;
  }

  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.period}>{monthName}</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: colors.income }]}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: colors.income }]}>
            {formatAmount(totalIncome)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.expense }]}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryAmount, { color: colors.expense }]}>
            {formatAmount(totalExpenses)}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
      </View>

      {breakdown.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No spending data yet"
          message="Start tracking your expenses to see spending insights and analytics."
        />
      ) : (
        <View style={styles.breakdownList}>
          {breakdown.map((cat) => (
            <View key={cat.id} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.catIconContainer, { backgroundColor: cat.bgColor }]}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.catInfo}>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={styles.catCount}>{cat.count} transaction{cat.count !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={styles.catAmount}>{formatAmount(cat.total)}</Text>
                <Text style={styles.catPercentage}>{cat.percentage}%</Text>
              </View>
            </View>
          ))}

          {/* Progress bars */}
          <View style={styles.barsContainer}>
            {breakdown.map((cat) => (
              <View key={cat.id} style={styles.barRow}>
                <Text style={styles.barLabel}>{cat.icon} {cat.label}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barPercent}>{cat.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  content: {
    paddingBottom: Spacing['4xl'],
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  period: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    marginTop: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderLeftWidth: 3,
    ...Shadows.sm,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  breakdownList: {
    paddingHorizontal: Spacing.xl,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  catIcon: {
    fontSize: 18,
  },
  catInfo: {
    flex: 1,
  },
  catLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: colors.textPrimary,
  },
  catCount: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  catPercentage: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  barsContainer: {
    marginTop: Spacing.xl,
    backgroundColor: colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  barLabel: {
    width: 100,
    fontSize: FontSize.xs,
    color: colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barPercent: {
    width: 36,
    fontSize: FontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
