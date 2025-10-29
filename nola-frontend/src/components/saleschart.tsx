import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ChartData = {
  date: string;
  faturamento: string; 
};

type SalesChartProps = {
  data: ChartData[]; 
};

function SalesChart({ data }: SalesChartProps) {
  
  const formattedData = data.map(item => ({
    name: new Date(item.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit' }),
    faturamento: parseFloat(item.faturamento) 
  }));
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={formattedData} 
          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `R$ ${value / 1000}k`} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Faturamento']}
            labelFormatter={(label) => `Dia: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="faturamento" 
            stroke="#6366f1" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesChart;