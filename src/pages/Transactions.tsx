import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '@/store/transactionStore';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionForm } from '@/components/TransactionForm';
import { SearchBar } from '@/components/SearchBar';
import { MonthSelector } from '@/components/MonthSelector';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TransactionCardSkeleton } from '@/components/LoadingSkeleton';
import {
  Transaction,
  Category,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  TransactionType
} from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { Plus, Filter, X } from 'lucide-react';

export function Transactions() {
  const {
    state,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    setSelectedMonth
  } = useTransactions();

  const { transactions, loading, selectedMonth, filters } = state;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false });
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (editingTransaction) {
      return updateTransaction(editingTransaction.id, data);
    } else {
      return createTransaction(data).then(success => {
        if (success) {
          setLocalSearch('');
        }
        return success;
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ id, show: true });
  };

  const confirmDelete = async () => {
    await deleteTransaction(deleteConfirm.id);
    setDeleteConfirm({ id: '', show: false });
  };

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    setFilters({ search: value });
  };

  const handleTypeFilter = (type: string) => {
    setFilters({ type: type as TransactionType | 'all' });
  };

  const handleCategoryFilter = (category: Category) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setFilters({ categories: updated.length > 0 ? updated : undefined });
  };

  const handleSort = (sortBy: 'date' | 'value' | 'category') => {
    if (filters.sortBy === sortBy) {
      setFilters({
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setFilters({ sortBy, sortOrder: 'desc' });
    }
  };

  const clearFilters = () => {
    setLocalSearch('');
    setFilters({
      search: '',
      type: 'all',
      categories: undefined,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters =
    (filters.search && filters.search !== '') ||
    filters.type !== 'all' ||
    (filters.categories && filters.categories.length > 0);

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)'
  };

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  };

  const searchBarStyle: React.CSSProperties = {
    flex: '1 1 350px',
    minWidth: '350px'
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border)',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const filterPanelStyle: React.CSSProperties = {
    padding: '1rem',
    background: 'var(--card-bg)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border-subtle)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const filterSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const filterLabelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)'
  };

  const filterButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: active ? 'var(--primary)' : 'var(--bg-subtle)',
    color: active ? '#0A0A0A' : 'var(--text-primary)',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const categoryChipStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.375rem 0.75rem',
    borderRadius: '0.25rem',
    border: 'none',
    background: active ? 'var(--primary)' : 'var(--bg-subtle)',
    color: active ? '#0A0A0A' : 'var(--text-primary)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const sortButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: active ? 'var(--bg-subtle)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center',
    background: 'var(--card-bg)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border-subtle)'
  };

  const stickyHeaderStyle: React.CSSProperties = {
    position: 'sticky',
    top: '0',
    zIndex: 10,
    background: 'var(--bg)',
    paddingBottom: '1rem'
  };

  return (
    <motion.div
      style={containerStyle}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div style={stickyHeaderStyle} variants={itemVariants}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Transações</h1>
          <div style={toolbarStyle}>
            <motion.button
              onClick={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }}
              style={{
                ...buttonStyle,
                background: 'var(--primary)',
                color: '#0A0A0A'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              Nova Transação
            </motion.button>
          </div>
        </div>

        <motion.div style={{ ...toolbarStyle, marginTop: '1rem', display: 'flex', flexWrap: 'wrap' }} variants={itemVariants}>
          <div style={searchBarStyle}>
            <SearchBar
              value={localSearch}
              onChange={handleSearch}
              totalResults={transactions.length}
            />
          </div>

          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...buttonStyle,
              background: showFilters ? 'var(--primary)' : undefined,
              color: showFilters ? '#0A0A0A' : undefined
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter size={16} />
            Filtros
          </motion.button>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <motion.button
              onClick={() => handleSort('date')}
              style={sortButtonStyle(filters.sortBy === 'date')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Data {filters.sortBy === 'date' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
            </motion.button>
            <motion.button
              onClick={() => handleSort('value')}
              style={sortButtonStyle(filters.sortBy === 'value')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Valor {filters.sortBy === 'value' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
            </motion.button>
            <motion.button
              onClick={() => handleSort('category')}
              style={sortButtonStyle(filters.sortBy === 'category')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Categoria {filters.sortBy === 'category' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
            </motion.button>
          </div>

          {hasActiveFilters && (
            <motion.button
              onClick={clearFilters}
              style={{
                ...buttonStyle,
                color: 'var(--danger)',
                borderColor: 'var(--danger)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={16} />
              Limpar
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <motion.div style={filterPanelStyle}>
                <motion.div style={filterSectionStyle}>
                  <span style={filterLabelStyle}>Tipo</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <motion.button
                      style={filterButtonStyle(filters.type === 'all')}
                      onClick={() => handleTypeFilter('all')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Todos
                    </motion.button>
                    <motion.button
                      style={filterButtonStyle(filters.type === 'income')}
                      onClick={() => handleTypeFilter('income')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Receitas
                    </motion.button>
                    <motion.button
                      style={filterButtonStyle(filters.type === 'expense')}
                      onClick={() => handleTypeFilter('expense')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Despesas
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div style={filterSectionStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={filterLabelStyle}>Categorias</span>
                    {filters.categories && filters.categories.length > 0 && (
                      <motion.button
                        onClick={() => setFilters({ categories: undefined })}
                        style={{ fontSize: '0.75rem', color: 'var(--danger)', cursor: 'pointer', background: 'none', border: 'none' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Limpar seleção
                      </motion.button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {INCOME_CATEGORIES.map(cat => (
                      <motion.button
                        key={cat}
                        style={categoryChipStyle(filters.categories?.includes(cat) || false)}
                        onClick={() => handleCategoryFilter(cat)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {cat}
                      </motion.button>
                    ))}
                    {EXPENSE_CATEGORIES.map(cat => (
                      <motion.button
                        key={cat}
                        style={categoryChipStyle(filters.categories?.includes(cat) || false)}
                        onClick={() => handleCategoryFilter(cat)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '1.5rem' }}>
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionCardSkeleton key={i} />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <FontAwesomeIcon icon={faClipboardList} size="4x" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Nenhuma transação encontrada
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px' }}>
            {hasActiveFilters || localSearch
              ? 'Tente ajustar seus filtros ou busca'
              : 'Comece adicionando sua primeira transação'}
          </p>
          {!hasActiveFilters && !localSearch && (
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }}
              style={{
                ...buttonStyle,
                background: 'var(--primary)',
                color: '#0A0A0A'
              }}
            >
              <Plus size={16} />
              Adicionar Transação
            </button>
          )}
        </div>
      ) : (
        <motion.div
          style={{ display: 'flex', flexDirection: 'column' }}
          variants={containerVariants}
        >
          <motion.p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              marginBottom: '0.5rem'
            }}
            variants={itemVariants}
          >
            Mostrando {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
          </motion.p>
          <AnimatePresence mode="popLayout">
            {transactions.map(transaction => (
              <motion.div
                key={transaction.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <TransactionCard
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTransaction || undefined}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ ...deleteConfirm, show: false })}
      />
    </motion.div>
  );
}
