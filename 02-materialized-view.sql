-- 1. Cria a estrutura da Visão Materializada (com a chave única product_sale_id)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_analytics_summary AS
SELECT
    ps.id AS product_sale_id, -- Chave única
    s.id AS sale_id,
    ps.product_id,
    s.store_id,
    s.channel_id,
    p.name AS product_name,
    st.name AS store_name,
    c.name AS channel_name,
    s.total_amount,
    ps.quantity,
    ps.total_price AS product_total_price,
    s.sale_status_desc,
    s.created_at,
    DATE(s.created_at) AS sale_date,
    EXTRACT(DOW FROM s.created_at) AS day_of_week,
    EXTRACT(HOUR FROM s.created_at) AS hour_of_day,
    EXTRACT(MONTH FROM s.created_at) AS month,
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
REFRESH MATERIALIZED VIEW mv_analytics_summary;

-- 3. Cria o índice único (ESSENCIAL para refresh CONCURRENTLY)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_summary_unique ON mv_analytics_summary(product_sale_id);

-- 4. ADICIONA ÍNDICES PARA PERFORMANCE (O NOVO FIX)
-- Índices para os filtros da API
CREATE INDEX IF NOT EXISTS idx_mv_summary_sale_date ON mv_analytics_summary(sale_date);
CREATE INDEX IF NOT EXISTS idx_mv_summary_store_id ON mv_analytics_summary(store_id);
CREATE INDEX IF NOT EXISTS idx_mv_summary_channel_id ON mv_analytics_summary(channel_id);
-- Índice para a query de KPIs
CREATE INDEX IF NOT EXISTS idx_mv_summary_status ON mv_analytics_summary(sale_status_desc);