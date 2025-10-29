-- 1. Cria a estrutura da Visão Materializada
-- Esta view pré-agrega e junta os dados de vendas, produtos, lojas e canais para performance.
-- Usamos 'WITH NO DATA' para criar a estrutura instantaneamente.
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_analytics_summary AS
SELECT
    -- IDs principais para joins e indexação
    s.id AS sale_id,
    ps.product_id,
    s.store_id,
    s.channel_id,

    -- Dimensões (Nomes para agrupamento)
    p.name AS product_name,
    st.name AS store_name,
    c.name AS channel_name,

    -- Métricas (Valores para agregação)
    s.total_amount,          -- Valor total da *venda*
    ps.quantity,             -- Quantidade deste *produto*
    ps.total_price AS product_total_price, -- Valor total deste *produto*

    -- Status
    s.sale_status_desc,

    -- Timestamps & Partes Extraídas (para filtros e agrupamentos de data)
    s.created_at,
    DATE(s.created_at) AS sale_date,
    EXTRACT(DOW FROM s.created_at) AS day_of_week, -- 0=Domingo, 1=Segunda, ...
    EXTRACT(HOUR FROM s.created_at) AS hour_of_day,
    EXTRACT(MONTH FROM s.created_at) AS month,
    
    -- Métricas Operacionais (convertidas para minutos)
    (s.production_seconds / 60.0) AS production_minutes,
    (s.delivery_seconds / 60.0) AS delivery_minutes

FROM
    product_sales ps
JOIN
    sales s ON ps.sale_id = s.id
JOIN
    products p ON ps.product_id = p.id
JOIN
    stores st ON s.store_id = st.id
JOIN
    channels c ON s.channel_id = c.id
WITH NO DATA;

-- 2. Popula a Visão Materializada pela primeira vez
-- Este é o comando que o README.md espera que esteja neste arquivo.
-- Ele carrega os dados na view que acabamos de criar.
REFRESH MATERIALIZED VIEW mv_analytics_summary;