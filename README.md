# 🚀 RH TECH - MVP (Plataforma de Recrutamento Inteligente)
Uma solução SaaS completa para automação de processos seletivos, utilizando IA para análise de candidatos e testes psicométricos avançados.

## 🌟 Principais Funcionalidades (Escopo MVP)
### 1. Recrutamento Assistido por IA
- **Geração de JD**: Criação automática de descrições de cargos baseadas em competências.
- **Triagem Inteligente**: Análise automática de currículos cruzando dados com os requisitos da vaga.
- **Match Score**: Ranking de candidatos baseado em compatibilidade técnica e comportamental.
### 2. Avaliações Psicométricas
- **Testes Comportamentais**: Módulo de testes para avaliar traços de personalidade e fit cultural.
- **Portal do Candidato**: Interface simplificada para realização de testes e acompanhamento de status.
- **Relatórios PDF**: Geração de relatórios detalhados para os gestores de RH.
### 3. Gestão Multi-Tenant
- **Isolamento Total**: Dados separados por empresa (Company Isolation).
- **Gestão de Colaboradores**: Controle de quem pode visualizar e gerenciar cada vaga.
- **Dashboard de Gestão**: Visão geral de vagas abertas, candidatos inscritos e métricas de funil.
## 🏗️ Arquitetura Técnica
- **Backend**: NestJS + TurboRepo com Clean Architecture (Arquitetura Modular).
- **Frontend**: Next.js 14 com Tailwind CSS e Framer Motion para UI.
- **Banco de Dados**: PostgreSQL com PGVector para buscas semânticas via IA.
- **Fila de Processamento**: BullMQ com Redis para análise assíncrona de IA.
- **Infraestrutura**: Dockerizada e pronta para deploy em nuvem (AWS/EC2).
---
## 🏃 Como Rodar Localmente
1. `npm install`
2. `cp .env.example .env`
3. `docker compose up -d`
4. `npx prisma generate --schema=packages/database/prisma/schema.prisma`
5. `npm run dev`
---

Youtube: https://www.youtube.com/watch?v=0ibqzu1vm74
