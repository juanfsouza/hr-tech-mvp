import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, randomUUID } from 'bullmq';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { AnalyzeCandidateInput } from '@/interfaces/analyze-candidate-input.interface';
import { ICandidateRepository } from '@/interfaces/icandidate-repository.interface';
import { IJobRepository } from '@/interfaces/ijob-repository.interface';
import { MatchResult } from '@/interfaces/match-result.interface';
import { CANDIDATE_REPOSITORY } from '@/repositories/candidate.repository.interface';
import { JOB_REPOSITORY } from '@/repositories/job.repository.interface';
import { AiOrchestrationService } from '@/services/ai-orchestration.service';


/**
 * MatchService — pipeline completo de análise IA + pgvector
 *
 * Fluxo:
 * 1. Buscar perfil psicométrico do candidato
 * 2. Buscar dados da vaga e empresa
 * 3. Gerar embedding do candidato + busca semântica por vagas similares
 * 4. Invocar Claude para análise qualitativa
 * 5. Salvar resultado no banco
 */
@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiOrchestrationService,
    @Inject(CANDIDATE_REPOSITORY) private readonly candidateRepo: ICandidateRepository,
    @Inject(JOB_REPOSITORY) private readonly jobRepo: IJobRepository,
    @InjectQueue('match-analysis') private readonly matchQueue: Queue,
  ) { }


  async enqueueAnalysis(input: AnalyzeCandidateInput): Promise<string> {
    const jobId = `match:${input.candidateId}:${input.jobId}`;
    await this.matchQueue.add('analyze', input, {
      jobId,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    return jobId;
  }


  async runAnalysisPipeline(input: AnalyzeCandidateInput): Promise<MatchResult> {
    // 1. Buscar candidato
    const candidate = await this.candidateRepo.findById(input.candidateId, input.companyId);
    if (!candidate) throw new Error(`Candidate ${input.candidateId} not found`);

    // 2. Buscar vaga
    const job = await this.jobRepo.findById(input.jobId, input.companyId);
    if (!job) throw new Error(`Job ${input.jobId} not found`);

    // 3. Buscar perfil psicométrico
    const psychProfile = await this.prisma.psychProfile.findFirst({
      where: { candidateId: input.candidateId },
      orderBy: { completedAt: 'desc' },
    });

    if (!psychProfile) throw new Error(`Psych profile for candidate ${input.candidateId} not found`);

    // 4. Buscar contexto da empresa
    const company = await this.prisma.company.findUnique({ where: { id: input.companyId } });
    if (!company) throw new Error(`Company ${input.companyId} not found`);

    // 5. Invocar IA para análise qualitativa
    const analysis = await this.ai.analyzeCandidateMatch({
      candidate: {
        name: candidate.name,
        disc: {
          D: psychProfile.discD ?? 0, I: psychProfile.discI ?? 0,
          S: psychProfile.discS ?? 0, C: psychProfile.discC ?? 0,
          dominant: psychProfile.discDominant ?? 'D',
        },
        enneagram: {
          type: psychProfile.enneagramType ?? 0,
          wing: psychProfile.enneagramWing ?? '?',
          typeName: `Tipo ${psychProfile.enneagramType}`,
        },
        mbti: {
          type: psychProfile.mbtiType ?? '????',
          bigFive: {
            openness: psychProfile.bigFiveO ?? 50,
            conscientiousness: psychProfile.bigFiveC ?? 50,
            extraversion: psychProfile.bigFiveE ?? 50,
            agreeableness: psychProfile.bigFiveA ?? 50,
            neuroticism: psychProfile.bigFiveN ?? 50,
          },
        },
      },
      job: {
        title: job.title,
        description: job.description ?? job.title,
        requirements: job.requirements,
      },
      companyContext: company.companyContext ?? company.razaoSocial,
    });

    // 6. Salvar resultado no banco
    // BUG FIX: fullAnalysis é campo Json no Prisma — não usar JSON.stringify (double serialization)
    const matchId = randomUUID();
    await this.prisma.match.create({
      data: {
        id: matchId,
        candidateId: input.candidateId,
        jobId: input.jobId,
        companyId: input.companyId,
        overallScore: analysis.overallScore,
        jobMatchScore: analysis.jobMatch.score,
        leaderMatchScore: analysis.leaderMatch.score,
        cultureMatchScore: analysis.cultureMatch.score,
        recommendation: analysis.recommendation,
        summary: analysis.summary,
        fullAnalysis: analysis as unknown as Record<string, unknown>,
        createdAt: new Date(),
      },
    });

    // BUG FIX: atualiza status baseado na recomendação da IA, não fixo em ANALYZING
    const finalStatus =
      analysis.recommendation === 'STRONG_YES' || analysis.recommendation === 'YES'
        ? 'APPROVED'
        : 'REJECTED';
    candidate.updateStatus(finalStatus);
    await this.candidateRepo.update(candidate);

    this.logger.log(`Match analysis completed for candidate ${input.candidateId}: score=${analysis.overallScore}`);

    return {
      matchId,
      overallScore: analysis.overallScore,
      recommendation: analysis.recommendation,
      summary: analysis.summary,
      details: {
        jobMatch: analysis.jobMatch,
        leaderMatch: analysis.leaderMatch,
        cultureMatch: analysis.cultureMatch,
        developmentPlan: analysis.developmentPlan,
      },
    };
  }
}
