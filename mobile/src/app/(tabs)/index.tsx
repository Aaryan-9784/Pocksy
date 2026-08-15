/**
 * Pocksy Home Screen — Dashboard
 * High-end financial dashboard with real data, quick actions, and responsive layout
 */

import React, { useEffect, useCallback } from 'react';
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
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import {
  BalanceCard,
  BudgetProgress,
  SectionHeader,
  EmptyState,
  TransactionItem,
  LoadingState,
  Avatar,
} from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';

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
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    await refresh();
  }, []);

  const greeting = getGreeting();
  const userName = user?.name?.split(' ')[0] || 'there';

  const navigateTo = (path: any) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    router.push(path);
  };

  if (isLoading && !data) {
    return <LoadingState message="Loading your financial dashboard..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing['5xl'] }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => navigateTo('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <Avatar name={user?.name || 'User'} size={46} />
          <View style={styles.greetingGroup}>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.userName}>{userName} 👋</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={onRefresh}
          activeOpacity={0.7}
          accessibilityLabel="Refresh data"
        >
          <Ionicons name="refresh-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Hero Balance Card */}
      <View style={styles.section}>
        <BalanceCard
          balance={data?.totalBalance || 0}
          income={data?.totalIncome || 0}
          expenses={data?.totalExpenses || 0}
        />
      </View>

      {/* Quick Actions Row */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateTo('/(tabs)/add')}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: colors.dangerLight }]}>
            <Ionicons name="arrow-up" size={18} color={colors.danger} />
          </View>
          <Text style={styles.actionLabel}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateTo('/(tabs)/add')}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: colors.successLight }]}>
            <Ionicons name="arrow-down" size={18} color={colors.success} />
          </View>
          <Text style={styles.actionLabel}>Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateTo('/(tabs)/analytics')}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="pie-chart" size={18} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateTo('/(tabs)/transactions')}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="receipt" size={18} color="#64748B" />
          </View>
          <Text style={styles.actionLabel}>Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Budget Progress Widget */}
      {(data?.monthlyBudget || 0) > 0 && (
        <View style={styles.section}>
          <BudgetProgress
            spent={data?.budgetSpent || 0}
            total={data?.monthlyBudget || 0}
          />
        </View>
      )}

      {/* Recent Transactions Section */}
      <View style={styles.sectionHeaderWrap}>
        <SectionHeader
          title="Recent Activity"
          actionLabel="See All"
          onAction={() => navigateTo('/(tabs)/transactions')}
        />
      </View>

      {data?.recentTransactions && data.recentTransactions.length > 0 ? (
        <View style={styles.transactionList}>
          {data.recentTransactions.map((t) => (
            <TransactionItem
              key={t._id}
              transaction={t}
              onPress={() => navigateTo('/(tabs)/transactions')}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            vectorIcon="wallet-outline"
            title="No transactions yet"
            message="Track your first expense or income to see your real-time analytics."
            actionLabel="Add Transaction"
            onAction={() => navigateTo('/(tabs)/add')}
          />
        </View>
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
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: Spacing['5xl'],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  greetingGroup: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  bellButton: {
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
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    marginTop: Spacing['2xs'],
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  sectionHeaderWrap: {
    paddingHorizontal: Spacing.xs,
  },
  transactionList: {
    paddingHorizontal: Spacing.xl,
  },
  emptyContainer: {
    paddingHorizontal: Spacing.xl,
  },
});

