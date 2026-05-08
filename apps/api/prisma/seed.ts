import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Criar Usuário Admin
  const user = await prisma.user.upsert({
    where: { email: 'juan@teste.com' },
    update: {},
    create: {
      email: 'juan@teste.com',
      name: 'Juan Silva',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Criar Empresa
  const company = await prisma.company.upsert({
    where: { cnpj: '12345678000199' },
    update: { userId: user.id },
    create: {
      razaoSocial: 'Tech Solutions MVP',
      cnpj: '12345678000199',
      websiteUrl: 'https://techsolutions.com',
      onboardingStatus: 'COMPLETED',
      userId: user.id,
    },
  });

  // Atualizar usuário com a empresa
  await prisma.user.update({
    where: { id: user.id },
    data: { companyId: company.id },
  });

  // 3. Criar Vaga Exemplo
  const job = await prisma.job.create({
    data: {
      title: 'Desenvolvedor Frontend Sênior',
      department: 'Engenharia',
      location: 'Remoto',
      status: 'ACTIVE',
      companyId: company.id,
      description: 'Buscamos alguém com experiência em React e Next.js...',
    },
  });

  // 4. Criar Candidatos com Análise de Match
  const candidate1 = await prisma.candidate.create({
    data: {
      name: 'Ana Oliveira',
      email: 'ana@dev.com',
      phone: '11999998888',
      companyId: company.id,
    },
  });

  await prisma.match.create({
    data: {
      candidateId: candidate1.id,
      jobId: job.id,
      companyId: company.id,
      overallScore: 92,
      recommendation: 'HIRE',
      summary: 'Ana possui excelente fit cultural e domínio técnico avançado em React.',
      fullAnalysis: JSON.stringify({
        cultureMatch: 95,
        technicalSkills: 90,
        leadershipPotential: 80,
        softSkills: ['Trabalho em Equipe', 'Comunicação', 'Adaptabilidade'],
        risks: []
      }),
    },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
