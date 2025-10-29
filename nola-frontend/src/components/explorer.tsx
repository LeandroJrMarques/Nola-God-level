import { useState, useEffect, useMemo } from 'react';
import { FiLoader, FiPlayCircle, FiDownload } from 'react-icons/fi';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import ReportBarChart from './ReportBarChart';
import ReportLineChart from './ReportLineChart';
import { CSVLink } from 'react-csv';

// --- Constantes e Tipos ---
const API_URL = 'http://localhost:3001';

type Store = { store_id: number; store_name: string; };
type Channel = { channel_id: number; channel_name: string; };
type ReportResult = Record<string, any>[];

function Explore() {
  // --- Estados para os Filtros ---
  const [reportType, setReportType] = useState('top-products');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [storeId, setStoreId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [limit, setLimit] = useState(10);
  const [groupBy, setGroupBy] = useState('product_name'); // Padrão para "Produto"

  // =======================================================
  // LÓGICA PARA OPÇÕES DE GROUP BY DINÂMICAS
  // =======================================================
  const availableGroupByOptions = useMemo(() => {
    // Opções padrão
    const baseOptions = [
      { value: 'sale_date', label: 'Dia' },
      { value: 'store_name', label: 'Loja' },
      { value: 'channel_name', label: 'Canal' },
    ];
    
    // Só adiciona "Produto" se NÃO for o relatório de performance de entrega
    if (reportType !== 'delivery-performance') {
      return [{ value: 'product_name', label: 'Produto' }, ...baseOptions];
    }
    
    return baseOptions;
  }, [reportType]); // Recalcula quando reportType muda

  // Efeito para ajustar o groupBy se a opção atual ficar inválida
  useEffect(() => {
    const currentOptionIsValid = availableGroupByOptions.some(opt => opt.value === groupBy);
    if (!currentOptionIsValid) {
      // Se a opção atual (ex: 'Produto') não for válida, volta para 'Dia'.
      setGroupBy('sale_date'); 
    }
  }, [availableGroupByOptions, groupBy]);
  // =======================================================

  // --- Estados para os Dropdowns ---
  const [stores, setStores] = useState<Store[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  
  // --- Estados para os Resultados ---
  const [results, setResults] = useState<ReportResult>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Efeito para Carregar os Filtros (Lojas e Canais) ---
  useEffect(() => {
    async function loadFilters() {
      try {
        const [storesRes, channelsRes] = await Promise.all([
          fetch(`${API_URL}/api/filters/stores`),
          fetch(`${API_URL}/api/filters/channels`)
        ]);
        setStores(await storesRes.json());
        setChannels(await channelsRes.json());
      } catch (err) {
        setError('Falha ao carregar filtros de loja/canal.');
      }
    }
    loadFilters();
  }, []);

  // --- Função para Executar o Relatório ---
  const handleRunReport = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const endpoint = reportType;
      const baseUrl = `${API_URL}/api/reports/${endpoint}`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (storeId) params.append('store_id', storeId);
      if (channelId) params.append('channel_id', channelId);
      if (limit) params.append('limit', String(limit));
      
      // Adiciona o groupBy
      params.append('groupBy', groupBy); 

      const response = await fetch(`${baseUrl}?${params.toString()}`);
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Erro da API: ${err}`);
      }
      const data: ReportResult = await response.json();
      if (data.length === 0) {
        setError("Nenhum resultado encontrado para estes filtros.");
      }
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Função para Renderizar a Tabela de Resultados (Fallback) ---
  const renderResultsTable = () => {
    if (!results || results.length === 0) return null;
    const headers = Object.keys(results[0]);
    const formatCell = (key: string, value: any): string => {
      const strValue = String(value ?? '');
      switch (key) {
        case 'sale_date': return formatDate(strValue);
        case 'average_ticket':
        case 'total_revenue':
        case 'faturamento': return formatCurrency(strValue);
        case 'total_sales':
        case 'total_quantity': return formatNumber(strValue);
        default:
          if (!isNaN(Number(strValue)) && strValue.includes('.')) {
            return parseFloat(strValue).toFixed(2);
          }
          return strValue;
      }
    };
    return ( <div className="results-table-container"> <table> <thead> <tr>{headers.map(h => <th key={h}>{h.replace(/_/g, ' ')}</th>)}</tr> </thead> <tbody> {results.map((row, i) => ( <tr key={i}> {headers.map(h => <td key={h}>{formatCell(h, row[h])}</td>)} </tr> ))} </tbody> </table> </div> );
  };

  // --- Função para Renderização Dinâmica ---
  const renderResults = () => {
    if (isLoading || !results || results.length === 0) {
      return null;
    }
    
    const nameKey = groupBy; 
    const xAxisKey = (groupBy === 'sale_date') ? 'sale_date' : nameKey;

    switch (reportType) {
      case 'top-products':
        if (groupBy === 'sale_date') {
          return ( <ReportLineChart data={results} dataKey="total_revenue" xAxisKey={xAxisKey} yAxisFormat="currency" /> );
        }
        return ( <ReportBarChart data={results} dataKey="total_revenue" nameKey={nameKey} yAxisFormat="currency" /> );
      
      case 'average-ticket':
        if (groupBy === 'sale_date') {
           return ( <ReportLineChart data={results} dataKey="average_ticket" xAxisKey={xAxisKey} yAxisFormat="currency" /> );
        }
        return ( <ReportBarChart data={results} dataKey="average_ticket" nameKey={nameKey} yAxisFormat="currency" /> );
      
      case 'delivery-performance':
        if (groupBy === 'sale_date') {
          return ( <ReportLineChart data={results} dataKey="avg_delivery_time" xAxisKey={xAxisKey} yAxisFormat="number" /> );
        }
        return ( <ReportBarChart data={results} dataKey="avg_delivery_time" nameKey={nameKey} yAxisFormat="number" /> );

      default:
        return renderResultsTable();
    }
  };

  // --- Geração de Cabeçalhos CSV ---
  const csvHeaders = useMemo(() => {
     if (!results || results.length === 0) return [];
     return Object.keys(results[0]).map(key => ({
       label: key.replace(/_/g, ' '),
       key: key
     }));
  }, [results]);

  return (
    <div className="explore">
      <header className="dashboard-header">
        <h1>Explorar Relatórios</h1>
        <p>Faça perguntas personalizadas aos seus dados.</p>
      </header>

      {/* --- Painel de Filtros --- */}
      <div className="filters-panel">
        
        {/* Seletor de Relatório */}
        <div className="filter-group">
          <label>1. Escolha o Relatório</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)}>
            <option value="top-products">Top Produtos (Receita)</option>
            <option value="average-ticket">Ticket Médio</option>
            {}
            <option value="delivery-performance">Performance de Entrega (Tempo)</option>
          </select>
        </div>

        {}
        <div className="filter-group">
          <label>2. Agrupar Resultados Por</label>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
            {/* USA AS OPÇÕES DINÂMICAS */}
            {availableGroupByOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        {/* Filtros de Data */}
        <div className="filter-group">
          <label>3. Escolha o Período (Opcional)</label>
          <div className="date-filters">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>até</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* Filtros Opcionais (Loja / Canal)  */}
        <div className="filter-group">
          <label>4. Filtros Adicionais (Opcional)</label>
          <div className="optional-filters">
            <select value={storeId} onChange={e => setStoreId(e.target.value)}>
              <option value="">Todas as Lojas</option>
              {stores.map(s => <option key={s.store_id} value={s.store_id}>{s.store_name}</option>)}
            </select>
            <select value={channelId} onChange={e => setChannelId(e.target.value)}>
              <option value="">Todos os Canais</option>
              {channels.map(c => <option key={c.channel_id} value={c.channel_id}>{c.channel_name}</option>)}
            </select>
          </div>
        </div>

        {/* Botão de Executar */}
        <button className="run-report-button" onClick={handleRunReport} disabled={isLoading}>
          {isLoading ? <FiLoader className="spinner-icon" /> : <FiPlayCircle />}
          {isLoading ? 'A Gerar...' : 'Gerar Relatório'}
        </button>
      </div>

      {/* --- Área de Resultados --- */}
      <div className="results-area">
        {error && <div className="explore-error">{error}</div>}
        {isLoading && !error && ( <div className="explore-loading"> <FiLoader className="spinner-icon" /> <p>A consultar a base de dados...</p> </div> )}
        
        {!isLoading && !error && renderResults()}

        {!isLoading && results && results.length > 0 && (
          <CSVLink
            data={results}
            headers={csvHeaders}
            filename={`relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`}
            className="download-report-button"
            target="_blank"
            asyncOnClick={true}
          >
            <FiDownload size={18} />
            Exportar Relatório (CSV)
          </CSVLink>
        )}
      </div>
    </div>
  );
}

export default Explore;