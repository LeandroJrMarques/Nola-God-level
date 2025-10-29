
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

type ReportData = Record<string, any>[];
type ReportLineChartProps = {
  data: ReportData;
  dataKey: string;
  xAxisKey: string;
  yAxisFormat: 'currency' | 'number'; 
};

function ReportLineChart({ data, dataKey, xAxisKey, yAxisFormat }: ReportLineChartProps) {
  
  const formattedData = data.map(item => ({
    ...item,
    [dataKey]: parseFloat(item[dataKey] || '0'),
    formattedXAxis: formatDate(item[xAxisKey])
  }));

 
  

  const yAxisFormatter = (value: string | number) => {
    const numStr = String(value);
    if (yAxisFormat === 'currency') {
      return formatCurrency(numStr);
    }
     
    return formatNumber(numStr);
  };

   
  const tooltipFormatter = (value: number) => {
    const numStr = String(value);
    const label = dataKey.replace(/_/g, ' ');

    if (yAxisFormat === 'currency') {
      return [formatCurrency(numStr), label];
    }
    
    return [`${formatNumber(numStr)} min`, label];
  };
   

  return (
    <div className="results-table-container" style={{ height: '400px', padding: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis dataKey="formattedXAxis" stroke="#9ca3af" />
          
          <YAxis 
            stroke="#9ca3af"
            tickFormatter={yAxisFormatter} 
          />
          
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={tooltipFormatter}  
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke="#6366f1" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ReportLineChart;