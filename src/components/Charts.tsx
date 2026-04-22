import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/utils/helpers';
import { formatCurrency } from '@/utils/helpers';

// Helper: darken a hex color by a percentage (0-1)
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

// Shared tooltip styles
const tooltipBase: React.CSSProperties = {
  borderRadius: '0.75rem',
  padding: '10px 16px',
  color: '#fff',
  fontSize: '0.875rem',
  fontWeight: 500,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  border: 'none',
  backdropFilter: 'blur(8px)',
  lineHeight: 1.6,
};

/* ─── Custom Tooltip: BarChart (Saldo Diário) ─── */
function BalanceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const color = payload[0]?.color || payload[0]?.fill || '#6366f1';
  return (
    <div style={{ ...tooltipBase, background: color, border: `1px solid ${darkenColor(color, 0.25)}` }}>
      <p style={{ margin: 0, fontWeight: 700, marginBottom: 2 }}>Dia {label}</p>
      <p style={{ margin: 0 }}>Saldo: {formatCurrency(payload[0].value)}</p>
    </div>
  );
}

/* ─── Custom Tooltip: LineChart (Tendência de Receitas) ─── */
function IncomeTrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const color = payload[0]?.stroke || payload[0]?.color || '#22c55e';
  return (
    <div style={{ ...tooltipBase, background: color, border: `1px solid ${darkenColor(color, 0.25)}` }}>
      <p style={{ margin: 0, fontWeight: 700, marginBottom: 2 }}>{label}</p>
      <p style={{ margin: 0 }}>Receitas: {formatCurrency(payload[0].value)}</p>
    </div>
  );
}

/* ─── Custom Tooltip: PieChart (Categorias) ─── */
function CategoryTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const color = entry?.payload?.color || entry?.payload?.fill || '#8b5cf6';
  return (
    <div style={{ ...tooltipBase, background: color, border: `1px solid ${darkenColor(color, 0.25)}` }}>
      <p style={{ margin: 0, fontWeight: 700, marginBottom: 2 }}>{entry.payload.name}</p>
      <p style={{ margin: 0 }}>{formatCurrency(entry.value)}</p>
    </div>
  );
}

interface BarChartProps {
  data: { date: string; balance: number }[];
  className?: string;
}

export function DailyBalanceChart({ data, className }: BarChartProps) {
  const chartData = data.map(d => ({
    ...d,
    day: d.date.split('-')[2]
  }));

  return (
    <div className={cn('chart-container', className)} style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            tickFormatter={(value) => `R$${value}`}
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={{ stroke: 'var(--border)' }}
            width={60}
          />
          <Tooltip content={<BalanceTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
          <Bar
            dataKey="balance"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LineChartProps {
  data: { month: string; amount: number }[];
  className?: string;
}

export function IncomeTrendChart({ data, className }: LineChartProps) {
  const chartData = data.map(d => ({
    ...d,
    monthLabel: d.month.split('-')[1] + '/' + d.month.split('-')[1]
  }));

  return (
    <div className={cn('chart-container', className)} style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            tickFormatter={(value) => `R$${value}`}
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={{ stroke: 'var(--border)' }}
            width={60}
          />
          <Tooltip content={<IncomeTrendTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="var(--color-income)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-income)', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: 'var(--color-income)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps {
  data: { category: string; amount: number; percentage: number }[];
  className?: string;
}

export function CategoryPieChart({ data, className }: PieChartProps) {
  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
  ];

  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[index % COLORS.length]
  }));

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className={cn('chart-container', className)} style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CategoryTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {total === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'var(--text-tertiary)'
        }}>
          <p style={{ fontSize: '0.875rem' }}>Sem dados</p>
        </div>
      )}
    </div>
  );
}
