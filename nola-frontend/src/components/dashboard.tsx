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
  FiLoader,
  FiFilter
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
// FIM DO BLOCO

const API_URL = 'http://localhost:3001';

// Função para obter data de 30 dias atrás no formato YYYY-MM-DD
const get30DaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
};

function Dashboard() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NOVOS ESTADOS PARA FILTROS ---
  // Opções dos filtros
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  
  // Filtros selecionados
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(''); // '' = Todos, 'true' = Própria, 'false' = Franquia
  const [selectedStartDate, setSelectedStartDate] = useState(get30DaysAgo());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date().toISOString().split('T')[0]);
  // ------------------------------------

  // Efeito para buscar as opções dos filtros (cidades) UMA VEZ
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const cityResponse = await fetch(`${API_URL}/api/filters/cities`);
        if (!cityResponse.ok) throw new Error('Falha ao buscar cidades');
        const cities: string[] = await cityResponse.json();
        setCityOptions(cities);
      } catch (err: any) {
        console.error("Erro ao buscar filtros:", err);
      }
    }
    fetchFilterOptions();
  }, []);

  // Efeito principal para buscar os DADOS (KPIs e Gráfico)
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Constrói os parâmetros de busca
        const params = new URLSearchParams();
        if (selectedCity) params.append('city', selectedCity);
        if (selectedOwner) params.append('is_own', selectedOwner);
        if (selectedStartDate) params.append('startDate', selectedStartDate);
        if (selectedEndDate) params.append('endDate', selectedEndDate);

        const queryString = params.toString();

        // Busca KPIs com filtros
        const kpiResponse = await fetch(`${API_URL}/api/kpis?${queryString}`);
        if (!kpiResponse.ok) throw new Error('Falha ao buscar KPIs');
        const kpis: KpiData = await kpiResponse.json();
        setKpiData(kpis);

        // Busca Gráfico com filtros
        const chartResponse = await fetch(`${API_URL}/api/sales-over-time?${queryString}`);
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
  }, [selectedCity, selectedOwner, selectedStartDate, selectedEndDate]); // Gatilho


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
      
      {/* --- NOVA SEÇÃO DE FILTROS --- */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="startDate">De:</label>
          <input 
            type="date" 
            id="startDate"
            value={selectedStartDate}
            onChange={(e) => setSelectedStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">Até:</label>
          <input 
            type="date" 
            id="endDate"
            value={selectedEndDate}
            onChange={(e) => setSelectedEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="cityFilter">Cidade (Região):</label>
          <select id="cityFilter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="">Todas as Cidades</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="ownerFilter">Tipo (Dono):</label>
          <select id="ownerFilter" value={selectedOwner} onChange={(e) => setSelectedOwner(e.target.value)}>
            <option value="">Todos os Tipos</option>
            <option value="true">Loja Própria</option>
            <option value="false">Franquia</option>
          </select>
        </div>
      </div>
      {/* --------------------------- */}


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
        <p>Faturamento para o período e filtros selecionados</p>
        <SalesChart data={chartData} /> {}
      </div>
    </div>
  );
}

export default Dashboard;