# 🏆 Solução - God Level Coder Challenge: Analytics para Restaurantes

Esta aplicação é uma plataforma de analytics desenhada para permitir que donos de restaurantes, como a persona Maria, explorem os seus dados operacionais de forma intuitiva, gerem insights e tomem decisões de negócio informadas. A solução foca-se em performance, flexibilidade e usabilidade para um utilizador não-técnico.

## ✨ Funcionalidades Principais

* **Painel Principal:** Visão geral com KPIs chave (Receita Total, Ticket Médio, Vendas Totais, Taxa de Cancelamento) e gráfico de vendas ao longo do tempo.
* **Exploração de Relatórios:** Interface interativa para criar análises personalizadas, permitindo:
    * Selecionar o tipo de relatório (Top Produtos, Ticket Médio, Performance de Entrega).
    * **Agrupar** os resultados por diferentes dimensões (Dia, Produto, Loja, Canal).
    * Filtrar por período de datas, loja específica e canal específico.
    * Visualizar os resultados em gráficos dinâmicos (barras ou linhas) ou tabelas.
* **Exportação de Dados:** Funcionalidade para exportar os resultados dos relatórios gerados para formato CSV.
* **Performance Otimizada:** Utilização de uma Materialized View no PostgreSQL, atualizada periodicamente, para garantir que as consultas da API sejam respondidas em menos de 1 segundo.

## 🛠️ Tecnologias Utilizadas

* **Backend:** Node.js, Express.js, node-postgres (`pg`), `node-cron`
* **Frontend:** React, Vite, TypeScript, `recharts`, `react-router-dom`, `react-csv`
* **Base de Dados:** PostgreSQL 15
* **Orquestração:** Docker, Docker Compose
* **Geração de Dados:** Python (`psycopg2-binary`, `Faker`)

## 🚀 Como Executar Localmente (Setup Completo)

Siga estes passos **exatamente** pela ordem indicada. É necessário ter o **Docker Desktop** instalado e em execução.

### 1. Clonar o Repositório

```bash
git clone https://github.com/LeandroJrMarques/Nola-God-level
cd /LeandroJrMarques/Nola-God-level
````

### 2\. Iniciar a Base de Dados e Gerar os Dados (Docker)

Estes comandos irão:
a.  Criar e iniciar o contentor do PostgreSQL em background.
b.  Construir (se necessário) e executar o contentor Python que cria o schema e popula a base de dados com \~500k vendas. **Este passo pode demorar entre 5 a 15 minutos.**

```bash
# Navegue para a pasta raiz do projeto (onde está o docker-compose.yml)

# Garante que não há volumes antigos (importante!)
docker compose down -v --remove-orphans

# Inicia o PostgreSQL em background
docker compose up -d postgres

# Espera uns segundos para o postgres iniciar completamente
echo "Aguardando o PostgreSQL iniciar..."
sleep 10 

# Executa o script de geração de dados
echo "Iniciando a geração de dados (pode demorar 5-15 minutos)..."
docker compose run --rm data-generator

# Verifica se os dados foram gerados (deve retornar ~500k)
echo "Verificando contagem de vendas..."
docker compose exec postgres psql -U challenge -d challenge_db -c "SELECT COUNT(*) FROM sales;"

# Cria a Materialized View (primeira execução)
echo "Criando e populando a Materialized View..."
docker compose exec postgres psql -U challenge -d challenge_db -f /docker-entrypoint-initdb.d/02-materialized-view.sql 
# (NOTA: Certifique-se que tem o ficheiro 02-materialized-view.sql com o CREATE e REFRESH)

# (Opcional) Cria o índice único para refresh concorrente
docker compose exec postgres psql -U challenge -d challenge_db -c "CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_summary_unique ON mv_analytics_summary(sale_id, product_id);"

echo "Setup da Base de Dados concluído!"
```

**Nota:** Certifique-se de que tem um ficheiro `02-materialized-view.sql` (ou similar) montado no volume do Docker com o `CREATE MATERIALIZED VIEW mv_analytics_summary AS ...` e um `REFRESH MATERIALIZED VIEW mv_analytics_summary;` inicial.

### 3\. Iniciar o Backend (Node.js API)

Abra um **novo terminal**.

```bash
# Navegue para a pasta do backend
cd backend  # Ou o nome da sua pasta backend

# Instale as dependências
npm install

# Inicie o servidor da API
node index.js
```

O terminal deverá mostrar "Backend de Performance rodando em http://localhost:3001". Mantenha este terminal aberto.

### 4\. Iniciar o Frontend (React App)

Abra um **terceiro terminal**.

```bash
# Navegue para a pasta do frontend
cd nola-frontend # Ou o nome da sua pasta frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento Vite
npm run dev
```

O terminal deverá mostrar uma URL local, tipicamente `http://localhost:5173`.

### 5\. Aceder à Aplicação

Abra o seu navegador e aceda à URL fornecida pelo Vite no passo anterior (ex: `http://localhost:5173`).

A aplicação deverá carregar, mostrando o Painel Principal.

## 📄 Documentação Adicional

  * **Decisões Arquiteturais:** Consulte o ficheiro [ARQUITETURA.md](./documentação/ARQUITETURA.md) para uma explicação detalhada das escolhas técnicas.
  * **Contexto do Problema:** [PROBLEMA.md](./documentação/PROBLEMA.md)
  * **Detalhes dos Dados:** [DADOS.md](./documentação/DADOS.md)
  * **Critérios de Avaliação:** [AVALIACAO.md](./documentação/AVALIACAO.md)

-----

*Nola • 2025*

```

