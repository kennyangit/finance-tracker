import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTransactions } from '../../src/store/transactionStore';
import { TransactionCard } from '../../src/components/TransactionCard';
import { TransactionForm } from '../../src/components/TransactionForm';
import { SearchBar } from '../../src/components/SearchBar';
import { MonthSelector } from '../../src/components/MonthSelector';
import { TransactionCardSkeleton } from '../../src/components/LoadingSkeleton';
import { EmptyState } from '../../src/components/EmptyState';
import { Transaction, TransactionType } from '../../src/types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../src/theme';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { state, createTransaction, updateTransaction, deleteTransaction, setFilters, setSelectedMonth, fetchTransactions } = useTransactions();
  const { transactions, loading, selectedMonth, filters } = state;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => { setRefreshing(true); await fetchTransactions(); setRefreshing(false); };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (editingTransaction) return updateTransaction(editingTransaction.id, data);
    return createTransaction(data);
  };

  const handleEdit = (t: Transaction) => { setEditingTransaction(t); setIsFormOpen(true); };

  const handleDelete = (id: string) => {
    Alert.alert('Excluir Transação', 'Tem certeza que deseja excluir esta transação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  const handleSearch = (v: string) => { setLocalSearch(v); setFilters({ search: v }); };

  const handleTypeFilter = (type: string) => { setFilters({ type: type as TransactionType | 'all' }); };

  const handleSort = (sortBy: 'date' | 'value' | 'category') => {
    if (filters.sortBy === sortBy) setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    else setFilters({ sortBy, sortOrder: 'desc' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <Text style={styles.title}>Transações</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => { setEditingTransaction(null); setIsFormOpen(true); }} activeOpacity={0.7}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Nova</Text>
          </TouchableOpacity>
        </View>

        <SearchBar value={localSearch} onChange={handleSearch} totalResults={transactions.length} />

        {/* Type Filters */}
        <View style={styles.filterRow}>
          {(['all', 'income', 'expense'] as const).map(type => (
            <TouchableOpacity key={type} style={[styles.filterChip, filters.type === type && styles.filterChipActive]} onPress={() => handleTypeFilter(type)} activeOpacity={0.7}>
              <Text style={[styles.filterChipText, filters.type === type && styles.filterChipTextActive]}>
                {type === 'all' ? 'Todos' : type === 'income' ? 'Receitas' : 'Despesas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort Buttons */}
        <View style={styles.filterRow}>
          {(['date', 'value', 'category'] as const).map(sort => (
            <TouchableOpacity key={sort} style={[styles.sortChip, filters.sortBy === sort && styles.sortChipActive]} onPress={() => handleSort(sort)} activeOpacity={0.7}>
              <Text style={[styles.sortChipText, filters.sortBy === sort && styles.sortChipTextActive]}>
                {sort === 'date' ? 'Data' : sort === 'value' ? 'Valor' : 'Categoria'}
                {filters.sortBy === sort && (filters.sortOrder === 'desc' ? ' ↓' : ' ↑')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={styles.listContainer}>
          {[0, 1, 2, 3, 4].map(i => <TransactionCardSkeleton key={i} />)}
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.listContainer}>
          <EmptyState icon="list" title="Nenhuma transação" message={localSearch ? 'Tente ajustar sua busca' : 'Comece adicionando sua primeira transação'} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TransactionCard transaction={item} onEdit={handleEdit} onDelete={handleDelete} index={index} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {transactions.length} transação{transactions.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      )}

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        onSubmit={handleSubmit}
        initialData={editingTransaction || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerSection: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.textPrimary },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.sm },
  addButtonText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.bgSubtle },
  filterChipActive: { backgroundColor: colors.primary },
  filterChipText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  filterChipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },
  sortChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, backgroundColor: 'transparent' },
  sortChipActive: { backgroundColor: colors.bgSubtle },
  sortChipText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: fontWeight.medium },
  sortChipTextActive: { color: colors.primary, fontWeight: fontWeight.semibold },
  listContainer: { flex: 1, paddingHorizontal: spacing.lg },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['5xl'] },
  resultCount: { fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: spacing.sm },
});
