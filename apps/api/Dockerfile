# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Ferramentas para compilar pacotes nativos (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copia manifests do monorepo (sem código-fonte)
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Instala SEM flags de workspace para garantir hoisting correto na raiz
RUN npm install --legacy-peer-deps

# ─── Stage 2: build ───────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

# Copia código-fonte
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/database ./packages/database

# Gera Prisma Client
RUN cd packages/database && npx prisma generate --schema=./prisma/schema.prisma

# Compila TypeScript
RUN cd apps/api && npx nest build

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl postgresql-client

ENV NODE_ENV=production

# Copia o build e node_modules da raiz (todos os pacotes hoistados)
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/database/prisma ./prisma
COPY --from=build /app/packages/database/node_modules/.prisma ./node_modules/.prisma

# Entrypoint
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3333

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://127.0.0.1:3333/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
