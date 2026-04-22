export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 'Salário' | 'Freelance' | 'Investimento' | 'Presente' | 'Outro';
export type ExpenseCategory = 'Moradia' | 'Alimentação' | 'Transporte' | 'Saúde' | 'Educação' | 'Entretenimento' | 'Compras' | 'Outro';
export type Category = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  title: string;
  description?: string;
  value: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO 8601
  created_at: string; // ISO 8601 (Supabase uses snake_case)
  updated_at: string; // ISO 8601 (Supabase uses snake_case)
}

export interface TransactionFormData {
  title: string;
  description?: string;
  value: number;
  type: TransactionType;
  category: Category;
  date: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: string;
  meta?: {
    total: number;
    month?: string;
  };
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  categoryBreakdown: {
    category: Category;
    amount: number;
    percentage: number;
  }[];
}

export interface TransactionsFilters {
  search?: string;
  type?: TransactionType | 'all';
  categories?: Category[];
  month?: string; // YYYY-MM
  sortBy?: 'date' | 'value' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export const INCOME_CATEGORIES: IncomeCategory[] = ['Salário', 'Freelance', 'Investimento', 'Presente', 'Outro'];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Compras', 'Outro'];
export const ALL_CATEGORIES: Category[] = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const getCategoriesByType = (type: TransactionType): Category[] => {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};
