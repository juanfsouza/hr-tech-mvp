#!/bin/sh
set -e

echo "⏳ Aguardando PostgreSQL em $DB_HOST:$DB_PORT..."

until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-saasrh}"; do
  echo "   PostgreSQL ainda não está pronto. Tentando novamente em 2s..."
  sleep 2
done

echo "✅ PostgreSQL pronto!"

echo "⚙️  Gerando Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "🔄 Aplicando schema no banco..."
# db push é seguro para MVP: cria/atualiza tabelas sem precisar de migrations
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "🚀 Iniciando API NestJS..."
exec node dist/main
