# 🚀 RH TECH - Plataforma de Recrutamento (Local Setup)

Guia rápido para rodar a plataforma de recrutamento inteligente em seu ambiente local.

## 🛠️ Stack Local
- **Backend**: NestJS + Prisma
- **Frontend**: Next.js 14
- **Serviços**: Postgres & Redis (via Docker)

---

## 🏃 Como Rodar na sua Máquina

### 1. Preparar o Ambiente
```bash
# Instalar todas as dependências do monorepo
npm install

# Configurar o arquivo de ambiente
cp .env.example .env
# Certifique-se de que DATABASE_URL aponta para localhost:5432 ou 5433 conforme seu docker-compose
```

### 2. Subir a Infraestrutura (Docker)
```bash
# Iniciar Postgres e Redis
docker-compose up -d

# Gerar o Prisma Client e aplicar o schema
npm run db:generate
npm run db:migrate
```

### 3. Iniciar o Projeto
```bash
# Rodar Backend e Frontend em paralelo usando Turbo
npm run dev
```

### 🔗 Acessos Rápidos
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API (Swagger)**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555) (via `npx prisma studio`)

---

## 📄 Notas
- O frontend e backend estão configurados para se comunicar via `localhost`.
- Certifique-se de que o Docker Desktop está rodando antes de iniciar.

---

## 🛡️ Multi-Tenancy & Segurança
- Isolamento de dados por `companyId` em todas as tabelas.
- Autenticação via JWT com Refresh Tokens em Cookies HttpOnly.
- Sessões isoladas por navegador para evitar vazamento de dados entre contas.

---

## 📄 Licença
Privado - Todos os direitos reservados.
