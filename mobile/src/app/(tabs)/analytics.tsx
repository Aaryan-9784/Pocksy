/**
 * Pocksy Analytics & Insights Screen
 * High-fidelity category spending analytics, period filters, and cashflow comparison
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { EmptyState, LoadingState, CategoryIcon, AppHeader, PageTitle } from '@/components/ui';
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
        budgetService.getBudget(now.getMonth() + 1, now.getFullYear()).catch(() => ({ budget: { amount: 0, categoryBudgets: [] } })),
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
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  return (
    <View style={styles.container}>
      {/* Fixed Top Brand & Profile Header */}
      <AppHeader showProfile={true} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['5xl'] }]}
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
        {/* Page Title Block */}
        <PageTitle
          title="Insights & Budgets"
          subtitle="Smart overview of your cash flow & category limits"
          noPaddingHorizontal={true}
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
            >
              <Text
                style={[
                  styles.periodTabText,
                  isSelected && styles.periodTabTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Cash Flow Summary Card */}
      <View style={styles.cashflowCard}>
        <View style={styles.cashflowTop}>
          <View>
            <Text style={styles.cashflowLabel}>NET SAVINGS</Text>
            <Text
              style={[
                styles.cashflowAmount,
                { color: netSavings >= 0 ? colors.income : colors.expense },
              ]}
            >
              {netSavings >= 0 ? '+' : ''}
              {formatAmount(netSavings)}
            </Text>
          </View>
          <View
            style={[
              styles.savingsRateBadge,
              {
                backgroundColor:
                  savingsRate >= 20
                    ? colors.incomeLight
                    : savingsRate > 0
                    ? colors.warningLight
                    : colors.expenseLight,
              },
            ]}
          >
            <Ionicons
              name={savingsRate >= 20 ? 'trending-up' : 'trending-down'}
              size={14}
              color={
                savingsRate >= 20
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
                  color:
                    savingsRate >= 20
                      ? colors.income
                      : savingsRate > 0
                      ? colors.warning
                      : colors.expense,
                },
              ]}
            >
              {savingsRate}% Saved
            </Text>
          </View>
        </View>

        {/* Ratio bar */}
        {totalIncome + totalExpenses > 0 && (
          <View style={styles.ratioBarTrack}>
            <View
              style={[
                styles.ratioBarIncome,
                {
                  flex: totalIncome > 0 ? totalIncome : 0.001,
                },
              ]}
            />
            <View
              style={[
                styles.ratioBarExpense,
                {
                  flex: totalExpenses > 0 ? totalExpenses : 0.001,
                },
              ]}
            />
          </View>
        )}

        {/* Breakdown chips */}
        <View style={styles.ratioLabelsRow}>
          <View style={styles.ratioLabelItem}>
            <View style={[styles.ratioIndicator, { backgroundColor: colors.income }]} />
            <Text style={styles.ratioLabelText}>Income: <Text style={{ fontWeight: FontWeight.bold }}>{formatAmount(totalIncome)}</Text></Text>
          </View>
          <View style={styles.ratioLabelItem}>
            <View style={[styles.ratioIndicator, { backgroundColor: colors.expense }]} />
            <Text style={styles.ratioLabelText}>Expense: <Text style={{ fontWeight: FontWeight.bold }}>{formatAmount(totalExpenses)}</Text></Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Category Budgets & Spending</Text>
          <Text style={styles.sectionCount}>{breakdown.length} Categories active</Text>
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
        >
          <Ionicons name="options-outline" size={14} color={colors.primary} />
          <Text style={styles.setBudgetBtnText}>Set Limits</Text>
        </TouchableOpacity>
      </View>

      {breakdown.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            vectorIcon="pie-chart-outline"
            title="No spending data yet"
            message="Add expense records in this period to visualize your breakdown and budget limits."
          />
        </View>
      ) : (
        <View style={styles.breakdownList}>
          {breakdown.map((cat) => {
            const hasLimit = typeof cat.budgetLimit === 'number' && cat.budgetLimit > 0;
            const limit = cat.budgetLimit || 0;
            const isOverBudget = hasLimit && cat.total > limit;
            const isNearLimit = hasLimit && !isOverBudget && cat.total >= limit * 0.8;
            const budgetProgress = hasLimit ? Math.min(100, Math.round((cat.total / limit) * 100)) : 0;

            return (
              <View key={cat.id} style={styles.categoryRowCard}>
                <CategoryIcon categoryId={cat.id} size={44} />

                <View style={styles.catDetails}>
                  <View style={styles.catTopLine}>
                    <Text style={styles.catName}>{cat.label}</Text>
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
                          width: `${Math.min(Math.max(hasLimit ? budgetProgress : cat.percentage, 4), 100)}%`,
                          backgroundColor: isOverBudget
                            ? colors.expense
                            : isNearLimit
                            ? colors.warning
                            : cat.color,
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
                                ? colors.warning
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
                      <Text style={[styles.catPercentBadge, { color: cat.color }]}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  periodTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: colors.primary,
  },
  periodTabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  periodTabTextActive: {
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
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  cashflowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cashflowLabel: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
  },
  cashflowAmount: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    marginTop: 2,
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
  ratioBarTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  ratioBarIncome: {
    backgroundColor: colors.income,
  },
  ratioBarExpense: {
    backgroundColor: colors.expense,
  },
  ratioLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratioIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ratioLabelText: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
  },
  highlightsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
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
    gap: 4,
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  highlightValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  highlightSub: {
    fontSize: FontSize['2xs'],
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  sectionCount: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
  },
  setBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
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
    borderRadius: BorderRadius.lg,
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
  },
});

