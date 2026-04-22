import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Transaction,
  TransactionsFilters,
  MonthlySummary,
  TransactionFormData
} from '@/types';
import { transactionApi } from '@/services/transactionApi';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: TransactionsFilters;
  summary: MonthlySummary | null;
  selectedMonth: string;
}

type TransactionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'REMOVE_TRANSACTION'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TransactionsFilters> }
  | { type: 'SET_SUMMARY'; payload: MonthlySummary | null }
  | { type: 'SET_SELECTED_MONTH'; payload: string };

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
  filters: {
    type: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  },
  summary: null,
  selectedMonth: new Date().toISOString().slice(0, 7) // YYYY-MM
};

function transactionReducer(
  state: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: false };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        )
      };
    case 'REMOVE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_SELECTED_MONTH':
      return { ...state, selectedMonth: action.payload };
    default:
      return state;
  }
}

const TransactionContext = createContext<{
  state: TransactionState;
  dispatch: React.Dispatch<TransactionAction>;
  fetchTransactions: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  createTransaction: (data: TransactionFormData) => Promise<boolean>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'created_at'>>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  setFilters: (filters: Partial<TransactionsFilters>) => void;
  setSelectedMonth: (month: string) => void;
} | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const fetchTransactions = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const result = await transactionApi.getAll({
      ...state.filters,
      month: state.selectedMonth
    });

    if (result.success && result.data) {
      dispatch({ type: 'SET_TRANSACTIONS', payload: result.data });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to fetch transactions' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchSummary = async () => {
    const result = await transactionApi.getSummary({ month: state.selectedMonth });

    if (result.success && result.data) {
      dispatch({ type: 'SET_SUMMARY', payload: result.data });
    }
  };

  const createTransaction = async (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    const result = await transactionApi.create(data);

    if (result.success && result.data) {
      dispatch({ type: 'ADD_TRANSACTION', payload: result.data });
      await fetchSummary();
      return true;
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create transaction' });
      return false;
    }
  };

  const updateTransaction = async (
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'created_at'>>
  ): Promise<boolean> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    const result = await transactionApi.update(id, data);

    if (result.success && result.data) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: result.data });
      await fetchSummary();
      return true;
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to update transaction' });
      return false;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    const result = await transactionApi.delete(id);

    if (result.success) {
      dispatch({ type: 'REMOVE_TRANSACTION', payload: id });
      await fetchSummary();
      return true;
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to delete transaction' });
      return false;
    }
  };

  const setFilters = (filters: Partial<TransactionsFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSelectedMonth = (month: string) => {
    dispatch({ type: 'SET_SELECTED_MONTH', payload: month });
  };

  // Fetch data when filters or selected month changes
  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [state.filters, state.selectedMonth]);

  const value = {
    state,
    dispatch,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    setSelectedMonth
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
