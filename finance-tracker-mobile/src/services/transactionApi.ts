import {
  Transaction,
  TransactionFormData,
  ApiResponse,
  TransactionsFilters,
  MonthlySummary
} from '../types';
import { db } from './database';

class TransactionApiService {
  async getAll(filters?: TransactionsFilters): Promise<ApiResponse<Transaction[]>> {
    const result = await db.getAll();

    if (!result.success || !result.data) {
      return result;
    }

    let filtered = result.data;

    // Apply filters client-side
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search)
      );
    }

    if (filters?.type && filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters?.categories) {
      const categories = Array.isArray(filters.categories)
        ? filters.categories
        : [filters.categories];
      filtered = filtered.filter(t => categories.includes(t.category));
    }

    if (filters?.month) {
      filtered = filtered.filter(t => {
        const transactionMonth = t.date.substring(0, 7);
        return transactionMonth === filters.month;
      });
    }

    // Sorting
    const sortBy = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return {
      success: true,
      data: filtered,
      meta: {
        total: filtered.length,
        month: filters?.month
      }
    };
  }

  async create(data: TransactionFormData): Promise<ApiResponse<Transaction>> {
    // Transform to match schema (handle date field)
    const transactionData = {
      ...data,
      date: data.date // already string
    };

    return db.create(transactionData);
  }

  async update(
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'created_at'>>
  ): Promise<ApiResponse<Transaction>> {
    return db.update(id, data);
  }

  async delete(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return db.delete(id);
  }

  async getSummary(filters?: { month?: string }): Promise<ApiResponse<MonthlySummary>> {
    // Get all transactions first
    const result = await db.getAll();
    if (!result.success || !result.data) {
      return {
        success: false,
        data: null,
        error: result.error || 'Failed to fetch transactions'
      };
    }

    const now = new Date();
    const month = filters?.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthTransactions = result.data.filter(t => {
      const tMonth = t.date.substring(0, 7);
      return tMonth === month;
    });

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Category breakdown for expenses
    const expenseByCategory: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.value;
      });

    const categoryBreakdown = Object.entries(expenseByCategory).map(([category, amount]) => ({
      category: category as Transaction['category'],
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }));

    // Calculate income trend for the last 6 months ending in the selected month
    const incomeTrend: { month: string; amount: number }[] = [];
    const [year, m] = month.split('-').map(Number);
    const selectedDate = new Date(year, m - 1, 1);
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const mTrans = result.data.filter(t => t.date.startsWith(monthStr));
      const mIncome = mTrans
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);

      incomeTrend.push({
        month: monthStr,
        amount: mIncome
      });
    }

    return {
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate,
        categoryBreakdown,
        incomeTrend
      }
    };
  }
}

export const transactionApi = new TransactionApiService();
