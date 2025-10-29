import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/formatters';

type ReportData = Record<string, any>[];
type ReportBarChartProps = {
  data: ReportData;
  dataKey: string;
  nameKey: string;
  yAxisFormat?: 'currency' | 'number';
};

function ReportBarChart({
  data,
  dataKey,
  nameKey,
  yAxisFormat = 'currency'
}: ReportBarChartProps) {

  const formattedData = data.map(item => ({
    ...item,
    [dataKey]: parseFloat(item[dataKey] || '0')
  })).sort((a, b) => a[dataKey] - b[dataKey]);

  const xAxisFormatter = (value: number) => {
    if (yAxisFormat === 'currency') {
      return value >= 1000 ? `R$ ${value / 1000}k` : `R$ ${value}`;
    }
    // Adiciona " min" se for formato número
    return `${formatNumber(String(value))} min`;
  };

  const tooltipFormatter = (value: number) => {
    const numStr = String(value);
    // Usa nameKey dinâmico para o label
    const label = nameKey.replace(/_/g, ' ');
    if (yAxisFormat === 'currency') {
      return [formatCurrency(numStr), label];
    }
    // Adiciona " min" se for formato número
    return [`${formatNumber(numStr)} min`, label];
  };

  return (
    <div className="results-table-container" style={{ height: '500px', padding: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        {}
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

          <XAxis
            type="number"
            stroke="#9ca3af"
            tickFormatter={xAxisFormatter}
          />

          {}
          <YAxis
            dataKey={nameKey} // Usa o nameKey dinâmico
            type="category"
            stroke="#9ca3af"
            interval={0}
            axisLine={false}
            tick={{ fontSize: 10 }} 
            tickMargin={15}       // Pequeno espaço entre eixo e texto
          />

          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={tooltipFormatter}
          />

          <Legend />

          {/* Mantém barSize fixo para evitar achatamento */}
          <Bar dataKey={dataKey} fill="#6366f1" radius={[0, 4, 4, 0]} barSize={35} />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ReportBarChart;