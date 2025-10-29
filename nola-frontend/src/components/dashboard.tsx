import { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import SalesChart from './saleschart'; 
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiCreditCard, 
  FiXCircle,
  FiMenu,
  FiLoader 
} from 'react-icons/fi';


type KpiData = {
  totalRevenue: string; 
  totalSales: string;
  averageTicket: string;
  cancellationRate: string;
  revenueChange: number | null;
  salesChange: number | null;
  ticketChange: number | null;
  cancellationChange: number | null;
};
type ChartData = {
  date: string;
  faturamento: string;    
};

const API_URL = 'http://localhost:3001';

function Dashboard() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const kpiResponse = await fetch(`${API_URL}/api/kpis`);
        if (!kpiResponse.ok) throw new Error('Falha ao buscar KPIs');
        const kpis: KpiData = await kpiResponse.json();
        setKpiData(kpis);

        const chartResponse = await fetch(`${API_URL}/api/sales-over-time`);
        if (!chartResponse.ok) throw new Error('Falha ao buscar dados do gráfico');
        const chart: ChartData[] = await chartResponse.json();
        setChartData(chart);

      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        setError(err.message || "Verifique a conexão com o backend.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);


  if (isLoading) {
    // ... (código de loading) ...
  }

  if (error) {
    // ... (código de erro) ...
  }

  // O JSX para renderizar
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <FiMenu size={24} className="mobile-menu-icon" />
        <h1>Dashboard</h1>
        <p>Overview completo do seu negócio</p>
      </header>

{/* Grelha de KPIs com dados reais */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(kpiData?.totalRevenue)}
          icon={<FiDollarSign size={24} />}
          iconBgColor="#22c55e"
        />
        <KpiCard
          title="Ticket Médio"
          value={formatCurrency(kpiData?.averageTicket)}
          icon={<FiCreditCard size={24} />}
          iconBgColor="#6366f1"
        />
        <KpiCard
          title="Total de Vendas"
          value={formatNumber(kpiData?.totalSales)}
          icon={<FiShoppingCart size={24} />}
          iconBgColor="#3b82f6"
        />
        <KpiCard
          title="Taxa de Cancelamento"
          value={formatPercent(kpiData?.cancellationRate)}
          icon={<FiXCircle size={24} />}
          iconBgColor="#ef4444"
        />
      </div>
      
      {/* Gráfico com dados reais */}
      <div className="chart-container">
        <h2>Vendas ao Longo do Tempo</h2>
        <p>Faturamento dos últimos 30 dias</p>
        <SalesChart data={chartData} /> {}
      </div>
    </div>
  );
}

export default Dashboard;