/**
 * Pocksy Home Screen — Dashboard
 * Shows financial overview with real API data
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { BalanceCard, BudgetProgress, SectionHeader, EmptyState, TransactionItem, LoadingState } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { formatAmount } from '@/constants/currency';

const colors = Colors.light;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, fetchDashboard, refresh } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(async () => {
    await refresh();
  }, []);

  const greeting = getGreeting();
  const userName = user?.name?.split(' ')[0] || '';

  if (isLoading && !data) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}{userName ? `, ${userName}` : ''} 👋</Text>
          <Text style={styles.subtitle}>Here's your money overview</Text>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.section}>
        <BalanceCard
          balance={data?.totalBalance || 0}
          income={data?.totalIncome || 0}
          expenses={data?.totalExpenses || 0}
        />
      </View>

      {/* Budget Progress */}
      {(data?.monthlyBudget || 0) > 0 && (
        <View style={styles.section}>
          <BudgetProgress
            spent={data?.budgetSpent || 0}
            total={data?.monthlyBudget || 0}
          />
        </View>
      )}

      {/* Recent Transactions */}
      <SectionHeader
        title="Recent Transactions"
        actionLabel="See All"
        onAction={() => router.push('/(tabs)/transactions')}
      />

      {data?.recentTransactions && data.recentTransactions.length > 0 ? (
        <View style={styles.transactionList}>
          {data.recentTransactions.map((t) => (
            <TransactionItem key={t._id} transaction={t} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="📝"
          title="No transactions yet"
          message="Start tracking your spending by adding your first expense."
          actionLabel="Add Expense"
          onAction={() => router.push('/(tabs)/add')}
        />
      )}
    </ScrollView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
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
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  transactionList: {
    paddingHorizontal: Spacing.xl,
  },
});
