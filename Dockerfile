FROM python:3.10-slim

WORKDIR /app

# --- LINHAS ADICIONADAS ---
# Instala o cliente do PostgreSQL (que inclui o comando 'psql')
# Sem isso, não conseguimos dar REFRESH na materialized view
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*
# -------------------------

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# (Não precisamos de CMD ou ENTRYPOINT pois o docker-compose define o 'command')