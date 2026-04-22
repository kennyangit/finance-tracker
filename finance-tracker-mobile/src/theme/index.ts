export const colors = {
  bg: '#0f0f1a',
  bgSubtle: '#1a1a2e',
  bgCard: 'rgba(26, 26, 46, 0.95)',
  bgCardSolid: '#1a1a2e',
  bgElevated: '#222240',
  border: '#2a2a3e',
  borderSubtle: 'rgba(42, 42, 62, 0.6)',
  borderActive: '#7c3aed',

  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  textMuted: '#64748b',

  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  primaryLight: '#8b5cf6',
  primaryGlow: 'rgba(124, 58, 237, 0.3)',

  income: '#10b981',
  incomeDark: '#059669',
  incomeLight: '#34d399',
  incomeGlow: 'rgba(16, 185, 129, 0.2)',

  expense: '#ef4444',
  expenseDark: '#dc2626',
  expenseLight: '#f87171',
  expenseGlow: 'rgba(239, 68, 68, 0.2)',

  warning: '#f59e0b',
  warningDark: '#d97706',
  warningLight: '#fbbf24',

  info: '#3b82f6',
  infoDark: '#2563eb',
  infoLight: '#60a5fa',

  danger: '#ef4444',

  // Chart colors
  chartColors: [
    '#8b5cf6',
    '#06b6d4',
    '#f59e0b',
    '#ef4444',
    '#10b981',
    '#ec4899',
    '#3b82f6',
    '#f97316',
  ],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  }),
};

export const categoryIcons: Record<string, string> = {
  'Salário': 'briefcase',
  'Freelance': 'code',
  'Investimento': 'trending-up',
  'Presente': 'gift',
  'Moradia': 'home',
  'Alimentação': 'coffee',
  'Transporte': 'navigation',
  'Saúde': 'heart',
  'Educação': 'book-open',
  'Entretenimento': 'film',
  'Compras': 'shopping-bag',
  'Outro': 'more-horizontal',
};

export const categoryColors: Record<string, string> = {
  'Salário': '#8b5cf6',
  'Freelance': '#06b6d4',
  'Investimento': '#10b981',
  'Presente': '#f59e0b',
  'Moradia': '#ef4444',
  'Alimentação': '#f97316',
  'Transporte': '#3b82f6',
  'Saúde': '#ec4899',
  'Educação': '#8b5cf6',
  'Entretenimento': '#06b6d4',
  'Compras': '#f59e0b',
  'Outro': '#94a3b8',
};
