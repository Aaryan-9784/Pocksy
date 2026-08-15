/**
 * Pocksy Analytics & Insights Screen
 * High-fidelity category spending analytics, period filters, and cashflow comparison
 * Perfectly aligned with the Pocksy Luxury Design System
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import {
  EmptyState,
  LoadingState,
  CategoryIcon,
  AppHeader,
  PageTitle,
  BudgetProgress,
} from '@/components/ui';
import { CategoryBudgetModal } from '@/components/budget/CategoryBudgetModal';
import { transactionService } from '@/services/transactionService';
import { budgetService } from '@/services/budgetService';
import { getCategoryById } from '@/constants/categories';
import { formatAmount } from '@/constants/currency';
import type { CategoryBudget } from '@/types';

const colors = Colors.light;

interface CategoryBreakdown {
  id: string;
  label: string;
  icon: string;
  vectorIcon: string;
  color: string;
  bgColor: string;
  total: number;
  count: number;
  percentage: number;
  budgetLimit?: number;
}

type PeriodType = 'this_month' | 'last_month' | 'all';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodType>('this_month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [monthlyBudgetAmount, setMonthlyBudgetAmount] = useState(0);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);

  const fetchAnalytics = async (selectedPeriod: PeriodType = period) => {
    try {
      const now = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (selectedPeriod === 'this_month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      } else if (selectedPeriod === 'last_month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
      }

      const [data, budgetRes] = await Promise.all([
        transactionService.list({
          startDate,
          endDate,
          limit: 500,
        }),
        budgetService
          .getBudget(now.getMonth() + 1, now.getFullYear())
          .catch(() => ({ budget: { amount: 0, categoryBudgets: [] } })),
      ]);

      const catBudgets = budgetRes.budget?.categoryBudgets || [];
      setCategoryBudgets(catBudgets);
      setMonthlyBudgetAmount(budgetRes.budget?.amount || 0);

      const budgetMap = new Map<string, number>();
      catBudgets.forEach((cb) => budgetMap.set(cb.category, cb.amount));

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
        const limit = budgetMap.get(key);
        breakdownArr.push({
          id: key,
          label: cat?.label || key,
          icon: cat?.icon || '📌',
          vectorIcon: cat?.vectorIcon || 'pricetag-outline',
          color: cat?.color || colors.textSecondary,
          bgColor: cat?.bgColor || colors.cardMuted,
          total: value.total,
          count: value.count,
          percentage: expTotal > 0 ? Math.round((value.total / expTotal) * 100) : 0,
          budgetLimit: limit,
        });
      });

      // Also include categories with a budget set even if 0 spent yet
      budgetMap.forEach((amount, key) => {
        if (!categoryMap.has(key) && amount > 0) {
          const cat = getCategoryById(key);
          breakdownArr.push({
            id: key,
            label: cat?.label || key,
            icon: cat?.icon || '📌',
            vectorIcon: cat?.vectorIcon || 'pricetag-outline',
            color: cat?.color || colors.textSecondary,
            bgColor: cat?.bgColor || colors.cardMuted,
            total: 0,
            count: 0,
            percentage: 0,
            budgetLimit: amount,
          });
        }
      });

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
    fetchAnalytics(period);
  }, [period]);

  const onRefresh = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    setRefreshing(true);
    fetchAnalytics(period);
  }, [period]);

  const handlePeriodChange = (p: PeriodType) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    setPeriod(p);
  };

  const netSavings = totalIncome - totalExpenses;
  const hasCashflow = totalIncome > 0 || totalExpenses > 0;
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.round((netSavings / totalIncome) * 100))
      : 0;

  // Highlights computed data
  const topCategory = useMemo(() => {
    const sorted = breakdown.filter((b) => b.total > 0);
    return sorted.length > 0 ? sorted[0] : null;
  }, [breakdown]);

  const totalTransactionsCount = useMemo(() => {
    return breakdown.reduce((acc, curr) => acc + curr.count, 0);
  }, [breakdown]);

  return (
    <View style={styles.container}>
      {/* Fixed Top Brand & Profile Header */}
      <AppHeader
        showProfile={true}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing['5xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Standardized Page Title Block */}
        <PageTitle
          title="Insights & Budgets"
          subtitle="Smart overview of your cash flow & category limits"
        />

        {/* Period Selector Tabs */}
        <View style={styles.periodSwitcher}>
          {(
            [
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((p) => {
            const isSelected = period === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.periodTab, isSelected && styles.periodTabActive]}
                onPress={() => handlePeriodChange(p.id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.periodTabGradient}
                  >
                    <Text style={styles.periodTabTextActive}>{p.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.periodTabText}>{p.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cash Flow Summary Hero Card */}
        <View style={styles.cashflowCard}>
          <View style={styles.cashflowTop}>
            <View>
              <View style={styles.labelWithIcon}>
                <View style={styles.pulseDot} />
                <Text style={styles.cashflowLabel}>NET CASH FLOW</Text>
              </View>
              <Text
                style={[
                  styles.cashflowAmount,
                  {
                    color:
                      !hasCashflow
                        ? colors.textPrimary
                        : netSavings >= 0
                        ? colors.income
                        : colors.expense,
                  },
                ]}
              >
                {hasCashflow && netSavings > 0 ? '+' : ''}
                {formatAmount(netSavings)}
              </Text>
            </View>

            {/* Savings Rate Badge */}
            <View
              style={[
                styles.savingsRateBadge,
                {
                  backgroundColor: !hasCashflow
                    ? colors.cardMuted
                    : savingsRate >= 20
                    ? colors.incomeLight
                    : savingsRate > 0
                    ? colors.warningLight
                    : colors.expenseLight,
                },
              ]}
            >
              <Ionicons
                name={
                  !hasCashflow
                    ? 'remove-outline'
                    : savingsRate >= 20
                    ? 'trending-up'
                    : savingsRate > 0
                    ? 'trending-up'
                    : 'trending-down'
                }
                size={14}
                color={
                  !hasCashflow
                    ? colors.textSecondary
                    : savingsRate >= 20
                    ? colors.income
                    : savingsRate > 0
                    ? colors.warning
                    : colors.expense
                }
              />
              <Text
                style={[
                  styles.savingsRateText,
                  {
                    color: !hasCashflow
                      ? colors.textSecondary
                      : savingsRate >= 20
                      ? colors.income
                      : savingsRate > 0
                      ? colors.warning
                      : colors.expense,
                  },
                ]}
              >
                {!hasCashflow ? 'No Activity' : `${savingsRate}% Saved`}
              </Text>
            </View>
          </View>

          {/* Income vs Expense Split Tiles */}
          <View style={styles.flowSplitRow}>
            <View style={styles.flowSplitItem}>
              <View style={[styles.flowIconBadge, { backgroundColor: colors.incomeLight }]}>
                <Ionicons name="arrow-down" size={14} color={colors.income} />
              </View>
              <View>
                <Text style={styles.flowSplitLabel}>Total Income</Text>
                <Text style={[styles.flowSplitValue, { color: colors.income }]}>
                  {formatAmount(totalIncome)}
                </Text>
              </View>
            </View>

            <View style={styles.flowSplitDivider} />

            <View style={styles.flowSplitItem}>
              <View style={[styles.flowIconBadge, { backgroundColor: colors.expenseLight }]}>
                <Ionicons name="arrow-up" size={14} color={colors.expense} />
              </View>
              <View>
                <Text style={styles.flowSplitLabel}>Total Expenses</Text>
                <Text style={[styles.flowSplitValue, { color: colors.expense }]}>
                  {formatAmount(totalExpenses)}
                </Text>
              </View>
            </View>
          </View>

          {/* Ratio bar */}
          {hasCashflow && (
            <View style={styles.ratioSection}>
              <View style={styles.ratioBarTrack}>
                <View
                  style={[
                    styles.ratioBarIncome,
                    { flex: totalIncome > 0 ? totalIncome : 0.001 },
                  ]}
                />
                <View
                  style={[
                    styles.ratioBarExpense,
                    { flex: totalExpenses > 0 ? totalExpenses : 0.001 },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Monthly Budget Progress Card if active */}
        {monthlyBudgetAmount > 0 && (
          <View style={styles.sectionBudgetProgress}>
            <BudgetProgress
              spent={totalExpenses}
              total={monthlyBudgetAmount}
            />
          </View>
        )}

        {/* Quick Highlights Row (When data exists) */}
        {hasCashflow && (
          <View style={styles.highlightsRow}>
            {topCategory && (
              <View style={styles.highlightCard}>
                <View style={styles.highlightHeader}>
                  <Ionicons name="flame-outline" size={14} color={colors.accent} />
                  <Text style={styles.highlightTitle}>Top Spending</Text>
                </View>
                <Text style={styles.highlightValue} numberOfLines={1}>
                  {topCategory.label}
                </Text>
                <Text style={styles.highlightSub}>
                  {formatAmount(topCategory.total)} ({topCategory.percentage}%)
                </Text>
              </View>
            )}

            <View style={styles.highlightCard}>
              <View style={styles.highlightHeader}>
                <Ionicons name="receipt-outline" size={14} color={colors.primary} />
                <Text style={styles.highlightTitle}>Activity</Text>
              </View>
              <Text style={styles.highlightValue}>
                {totalTransactionsCount} logs
              </Text>
              <Text style={styles.highlightSub}>
                in selected period
              </Text>
            </View>
          </View>
        )}

        {/* Category Breakdown Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Category Budgets & Spending</Text>
            <Text style={styles.sectionCount}>
              {breakdown.length} {breakdown.length === 1 ? 'Category' : 'Categories'} active
            </Text>
          </View>

          <TouchableOpacity
            style={styles.setBudgetBtn}
            onPress={() => {
              if (Platform.OS !== 'web') {
                try {
                  Haptics.selectionAsync();
                } catch {}
              }
              setBudgetModalVisible(true);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Set category limits"
          >
            <Ionicons name="options-outline" size={14} color={colors.primary} />
            <Text style={styles.setBudgetBtnText}>Set Limits</Text>
          </TouchableOpacity>
        </View>

        {/* Category Breakdown List or Empty State */}
        {breakdown.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              vectorIcon="pie-chart-outline"
              title="No spending data yet"
              message="Add expense records in this period to visualize your breakdown and budget limits."
              actionLabel="Add Transaction"
              onAction={() => router.push('/(tabs)/add')}
            />
          </View>
        ) : (
          <View style={styles.breakdownList}>
            {breakdown.map((cat) => {
              const hasLimit = typeof cat.budgetLimit === 'number' && cat.budgetLimit > 0;
              const limit = cat.budgetLimit || 0;
              const isOverBudget = hasLimit && cat.total > limit;
              const isNearLimit = hasLimit && !isOverBudget && cat.total >= limit * 0.8;
              const budgetProgress = hasLimit
                ? Math.min(100, Math.round((cat.total / limit) * 100))
                : 0;

              return (
                <View key={cat.id} style={styles.categoryRowCard}>
                  <CategoryIcon categoryId={cat.id} size={44} />

                  <View style={styles.catDetails}>
                    <View style={styles.catTopLine}>
                      <Text style={styles.catName} numberOfLines={1}>
                        {cat.label}
                      </Text>
                      <View style={styles.amountBox}>
                        <Text style={styles.catAmount}>{formatAmount(cat.total)}</Text>
                        {hasLimit && (
                          <Text style={styles.catLimitAmount}> / {formatAmount(limit)}</Text>
                        )}
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.catProgressTrack}>
                      <View
                        style={[
                          styles.catProgressFill,
                          {
                            width: `${Math.min(
                              Math.max(hasLimit ? budgetProgress : cat.percentage, 4),
                              100
                            )}%`,
                            backgroundColor: isOverBudget
                              ? colors.expense
                              : isNearLimit
                              ? colors.warning
                              : cat.color || colors.primary,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.catBottomLine}>
                      <Text style={styles.catCountText}>
                        {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                      </Text>

                      {hasLimit ? (
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: isOverBudget
                                ? colors.expenseLight
                                : isNearLimit
                                ? colors.warningLight
                                : colors.incomeLight,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color: isOverBudget
                                  ? colors.expense
                                  : isNearLimit
                                  ? colors.warningText || colors.warning
                                  : colors.income,
                              },
                            ]}
                          >
                            {isOverBudget
                              ? `Over by ${formatAmount(cat.total - limit)}`
                              : isNearLimit
                              ? `${budgetProgress}% used`
                              : `${budgetProgress}% on track`}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.catPercentBadge,
                            { color: cat.color || colors.textSecondary },
                          ]}
                        >
                          {cat.percentage}% of total
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Category Budget Modal */}
        <CategoryBudgetModal
          visible={budgetModalVisible}
          onClose={() => setBudgetModalVisible(false)}
          onSaved={() => fetchAnalytics(period)}
          initialCategoryBudgets={categoryBudgets}
          totalBudget={monthlyBudgetAmount}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing['5xl'],
  },
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  periodTabActive: {
    backgroundColor: 'transparent',
  },
  periodTabGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  periodTabTextActive: {
    fontSize: FontSize.xs,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  cashflowCard: {
    backgroundColor: colors.card,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  cashflowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  cashflowLabel: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
  },
  cashflowAmount: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.6,
  },
  savingsRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  savingsRateText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  flowSplitRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flowSplitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flowIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowSplitLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  flowSplitValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginTop: 1,
  },
  flowSplitDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: Spacing.xs,
  },
  ratioSection: {
    marginTop: Spacing.md,
  },
  ratioBarTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
  },
  ratioBarIncome: {
    backgroundColor: colors.income,
  },
  ratioBarExpense: {
    backgroundColor: colors.expense,
  },
  sectionBudgetProgress: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  highlightsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  highlightSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  setBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(107, 30, 43, 0.12)',
  },
  setBudgetBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  breakdownList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  categoryRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  catDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  catTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  catAmount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  catLimitAmount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: colors.textMuted,
  },
  catProgressTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  catProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  catBottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catCountText: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
  },
  catPercentBadge: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  emptyWrap: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
});
