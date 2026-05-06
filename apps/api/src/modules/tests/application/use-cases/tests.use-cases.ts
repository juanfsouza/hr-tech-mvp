import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Either, left, right } from '@shared/domain/errors/either';
import { BusinessRuleViolationError, EntityNotFoundError } from '@shared/domain/errors/domain-errors';
import { AppConfig } from 'src/config/app.config';
import { CreateTestSessionInput } from '@/interfaces/create-test-session-input.interface';
import { CreateTestSessionOutput } from '@/interfaces/create-test-session-output.interface';
import { CompleteTestInput } from '@/interfaces/complete-test-input.interface';
import { SaveProgressInput } from '@/interfaces/save-progress-input.interface';
import { GetSessionOutput } from '@/interfaces/get-session-output.interface';
import { CompleteTestOutput } from '@/interfaces/complete-test-output.interface';
import { PdfService } from '@/services/pdf.service';
import { TestSession } from '@/entities/test-session.entity';
import { ITestRepository } from '@/interfaces/itest-repository.interface';
import { TEST_REPOSITORY } from '@/repositories/test.repository.interface';
import { EmailService } from '@/services/email.service';
import { PrismaService } from '@/services/prisma.service';
import { EnneagramEngine } from '@/services/enneagram.engine';
import { SixteenPersonalitiesEngine } from '@/services/sixteen-personalities.engine';
import { DiscEngine } from '@/services/disc.engine';

// ─── CreateTestSession ────────────────────────────────────────────────────────

@Injectable()
export class CreateTestSessionUseCase {
  constructor(
    @Inject(TEST_REPOSITORY) private readonly repo: ITestRepository,
    private readonly config: ConfigService<AppConfig>,
  ) { }

  async execute(input: CreateTestSessionInput): Promise<Either<never, CreateTestSessionOutput>> {
    const hours = input.expiryHours ?? Number(this.config.get('TEST_LINK_EXPIRY_HOURS')) ?? 72;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    const session = TestSession.create({
      companyId: input.companyId,
      candidateId: input.candidateId,
      expiresAt,
    });

    await this.repo.saveSession(session);

    const baseUrl = this.config.get('CANDIDATE_PORTAL_URL') ?? 'http://localhost:3000/teste';

    return right({
      sessionId: session.id.value,
      token: session.token,
      portalUrl: `${baseUrl}/${session.token}`,
      expiresAt,
    });
  }
}

// ─── GetTestSessionByToken ────────────────────────────────────────────────────

@Injectable()
export class GetTestSessionByTokenUseCase {
  constructor(@Inject(TEST_REPOSITORY) private readonly repo: ITestRepository) { }

  async execute(
    token: string,
  ): Promise<Either<EntityNotFoundError | BusinessRuleViolationError, GetSessionOutput>> {
    const session = await this.repo.findSessionByToken(token);
    if (!session) return left(new EntityNotFoundError('TestSession', token));

    if (session.isExpired() && session.status !== 'COMPLETED') {
      session.expire();
      await this.repo.updateSession(session);
      return left(new BusinessRuleViolationError('This test link has expired.'));
    }

    if (session.status === 'COMPLETED') {
      return left(new BusinessRuleViolationError('This test has already been completed.'));
    }

    return right({
      sessionId: session.id.value,
      companyId: session.companyId,
      status: session.status,
      currentTest: session.currentTest,
      expiresAt: session.expiresAt,
      candidateId: session.candidateId,
    });
  }
}

// ─── SaveProgress ─────────────────────────────────────────────────────────────

@Injectable()
export class SaveProgressUseCase {
  constructor(@Inject(TEST_REPOSITORY) private readonly repo: ITestRepository) { }

  async execute(
    input: SaveProgressInput,
  ): Promise<Either<EntityNotFoundError | BusinessRuleViolationError, { saved: true }>> {
    const session = await this.repo.findSessionByToken(input.token);
    if (!session) return left(new EntityNotFoundError('TestSession', input.token));
    if (!session.isAccessible()) return left(new BusinessRuleViolationError('Session is not accessible.'));

    // Inicia sessão se ainda PENDING
    if (session.status === 'PENDING') {
      session.start();
      await this.repo.updateSession(session);
    }

    await this.repo.upsertResponse({
      sessionId: session.id.value,
      testType: input.testType,
      questionId: input.questionId,
      answer: input.answer,
    });

    return right({ saved: true });
  }
}

// ─── CompleteTest ─────────────────────────────────────────────────────────────

@Injectable()
export class CompleteTestUseCase {
  private readonly logger = new Logger(CompleteTestUseCase.name);

  constructor(
    @Inject(TEST_REPOSITORY) private readonly repo: ITestRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService,
    @InjectQueue('match-analysis') private readonly matchQueue: Queue,
  ) { }

  async execute(
    input: CompleteTestInput,
  ): Promise<Either<EntityNotFoundError | BusinessRuleViolationError, CompleteTestOutput>> {
    const session = await this.repo.findSessionByToken(input.token);
    if (!session) return left(new EntityNotFoundError('TestSession', input.token));
    if (!session.isAccessible()) return left(new BusinessRuleViolationError('Session not accessible.'));

    // Avançar para próximo teste
    session.advanceToNextTest();

    const testOrder = ['DISC', 'ENNEAGRAM', 'SIXTEEN_PERSONALITIES'];
    const currentIdx = testOrder.indexOf(input.testType);
    const isLastTest = currentIdx === testOrder.length - 1;

    if (!isLastTest) {
      await this.repo.updateSession(session);
      return right({ allCompleted: false, nextTest: session.currentTest });
    }

    // Todos os testes concluídos — calcular perfil
    session.complete();
    await this.repo.updateSession(session);

    const { profileId, profileData } = await this.calculateAndSaveProfile(session.id.value, session.candidateId);

    // -- AUTOMAÇÃO 1 e 2: Disparar Match IA e Enviar Email --
    if (session.candidateId) {
      try {
        const candidate = await this.prisma.candidate.findUnique({
          where: { id: session.candidateId },
        });

        if (candidate) {
          // 1. Gerar PDF
          const pdfBuffer = await this.pdfService.generatePsychProfilePdf({
            candidateName: candidate.name,
            discDominant: profileData.discDominant || 'Não definido',
            discSecondary: profileData.discSecondary || undefined,
            discD: profileData.discD || 0,
            discI: profileData.discI || 0,
            discS: profileData.discS || 0,
            discC: profileData.discC || 0,
            enneagramType: profileData.enneagramType || 0,
            enneagramWing: profileData.enneagramWing || undefined,
            mbtiType: profileData.mbtiType || 'Não definido',
          });

          // 2. Enviar Email de Conclusão com PDF
          await this.emailService.sendTestCompleted(
            candidate.email,
            candidate.name,
            profileData.discDominant || 'Não definido',
            String(profileData.enneagramType || 'Não definido'),
            profileData.mbtiType || 'Não definido',
            pdfBuffer
          );

          // 3. Acionar IA de Match se o candidato estiver vinculado a uma vaga
          if (candidate.jobId) {
            const jobIdStr = `match:${candidate.id}:${candidate.jobId}`;
            await this.matchQueue.add('analyze', {
              candidateId: candidate.id,
              jobId: candidate.jobId,
              companyId: session.companyId,
            }, {
              jobId: jobIdStr,
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
            });
            this.logger.log(`[Automação] Match IA enfileirado para candidato ${candidate.id}`);
          }
        }
      } catch (error) {
        this.logger.error('Falha ao acionar automações pós-teste', error);
        // Não quebra o fluxo de conclusão do teste caso o email ou a fila falhem
      }
    }

    return right({ allCompleted: true, profileId });
  }

  private async calculateAndSaveProfile(
    sessionId: string,
    candidateId?: string,
  ): Promise<{ profileId: string, profileData: Record<string, string | number | undefined> }> {
    // Buscar respostas de cada teste
    const discRaw = await this.repo.findResponses(sessionId, 'DISC');
    const ennRaw = await this.repo.findResponses(sessionId, 'ENNEAGRAM');
    const sixRaw = await this.repo.findResponses(sessionId, 'SIXTEEN_PERSONALITIES');

    // Calcular resultados
    const discChoices = DiscEngine.parseResponses(discRaw);
    const disc = DiscEngine.calculate(discChoices);

    const ennAnswers = EnneagramEngine.parseResponses(ennRaw);
    const enn = EnneagramEngine.calculate(ennAnswers);

    const sixResponses = SixteenPersonalitiesEngine.parseResponses(sixRaw);
    const sixteen = SixteenPersonalitiesEngine.calculate(sixResponses);

    const profileData = {
      discD: disc.D, discI: disc.I, discS: disc.S, discC: disc.C,
      discDominant: disc.dominantProfile, discSecondary: disc.secondaryProfile,
      enneagramType: enn.type, enneagramWing: enn.wing, enneagramLevel: enn.integrationLevel,
      mbtiType: sixteen.mbtiType,
      bigFiveO: sixteen.bigFive.openness,
      bigFiveC: sixteen.bigFive.conscientiousness,
      bigFiveE: sixteen.bigFive.extraversion,
      bigFiveA: sixteen.bigFive.agreeableness,
      bigFiveN: sixteen.bigFive.neuroticism,
    };

    // Persistir perfil calculado
    const profileId = await this.repo.savePsychProfile(candidateId, undefined, profileData);

    return { profileId, profileData };
  }
}
