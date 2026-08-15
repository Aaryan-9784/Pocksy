/**
 * Pocksy Activity/Transactions Screen
 * Searchable, filterable transaction timeline with interactive management
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { TransactionItem, EmptyState, LoadingState, TransactionDetailModal } from '@/components/ui';
import { useTransactionStore } from '@/store/transactionStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { formatAmount } from '@/constants/currency';
import type { Transaction } from '@/types';

const colors = Colors.light;

type FilterType = 'all' | 'expense' | 'income';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const {
    transactions,
    isLoading,
    isRefreshing,
    fetchTransactions,
    deleteTransaction,
    setFilter,
    refresh,
    loadMore,
  } = useTransactionStore();

  const refreshDashboard = useDashboardStore((s) => s.refresh);

  useEffect(() => {
    fetchTransactions(true);
  }, []);

  const handleFilterChange = (filter: FilterType) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilter({});
    } else {
      setFilter({ type: filter });
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase().trim();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    );
  }, [transactions, searchQuery]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      return t.type === 'expense' ? acc - t.amount : acc + t.amount;
    }, 0);
  }, [filteredTransactions]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              refreshDashboard();
            } catch {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleModalUpdated = () => {
    refresh();
    refreshDashboard();
  };

  const handleModalDeleted = () => {
    refresh();
    refreshDashboard();
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={(tx) => setSelectedTransaction(tx)}
      onLongPress={() => handleDelete(item._id)}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>All your spending & income records</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activity, category, notes..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(
          [
            { id: 'all', label: 'All', icon: 'apps-outline' },
            { id: 'expense', label: 'Expenses', icon: 'arrow-up-outline' },
            { id: 'income', label: 'Income', icon: 'arrow-down-outline' },
          ] as const
        ).map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive,
              ]}
              onPress={() => handleFilterChange(filter.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={filter.icon as any}
                size={14}
                color={isActive ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary strip */}
      {filteredTransactions.length > 0 ? (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryCount}>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </Text>
          <Text
            style={[
              styles.summaryTotal,
              { color: totalFilteredAmount >= 0 ? colors.income : colors.expense },
            ]}
          >
            Net: {totalFilteredAmount >= 0 ? '+' : ''}{formatAmount(totalFilteredAmount)}
          </Text>
        </View>
      ) : null}

      {/* Transaction list */}
      {isLoading && transactions.length === 0 ? (
        <LoadingState message="Loading your transactions..." />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          vectorIcon={searchQuery ? 'search-outline' : 'receipt-outline'}
          title={searchQuery ? 'No results found' : 'No transactions yet'}
          message={
            searchQuery
              ? `No transactions matching "${searchQuery}"`
              : 'Your transaction history will appear here once you log expenses.'
          }
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing['5xl'] }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
        />
      )}

      {/* Transaction Detail & Edit Modal */}
      <TransactionDetailModal
        visible={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onUpdated={handleModalUpdated}
        onDeleted={handleModalDeleted}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
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
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: colors.textPrimary,
    marginLeft: Spacing.sm,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Shadows.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  summaryCount: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  summaryTotal: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing['5xl'],
  },
});

