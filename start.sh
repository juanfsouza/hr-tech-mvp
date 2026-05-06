#!/bin/bash
# ─── SaaS RH — Script de Inicialização Docker ─────────────────────────────────
set -e

COMPOSE_FILE="$(dirname "$0")/docker-compose.yml"
cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║                        HR TECH                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Verifica se Docker está rodando (tenta com e sem sudo)
if ! docker info > /dev/null 2>&1; then
  if ! sudo docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Execute: sudo service docker start"
    exit 1
  fi
  # Daemon está rodando mas usuário não está no grupo docker
  echo "⚠️  Rodando com sudo. Para evitar isso: sudo usermod -aG docker \$USER && newgrp docker"
  DOCKER_CMD="sudo docker"
  COMPOSE_CMD="sudo docker compose"
else
  DOCKER_CMD="docker"
  COMPOSE_CMD="docker compose"
fi

# ─── Passo 1: Sobe infra (Postgres + Redis) ────────────────────────────────────
echo "📦 [1/3] Subindo PostgreSQL e Redis..."
$COMPOSE_CMD up -d postgres redis

echo "⏳ Aguardando PostgreSQL ficar saudável..."
until $COMPOSE_CMD exec -T postgres pg_isready -U postgres -d saasrh > /dev/null 2>&1; do
  printf "."
  sleep 2
done
echo ""
echo "✅ PostgreSQL pronto!"

echo "⏳ Aguardando Redis ficar saudável..."
until $COMPOSE_CMD exec -T redis redis-cli -a redis123 ping 2>/dev/null | grep -q PONG; do
  printf "."
  sleep 2
done
echo ""
echo "✅ Redis pronto!"

# ─── Passo 2: Build e sobe a API ───────────────────────────────────────────────
echo ""
echo "🔨 [2/3] Buildando imagem da API (pode demorar na primeira vez)..."
$COMPOSE_CMD build api

echo ""
echo "🚀 [3/3] Subindo API..."
$COMPOSE_CMD up -d api

echo ""
echo "⏳ Aguardando API responder no health check..."
MAX=30
COUNT=0
until curl -sf http://localhost:3333/health > /dev/null 2>&1; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX ]; then
    echo ""
    echo "❌ Timeout: API não respondeu em 60s. Veja os logs:"
    echo "   $COMPOSE_CMD logs api --tail=50"
    exit 1
  fi
  printf "."
  sleep 2
done

echo ""
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Backend rodando com sucesso!                    ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  API:       http://localhost:3333/api/v1             ║"
echo "║  Swagger:   http://localhost:3333/api/docs           ║"
echo "║  Health:    http://localhost:3333/health             ║"
echo "║  Postgres:  localhost:5432  (db: hr-tech)            ║"
echo "║  Redis:     localhost:6379                           ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Logs:    $COMPOSE_CMD logs -f api                   ║"
echo "║  Parar:   $COMPOSE_CMD down                          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

