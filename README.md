# 🚀 RH TECH - Plataforma de Recrutamento com IA e Psicometria

Plataforma SaaS multi-tenant focada em recrutamento inteligente, utilizando IA (Claude/Grok) para análise de candidatos e testes psicométricos (DISC, Eneagrama).

## 🛠️ Stack Tecnológica

- **Monorepo**: TurboRepo
- **Backend**: NestJS (Fastify), Prisma, PostgreSQL (pgvector), Redis, BullMQ
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Zustand
- **IA**: Anthropic (Claude 3.5 Sonnet) & xAI (Grok)
- **Infra**: Docker, Nginx, PM2, AWS S3

---

## 🏃 Como Rodar Localmente

### 1. Pré-requisitos
- Node.js >= 20
- Docker & Docker Compose

### 2. Configuração inicial
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencha as chaves no arquivo .env
```

### 3. Banco de Dados (Docker)
```bash
# Subir containers (Postgres + Redis)
docker-compose up -d

# Gerar o cliente Prisma e rodar migrations
npm run db:generate
npm run db:migrate
```

### 4. Iniciar Desenvolvimento
```bash
# Rodar todos os apps simultaneamente
npm run dev
```
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

---

## 🏗️ Guia de Deploy (Produção)

### Backend (EC2)
1. Clone o repositório na instância.
2. Instale dependências: `npm install`.
3. Configure o `.env` de produção (mude URLs de localhost para o seu domínio).
4. Suba o banco no Docker: `docker-compose up -d`.
5. Gere o Prisma e faça o Build:
   ```bash
   npm run db:generate
   npm run build -- --filter=@saas-rh/api
   ```
6. Inicie com PM2:
   ```bash
   cd apps/api
   pm2 start dist/main.js --name "rh-api"
   ```
7. Configure o **Nginx** como Proxy Reverso e o **Certbot** para HTTPS.

### Frontend (Vercel)
1. Conecte o repositório ao Vercel.
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`: URL da sua API no EC2 (ex: `https://api.rh-tech.com/api/v1`)
3. O deploy será automático via CI/CD.

---

## 🛡️ Multi-Tenancy & Segurança
- Isolamento de dados por `companyId` em todas as tabelas.
- Autenticação via JWT com Refresh Tokens em Cookies HttpOnly.
- Sessões isoladas por navegador para evitar vazamento de dados entre contas.

---

## 📄 Licença
Privado - Todos os direitos reservados.
