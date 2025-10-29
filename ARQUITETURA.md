# 🏛️ Documentação de Decisões Arquiteturais - Nola God Level Challenge

## Introdução

Este documento detalha as principais decisões de arquitetura e tecnologia tomadas durante o desenvolvimento da solução para o desafio "God Level Coder". O objetivo principal foi criar uma plataforma de analytics **flexível, performática e intuitiva** para donos de restaurantes como a Maria, que não possuem conhecimento técnico aprofundado, mas necessitam extrair insights acionáveis dos seus dados operacionais.

## 1. Escolha da Stack Principal: Node.js (Backend) + React (Frontend)

### Porquê Node.js (com Express)?

* **Performance:** Node.js é conhecido pela sua arquitetura *non-blocking I/O*, ideal para APIs que lidam com muitas requisições simultâneas, como uma aplicação de dashboard.
* **Ecossistema:** O ecossistema npm oferece bibliotecas maduras para todas as necessidades do projeto (Express para o servidor web, `pg` para acesso ao PostgreSQL, `node-cron` para tarefas agendadas, `cors` para segurança).
* **Linguagem Unificada (Opcional):** Embora tenhamos usado TypeScript no frontend, a base JavaScript permite uma potencial partilha de lógica ou tipos, se necessário, e facilita a transição de contexto para desenvolvedores *full-stack*.
* **Simplicidade:** Express.js fornece uma estrutura minimalista e flexível, adequada para construir APIs RESTful de forma rápida e eficiente, sem *over-engineering* desnecessário para o escopo do desafio.

### Porquê React (com Vite e TypeScript)?

* **Componentização:** React permite criar uma interface de utilizador (UI) modular e reutilizável através de componentes (`KpiCard`, `ReportBarChart`, etc.), facilitando a manutenção e a extensão da aplicação.
* **Ecossistema Rico:** Bibliotecas como `react-router-dom` (para navegação), `recharts` (para gráficos) e `react-csv` (para exportação) integram-se perfeitamente e resolvem problemas comuns de UI de dashboards.
* **Developer Experience (Vite):** Vite oferece um ambiente de desenvolvimento extremamente rápido (*Hot Module Replacement* instantâneo), melhorando a produtividade.
* **Tipagem Estática (TypeScript):** TypeScript adiciona segurança e clareza ao código do frontend, ajudando a prevenir erros comuns em tempo de desenvolvimento, especialmente importante numa aplicação que lida com diferentes formatos de dados vindos da API.

## 2. A Peça Central da Performance: A Materialized View (`mv_analytics_summary`)

A decisão mais crítica para garantir a performance exigida (< 1s por query para 500k registos) foi a utilização de uma **Materialized View (MV)** no PostgreSQL.

### Porquê a Materialized View?

* **Pré-agregação:** As queries de analytics frequentemente exigem *joins* complexos entre várias tabelas (`sales`, `stores`, `channels`, `products`, etc.) e agregações (`SUM`, `AVG`, `COUNT`). Executar estas operações "ao vivo" a cada requisição seria lento.
* **Performance Consistente:** A MV armazena o resultado pré-calculado destes *joins* e algumas agregações básicas numa "tabela" física otimizada. As queries da API consultam **apenas** esta view simplificada, resultando em tempos de resposta extremamente rápidos e consistentes, independentemente da complexidade dos filtros aplicados pelo utilizador.
* **Simplificação da API:** A lógica da API torna-se mais simples, focando-se em filtrar e agrupar os dados já pré-processados na MV, em vez de lidar com *joins* complexos.

### Trade-offs: Performance vs. Tempo Real

* **Performance (Pró):** Ganho massivo de performance nas leituras (queries da API). É a única forma viável de garantir respostas < 1s com o volume de dados e a complexidade das perguntas da Maria.
* **Frescura dos Dados (Contra):** Os dados na MV não são atualizados em tempo real a cada nova venda. Eles refletem o estado da base de dados na última vez que a MV foi atualizada (`REFRESH MATERIALIZED VIEW`).
* **Mitigação:** Para este cenário (análise de tendências e performance histórica), dados atualizados a cada 15 minutos são perfeitamente aceitáveis. Implementámos um `node-cron` no backend que executa `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_summary;` a cada 15 minutos. A opção `CONCURRENTLY` (que requer um índice único na view) permite que a view seja atualizada sem bloquear as leituras da API, garantindo que o dashboard permaneça responsivo durante a atualização.

## 3. Como a API Garante Performance

A performance da API é garantida por uma combinação de fatores:

1.  **Consulta Exclusiva à Materialized View:** Como mencionado, 95% dos *endpoints* (`/api/kpis`, `/api/sales-over-time`, `/api/reports/*`) consultam **apenas** a `mv_analytics_summary`, que é uma tabela otimizada e pré-agregada. A única exceção é o relatório de "Clientes em Risco", que necessita consultar as tabelas `customers` e `sales` originais devido à granularidade por cliente.
2.  **Queries Otimizadas:** As queries SQL executadas pela API são desenhadas para serem eficientes na MV, utilizando `GROUP BY` e `WHERE` em colunas indexadas (implicitamente pela natureza da MV e potencialmente com índices adicionais se necessário).
3.  **Parâmetros Seguros:** O helper `buildWhereClause` no backend constrói as cláusulas `WHERE` dinamicamente com base nos filtros do utilizador, mas utiliza parâmetros preparados (`$1`, `$2`, etc.) para prevenir SQL Injection e permitir que o PostgreSQL otimize a execução da query.
4.  **Agregações no Servidor:** As agregações principais (`SUM`, `AVG`) são feitas eficientemente pelo PostgreSQL na MV. A API Node.js foca-se em receber os dados e enviá-los como JSON, sem realizar cálculos pesados.

## 4. Outras Decisões Relevantes

* **Separação Frontend/Backend:** Permite escalar e manter cada parte de forma independente. O frontend foca-se na UX, enquanto o backend foca-se na lógica de dados e performance. A comunicação via API RESTful (JSON) é um padrão robusto.
* **`react-router-dom`:** Utilizado para criar uma Single Page Application (SPA) com navegação clara entre o "Painel Principal" e a página "Explorar".
* **`recharts`:** Biblioteca escolhida para gráficos devido à sua flexibilidade e integração com React. Permitiu criar visualizações dinâmicas (barras/linhas) com tooltips e formatação customizada.
* **`react-csv`:** Utilizada para implementar facilmente a funcionalidade de exportação de dados, cumprindo um critério de sucesso explícito.
* **`cors`:** Middleware essencial no backend para permitir que o frontend (servido numa porta diferente) faça requisições à API de forma segura.
* **Funções Utilitárias (`formatters.ts`):** Centralizar a lógica de formatação de moeda, números e datas num local único (`src/utils`) melhora a consistência e a manutenção do código frontend.

## Conclusão

A arquitetura escolhida prioriza a **performance de leitura** e a **flexibilidade de consulta**, abordando diretamente as dores da persona Maria e os requisitos do desafio. A utilização da Materialized View é o pilar central que permite uma experiência de utilizador rápida e responsiva, mesmo com um volume considerável de dados, enquanto a combinação React + Node.js oferece um ambiente de desenvolvimento moderno e eficiente.