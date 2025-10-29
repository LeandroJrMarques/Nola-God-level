// backend/api.test.js
const request = require('supertest');

// Assumimos que a API está a rodar em localhost:3001, conforme o seu index.js
const api = request('http://localhost:3001');

// NOTA: Estes testes esperam que a API (node index.js) e a Base de Dados (docker)
// estejam a ser executados, conforme o seu README.md.

describe('API Endpoints', () => {

  // Teste "Smoke" para um endpoint principal
  it('GET /api/kpis - deve retornar os KPIs principais', async () => {
    const res = await api.get('/api/kpis');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    // Verifica se a estrutura de dados esperada está presente
    expect(res.body).toHaveProperty('totalRevenue');
    expect(res.body).toHaveProperty('totalSales');
    expect(res.body).toHaveProperty('averageTicket');
    expect(res.body).toHaveProperty('cancellationRate');
  });

  // Teste para um endpoint de filtros
  it('GET /api/filters/stores - deve retornar uma lista de lojas', async () => {
    const res = await api.get('/api/filters/stores');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    // Se houver dados, verifica a estrutura do primeiro item
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('store_id');
      expect(res.body[0]).toHaveProperty('store_name');
    }
  });

  // Teste para um endpoint de relatório (sem filtros)
  it('GET /api/reports/top-products - deve retornar 200 OK', async () => {
    const res = await api.get('/api/reports/top-products?limit=5');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  // Teste para um endpoint de relatório (com filtros)
  it('GET /api/reports/average-ticket - deve aplicar filtros e agrupamento', async () => {
    const res = await api
      .get('/api/reports/average-ticket')
      .query({
        groupBy: 'channel_name',
        limit: 3,
        store_id: 1 // Assumindo que existe uma loja com ID 1
      });
      
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('channel_name');
      expect(res.body[0]).toHaveProperty('average_ticket');
    }
  });

  // Teste de validação (MUITO IMPORTANTE)
  // O seu código já trata disto
  it('GET /api/reports/top-products - deve retornar 400 para groupBy inválido', async () => {
    const res = await api
      .get('/api/reports/top-products')
      .query({
        groupBy: 'INVALID_COLUMN_NAME' // Parâmetro inválido
      });
      
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Parâmetros de ordenação ou agrupamento inválidos.');
  });
  
  it('GET /api/reports/delivery-performance - deve retornar 400 para sortBy inválido', async () => {
    const res = await api
      .get('/api/reports/delivery-performance')
      .query({
        sortBy: 'INVALID_COLUMN_NAME' // Parâmetro inválido
      });
      
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Parâmetro "groupBy", "sortBy" ou "order" inválido.');
  });
});