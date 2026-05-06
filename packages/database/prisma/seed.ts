/**
 * Prisma Seed — dados de demonstração para desenvolvimento
 *
 * Execução: npx prisma db seed --schema=../../packages/database/prisma/schema.prisma
 */

import { PrismaClient } from '../../node_modules/.prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ─── Empresa demo ───────────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { cnpj: '11.222.333/0001-81' },
    update: {},
    create: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      razaoSocial: 'TechCorp Sistemas Ltda',
      cnpj: '11.222.333/0001-81',
      websiteUrl: 'https://techcorp.com.br',
      companyProfile: 'STARTUP',
      companyContext:
        'TechCorp é uma startup de tecnologia focada em soluções SaaS para o mercado de RH. ' +
        'Valorizamos inovação, autonomia e cultura de alto desempenho. ' +
        'Nossa equipe tem crescido 50% ao ano e buscamos pessoas apaixonadas por tecnologia e impacto.',
      cultureValues: ['Inovação', 'Autonomia', 'Transparência', 'Alto Desempenho', 'Impacto'],
      mainChallenges: 'Escalar o time mantendo qualidade de entrega e cultura forte.',
      leadershipStyle: 'Liderança horizontal, foco em OKRs e resultados mensuráveis.',
      onboardingStatus: 'COMPLETED',
    },
  });

  console.log(`✅ Empresa criada: ${company.razaoSocial}`);

  // ─── Usuário Admin ──────────────────────────────────────────────────────────
  // Senha: Admin@123456 (hash bcrypt rounds=10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@techcorp.com.br' },
    update: {},
    create: {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      companyId: company.id,
      email: 'admin@techcorp.com.br',
      passwordHash: '$2b$10$YKG4cMhT8gf4qX7UW3xaE.rXnG.OJe/VWqz2QKjVBklFzNpxmBDpG',
      name: 'Admin TechCorp',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Usuário criado: ${user.email} (senha: Admin@123456)`);

  // ─── Usuário HR ─────────────────────────────────────────────────────────────
  const hrUser = await prisma.user.upsert({
    where: { email: 'rh@techcorp.com.br' },
    update: {},
    create: {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      companyId: company.id,
      email: 'rh@techcorp.com.br',
      passwordHash: '$2b$10$YKG4cMhT8gf4qX7UW3xaE.rXnG.OJe/VWqz2QKjVBklFzNpxmBDpG',
      name: 'Maria Silva',
      role: 'HR',
    },
  });

  console.log(`✅ Usuário RH criado: ${hrUser.email}`);

  // ─── Organograma ────────────────────────────────────────────────────────────
  const ceo = await prisma.collaborator.upsert({
    where: { id: 'd4e5f6a7-b8c9-0123-defa-234567890123' },
    update: {},
    create: {
      id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      companyId: company.id,
      name: 'Carlos Mendes',
      email: 'ceo@techcorp.com.br',
      role: 'CEO',
      department: 'Diretoria',
    },
  });

  const cto = await prisma.collaborator.upsert({
    where: { id: 'e5f6a7b8-c9d0-1234-efab-345678901234' },
    update: {},
    create: {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      companyId: company.id,
      name: 'Ana Souza',
      email: 'cto@techcorp.com.br',
      role: 'CTO',
      department: 'Tecnologia',
      parentId: ceo.id,
    },
  });

  await prisma.collaborator.upsert({
    where: { id: 'f6a7b8c9-d0e1-2345-fabc-456789012345' },
    update: {},
    create: {
      id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
      companyId: company.id,
      name: 'Pedro Lima',
      role: 'Tech Lead',
      department: 'Tecnologia',
      parentId: cto.id,
    },
  });

  console.log('✅ Organograma criado (CEO → CTO → Tech Lead)');

  // ─── Vaga demo ──────────────────────────────────────────────────────────────
  const job = await prisma.job.upsert({
    where: { id: 'a7b8c9d0-e1f2-3456-abcd-567890123456' },
    update: {},
    create: {
      id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
      companyId: company.id,
      title: 'Desenvolvedor(a) Backend Sênior (Node.js)',
      description:
        'Buscamos um desenvolvedor backend sênior para liderar a evolução da nossa plataforma SaaS. ' +
        'Você trabalhará com tecnologias modernas e terá autonomia para tomar decisões técnicas.',
      requirements: [
        'Node.js (5+ anos)',
        'TypeScript avançado',
        'PostgreSQL e Redis',
        'Arquitetura de microsserviços',
        'Experiência com Cloud (AWS/GCP)',
      ],
      salaryMin: 12000,
      salaryMax: 18000,
      isRemote: true,
      status: 'ACTIVE',
      responsibleId: cto.id,
    },
  });

  console.log(`✅ Vaga criada: ${job.title}`);

  // ─── Candidato demo ─────────────────────────────────────────────────────────
  const candidate = await prisma.candidate.upsert({
    where: { id: 'b8c9d0e1-f2a3-4567-bcde-678901234567' },
    update: {},
    create: {
      id: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
      companyId: company.id,
      jobId: job.id,
      name: 'João Ferreira',
      email: 'joao@exemplo.com',
      phone: '(11) 99999-8888',
      status: 'REGISTERED',
      lgpdConsent: true,
      consentAt: new Date(),
    },
  });

  console.log(`✅ Candidato criado: ${candidate.name}`);

  // ─── TestSession com token demo ─────────────────────────────────────────────
  const testToken = randomBytes(32).toString('hex');
  const testSession = await prisma.testSession.create({
    data: {
      companyId: company.id,
      candidateId: candidate.id,
      token: testToken,
      status: 'PENDING',
      currentTest: 'DISC',
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
    },
  }).catch(() => null); // ignorar se já existe

  if (testSession) {
    console.log(`✅ TestSession criado — token: ${testToken}`);
    console.log(`   URL: http://localhost:3000/teste/${testToken}`);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('──────────────────────────────────────────────');
  console.log('📧 Admin: admin@techcorp.com.br / Admin@123456');
  console.log('📧 RH:    rh@techcorp.com.br   / Admin@123456');
  console.log('──────────────────────────────────────────────');
}

main()
  .catch((e) => { console.error('❌ Seed falhou:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
