/**
 * Pocksy Home Screen — Dashboard
 * High-end financial dashboard with real data, quick actions, and responsive layout
 */

import React, { useEffect, useCallback, useState } from 'react';
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
import { Ionicons, Feather } from '@expo/vector-icons';
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
  TransactionDetailModal,
  AppHeader,
  PageTitle,
} from '@/components/ui';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountModal } from '@/components/accounts/AccountModal';
import { TransferModal } from '@/components/accounts/TransferModal';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAccountStore } from '@/store/accountStore';
import type { Transaction } from '@/types';

const colors = Colors.light;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, fetchDashboard, refresh } = useDashboardStore();
  const { accounts, fetchAccounts } = useAccountStore();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchAccounts();
  }, []);

  const onRefresh = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    await Promise.all([refresh(), fetchAccounts()]);
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

  return (
    <View style={styles.container}>
      {/* Fixed Top Brand & Profile Header */}
      <AppHeader
        showProfile={true}
        onProfilePress={() => navigateTo('/(tabs)/profile')}
      />

      <ScrollView
        style={styles.scrollContainer}
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
        {/* Page Title Block */}
        <PageTitle
          title="Dashboard"
          subtitle={`${greeting}, ${userName} 👋`}
        />

        {/* Hero Balance Card */}
        <View style={styles.section}>
          <BalanceCard
            balance={data?.totalBalance || 0}
            income={data?.totalIncome || 0}
            expenses={data?.totalExpenses || 0}
          />
        </View>

      {/* Quick Action Tiles */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              }
              router.push({ pathname: '/(tabs)/add', params: { type: 'expense' } });
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Add Expense"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.dangerLight }]}>
              <Feather name="arrow-up-right" size={21} color={colors.danger} />
            </View>
            <Text style={styles.actionLabel}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              }
              router.push({ pathname: '/(tabs)/add', params: { type: 'income' } });
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Add Income"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.successLight }]}>
              <Feather name="arrow-down-left" size={21} color={colors.success} />
            </View>
            <Text style={styles.actionLabel}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              }
              setTransferModalVisible(true);
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Transfer Funds"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Feather name="repeat" size={19} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              }
              navigateTo('/(tabs)/analytics');
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="View Insights"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Feather name="pie-chart" size={19} color="#475569" />
            </View>
            <Text style={styles.actionLabel}>Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallets & Accounts Section */}
      <View style={styles.accountsSection}>
        <View style={styles.accountsHeader}>
          <View>
            <Text style={styles.accountsTitle}>Wallets & Accounts</Text>
            <Text style={styles.accountsSubTitle}>{accounts.length} active account{accounts.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.accountsActions}>
            <TouchableOpacity
              style={styles.addAccountBadge}
              onPress={() => setAccountModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={14} color={colors.primary} />
              <Text style={styles.addAccountBadgeText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountsList}
        >
          {accounts.map((acc) => (
            <AccountCard key={acc._id} account={acc} />
          ))}
          <TouchableOpacity
            style={styles.newAccountCard}
            onPress={() => setAccountModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.newAccountIcon}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </View>
            <Text style={styles.newAccountText}>New Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Budget Progress Widget */}
      {(data?.monthlyBudget || user?.monthlyBudget || 0) > 0 && (
        <View style={styles.section}>
          <BudgetProgress
            spent={data?.budgetSpent || 0}
            total={data?.monthlyBudget || user?.monthlyBudget || 0}
          />
        </View>
      )}

      {/* Recent Transactions Section */}
      <View style={styles.sectionHeaderWrap}>
        <SectionHeader
          title="Recent Activity"
          actionLabel="View All"
          onAction={() => navigateTo('/(tabs)/transactions')}
        />
      </View>

      {data?.recentTransactions && data.recentTransactions.length > 0 ? (
        <View style={styles.transactionList}>
          {data.recentTransactions.map((t) => (
            <TransactionItem
              key={t._id}
              transaction={t}
              onPress={(tx) => setSelectedTransaction(tx)}
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

      {/* Transaction Detail & Edit Modal */}
      <TransactionDetailModal
        visible={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onUpdated={onRefresh}
        onDeleted={onRefresh}
      />

      {/* Add Account Modal */}
      <AccountModal
        visible={accountModalVisible}
        onClose={() => setAccountModalVisible(false)}
        onSuccess={onRefresh}
      />

      {/* Transfer Funds Modal */}
      <TransferModal
        visible={transferModalVisible}
        onClose={() => setTransferModalVisible(false)}
        onSuccess={onRefresh}
      />
    </ScrollView>
  </View>
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing['5xl'],
  },
  greetingSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  greetingText: {
    fontSize: FontSize.xs,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  userName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  quickActionsContainer: {
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.xs,
  },
  quickActionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  accountsSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  accountsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  accountsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  accountsSubTitle: {
    fontSize: FontSize['2xs'],
    color: colors.textMuted,
    marginTop: 1,
  },
  accountsActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  addAccountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  addAccountBadgeText: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  accountsList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 4,
  },
  newAccountCard: {
    width: 130,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: colors.cardMuted,
  },
  newAccountIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  newAccountText: {
    fontSize: FontSize['2xs'],
    fontWeight: FontWeight.semibold,
    color: colors.primary,
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

