/*
 * =======================================================================
 * API DE ANALYTICS - GOD LEVEL CODER CHALLENGE
 * =======================================================================
 */

const express = require('express');
const { Pool } = require('pg');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
const port = 3001; // Porta padrão da API

// Middlewares
app.use(cors()); // Permite que o frontend acesse a API
app.use(express.json()); // Permite que a API entenda JSON

// Configuração do Banco de Dados
const pool = new Pool({
  user: 'challenge',
  host: 'localhost', // Mantenha localhost, pois o backend roda fora do Docker
  database: 'challenge_db',
  password: 'challenge_2024',
  port: 5432,
});

// =======================================================================
// HELPER: Construtor de Query Dinâmica (Seguro contra SQL Injection)
// =======================================================================
/**
 * Constrói dinamicamente uma cláusula WHERE com base nos query parameters.
 */
const buildWhereClause = (queryParams) => {
  const {
    startDate, endDate, store_id, channel_id,
    day_of_week, hour_of_day,
    // Filtros do Dashboard
    city,
    state,
    is_own
  } = queryParams;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (startDate) {
    conditions.push(`sale_date >= $${paramIndex++}`);
    values.push(startDate);
  }
  if (endDate) {
    conditions.push(`sale_date <= $${paramIndex++}`);
    values.push(endDate);
  }
  // Garante que store_id e channel_id só são adicionados se não forem vazios
  if (store_id && store_id !== '') {
    conditions.push(`store_id = $${paramIndex++}`);
    values.push(parseInt(store_id));
  }
  if (channel_id && channel_id !== '') {
    conditions.push(`channel_id = $${paramIndex++}`);
    values.push(parseInt(channel_id));
  }
  if (day_of_week) {
    conditions.push(`day_of_week = $${paramIndex++}`);
    values.push(parseInt(day_of_week));
  }
  if (hour_of_day) {
    conditions.push(`hour_of_day = $${paramIndex++}`);
    values.push(parseInt(hour_of_day));
  }

  // Filtros do Dashboard
  if (city && city !== '') {
    conditions.push(`city = $${paramIndex++}`);
    values.push(city);
  }
  if (state && state !== '') {
    conditions.push(`state = $${paramIndex++}`);
    values.push(state);
  }
  if (is_own && is_own !== '') {
    conditions.push(`is_own = $${paramIndex++}`);
    values.push(is_own === 'true'); // Converte string 'true'/'false' para boolean
  }

  const text = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  // Retorna paramIndex para sabermos qual o próximo índice a usar para o LIMIT
  return { text, values, paramIndex };
};


// =======================================================================
// ENDPOINTS DA API (PARA PÁGINA EXPLORAR)
// =======================================================================

const router = express.Router();

/**
 * Endpoint: Top N Itens (Produtos, Lojas, Canais)
 */
router.get('/top-products', async (req, res) => {
  const {
    sortBy = 'total_revenue',
    order = 'DESC',
    limit = 10,
    groupBy = 'product_name'
  } = req.query;

  // Validação de segurança
  const validSortBy = ['total_revenue', 'total_quantity'];
  const validOrder = ['DESC', 'ASC'];
  const validGroupBy = ['product_name', 'store_name', 'channel_name', 'sale_date'];

  if (!validSortBy.includes(sortBy) ||
      !validOrder.includes(order) ||
      !validGroupBy.includes(groupBy)) {
    return res.status(400).send('Parâmetros de ordenação ou agrupamento inválidos.');
  }

  const { text, values, paramIndex } = buildWhereClause(req.query);

  const query = `
    SELECT
      ${groupBy},
      SUM(product_total_price) AS total_revenue,
      SUM(quantity) AS total_quantity
    FROM
      mv_analytics_summary
    ${text}
    GROUP BY
      ${groupBy}
    ORDER BY
      ${sortBy} ${order}
    LIMIT
      $${paramIndex};
  `;

  try {
    const allValues = [...values, parseInt(limit)];
    const result = await pool.query(query, allValues);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro em /top-products:', err.message);
    res.status(500).send(err.message);
  }
});

/**
 * Endpoint: Performance de Ticket Médio
 */
router.get('/average-ticket', async (req, res) => {
  const {
      groupBy = 'sale_date',
      limit = 10,
      sortBy = 'average_ticket',
      order = 'DESC'
  } = req.query;

  const validGroupBy = ['channel_name', 'store_name', 'sale_date', 'day_of_week', 'month', 'product_name'];
  const validSortBy = ['average_ticket', 'total_revenue', 'total_sales'];
  const validOrder = ['DESC', 'ASC'];

  if (!validGroupBy.includes(groupBy) || !validSortBy.includes(sortBy) || !validOrder.includes(order)) {
    return res.status(400).send('Parâmetro "groupBy", "sortBy" ou "order" inválido.');
  }

  const { text, values, paramIndex } = buildWhereClause(req.query);

  const query = `
    SELECT
      ${groupBy},
      AVG(sale_total) as average_ticket,
      SUM(sale_total) as total_revenue,
      COUNT(sale_id) as total_sales
    FROM (
      SELECT DISTINCT ${groupBy}, sale_id, total_amount AS sale_total
      FROM mv_analytics_summary ${text}
    ) AS distinct_sales
    GROUP BY ${groupBy}
    ORDER BY ${sortBy} ${order}
    LIMIT $${paramIndex};
  `;
  try {
    const allValues = [...values, parseInt(limit)];
    const result = await pool.query(query, allValues);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro em /average-ticket:', err.message);
    res.status(500).send(err.message);
  }
});

/**
 * Endpoint: Performance de Tempo Operacional (Entrega / Produção)
 */
router.get('/delivery-performance', async (req, res) => {
  const {
    groupBy = 'sale_date',
    limit = 10,
    sortBy = 'avg_delivery_time',
    order = 'DESC'
  } = req.query;

  // Validação de segurança
  const validGroupBy = ['sale_date', 'store_name', 'channel_name', 'day_of_week', 'hour_of_day'];
  const validSortBy = ['avg_delivery_time', 'avg_production_time'];
  const validOrder = ['DESC', 'ASC'];

  if (!validGroupBy.includes(groupBy) ||
      !validSortBy.includes(sortBy) ||
      !validOrder.includes(order)) {
    return res.status(400).send('Parâmetro "groupBy", "sortBy" ou "order" inválido.');
  }

  const { text: whereClauseText, values, paramIndex } = buildWhereClause(req.query);

  let finalWhereClause = whereClauseText;
  const performanceCondition = "(delivery_minutes IS NOT NULL OR production_minutes IS NOT NULL)";
  if (finalWhereClause) {
    finalWhereClause += ` AND ${performanceCondition}`;
  } else {
    finalWhereClause = `WHERE ${performanceCondition}`;
  }

  const query = `
    SELECT
      ${groupBy},
      AVG(delivery_minutes) as avg_delivery_time,
      AVG(production_minutes) as avg_production_time
    FROM
      mv_analytics_summary
    ${finalWhereClause}
    GROUP BY
      ${groupBy}
    ORDER BY
      ${sortBy} ${order}
    LIMIT
      $${paramIndex};
  `;

  try {
    const allValues = [...values, parseInt(limit)];
    const result = await pool.query(query, allValues);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro em /delivery-performance:', err.message);
    res.status(500).send(err.message);
  }
});

/**
 * Endpoint: Clientes Em Risco (Churn)
 */
router.get('/at-risk-customers', async (req, res) => {
  const {
    minPurchases = 3,
    inactiveDays = 30
  } = req.query;
  const query = `
    SELECT
        c.id, c.customer_name, c.email, c.phone_number,
        COUNT(s.id) AS total_purchases,
        MAX(s.created_at) AS last_purchase_date
    FROM customers c JOIN sales s ON c.id = s.customer_id
    WHERE s.sale_status_desc = 'COMPLETED'
    GROUP BY c.id, c.customer_name, c.email, c.phone_number
    HAVING
        COUNT(s.id) >= $1
        AND MAX(s.created_at) < (CURRENT_DATE - INTERVAL '1 day' * $2)
    ORDER BY last_purchase_date ASC;
  `;
  try {
    const result = await pool.query(query, [parseInt(minPurchases), parseInt(inactiveDays)]);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro em /at-risk-customers:', err.message);
    res.status(500).send(err.message);
  }
});

// Registra todas as rotas de relatórios sob o prefixo /api/reports
app.use('/api/reports', router);

// =======================================================================
// ENDPOINTS PARA O DASHBOARD PRINCIPAL
// =======================================================================
app.get('/api/kpis', async (req, res) => {
  try {
    const whereClause = buildWhereClause(req.query);

    const kpiQuery = `
      SELECT
        SUM(CASE WHEN sale_status_desc = 'COMPLETED' THEN total_amount ELSE 0 END) AS "totalRevenue",
        COUNT(DISTINCT CASE WHEN sale_status_desc = 'COMPLETED' THEN sale_id END) AS "totalSales",
        AVG(CASE WHEN sale_status_desc = 'COMPLETED' THEN total_amount ELSE NULL END) AS "averageTicket",
        COUNT(CASE WHEN sale_status_desc = 'CANCELLED' THEN 1 END) * 1.0 / NULLIF(COUNT(DISTINCT sale_id), 0) AS "cancellationRate"
      FROM mv_analytics_summary
      ${whereClause.text};
    `;
    const { rows } = await pool.query(kpiQuery, whereClause.values);
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar KPIs:', err.message);
    res.status(500).json({ error: 'Erro ao buscar dados dos KPIs' });
  }
});

app.get('/api/sales-over-time', async (req, res) => {
  try {
    const whereClause = buildWhereClause(req.query);
    const completedCondition = "sale_status_desc = 'COMPLETED'";
    let finalWhereText = whereClause.text;

    if (whereClause.text) {
      finalWhereText += ` AND ${completedCondition}`;
    } else {
      finalWhereText = `WHERE ${completedCondition}`;
    }

    const chartQuery = `
      SELECT
        DATE(created_at) AS date,
        SUM(total_amount) AS faturamento
      FROM mv_analytics_summary
      ${finalWhereText}
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
    `;
    const { rows } = await pool.query(chartQuery, whereClause.values);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar dados do gráfico:', err.message);
    res.status(500).json({ error: 'Erro ao buscar dados do gráfico' });
  }
});

// =======================================================================
// ENDPOINTS DE FILTROS (PARA DASHBOARD E EXPLORER)
// =======================================================================

// *** CÓDIGO CORRIGIDO/RESTAURADO ***
app.get('/api/filters/stores', async (req, res) => {
  try {
    const query = `SELECT DISTINCT store_id, store_name FROM mv_analytics_summary ORDER BY store_name;`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar lojas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar lojas' });
  }
});

// *** CÓDIGO CORRIGIDO/RESTAURADO ***
app.get('/api/filters/channels', async (req, res) => {
  try {
    const query = `SELECT DISTINCT channel_id, channel_name FROM mv_analytics_summary ORDER BY channel_name;`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar canais:', err.message);
    res.status(500).json({ error: 'Erro ao buscar canais' });
  }
});

// Endpoint de filtro para Cidades (usado no Dashboard)
app.get('/api/filters/cities', async (req, res) => {
  try {
    const query = `SELECT DISTINCT city FROM mv_analytics_summary WHERE city IS NOT NULL ORDER BY city;`;
    const { rows } = await pool.query(query);
    res.json(rows.map(r => r.city)); // Retorna um array de strings
  } catch (err) {
    console.error('Erro ao buscar cidades:', err.message);
    res.status(500).json({ error: 'Erro ao buscar cidades' });
  }
});


// =======================================================================
// TAREFA AGENDADA (CRON JOB)
// =======================================================================
cron.schedule('*/15 * * * *', async () => {
  console.log('CRON: Iniciando atualização da Materialized View (mv_analytics_summary)...');
  try {
    const startTime = Date.now();
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_summary;');
    const duration = (Date.now() - startTime) / 1000;
    console.log(`CRON: Materialized View atualizada com sucesso (CONCURRENTLY) em ${duration} segundos.`);
  } catch (errConcurrent) {
    console.warn(`CRON: Falha ao atualizar CONCURRENTLY (índice único pode faltar): ${errConcurrent.message}. Tentando sem CONCURRENTLY...`);
    try {
       const startTime = Date.now();
       await pool.query('REFRESH MATERIALIZED VIEW mv_analytics_summary;');
       const duration = (Date.now() - startTime) / 1000;
       console.log(`CRON: Materialized View atualizada com sucesso (sem CONCURRENTLY) em ${duration} segundos.`);
    } catch (errNonConcurrent) {
       console.error('CRON: Erro GRAVE ao atualizar Materialized View:', errNonConcurrent.message);
    }
  }
});


// =======================================================================
// INICIAR O SERVIDOR
// =======================================================================
app.listen(port, () => {
  console.log(`======================================================================`);
  console.log(`Backend de Performance rodando em http://localhost:${port}`);
  console.log(`API de relatórios disponível em http://localhost:${port}/api/reports`);
  console.log(`API de filtros: /api/filters/stores, /api/filters/channels, /api/filters/cities`);
  console.log(`======================================================================`);
  console.log(`Lembre-se: A atualização da Materialized View roda a cada 15 minutos.`);
});