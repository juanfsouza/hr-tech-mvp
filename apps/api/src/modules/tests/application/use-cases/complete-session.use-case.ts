import { CompleteTestInput } from "@/modules/tests/application/interfaces/complete-test-input.interface";
import { CompleteTestOutput } from "@/modules/tests/application/interfaces/complete-test-output.interface";
import { ITestRepository } from "@/modules/tests/domain/repositories/itest-repository.interface";
import { EntityNotFoundError, BusinessRuleViolationError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { PrismaService } from "@/shared/infrastructure/database/prisma.service";
import { EmailService } from "@/shared/infrastructure/email/email.service";
import { PdfService } from "@/shared/infrastructure/pdf/pdf.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, Inject } from "@nestjs/common";
import { Queue } from "bullmq";
import { PsychProfileData } from "../../domain/interfaces/psych-profile-data.interface";
import { TEST_REPOSITORY } from "../../domain/repositories/test.repository.interface";
import { DiscEngine } from "../../engine/disc/disc.engine";
import { EnneagramEngine } from "../../engine/enneagram/enneagram.engine";
import { SixteenPersonalitiesEngine } from "../../engine/sixteen-personalities/sixteen-personalities.engine";

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

        let candidateName = 'Indefinido';
        let candidate = null;

        if (session.candidateId) {
            candidate = await this.prisma.candidate.findUnique({
                where: { id: session.candidateId },
            });
            if (candidate) {
                candidateName = candidate.name;
            }
        }
        const { profileId, profileData } = await this.calculateAndSaveProfile(session.id.value, session.candidateId, candidateName);

        // -- AUTOMAÇÃO 1 e 2: Disparar Match IA e Enviar Email --
        if (candidate) {
            try {
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
            } catch (error) {
                this.logger.error('Falha ao acionar automações pós-teste', error);
            }
        }

        return right({ allCompleted: true, profileId });
    }

    private async calculateAndSaveProfile(
        sessionId: string,
        candidateId?: string,
        candidateName: string = 'Indefinido',
    ): Promise<{ profileId: string, profileData: PsychProfileData }> {
        const discRaw = await this.repo.findResponses(sessionId, 'DISC');
        const ennRaw = await this.repo.findResponses(sessionId, 'ENNEAGRAM');
        const sixRaw = await this.repo.findResponses(sessionId, 'SIXTEEN_PERSONALITIES');
        const discChoices = DiscEngine.parseResponses(discRaw);
        const disc = DiscEngine.calculate(discChoices);
        const ennAnswers = EnneagramEngine.parseResponses(ennRaw);
        const enn = EnneagramEngine.calculate(ennAnswers);

        const sixResponses = SixteenPersonalitiesEngine.parseResponses(sixRaw);
        const sixteen = SixteenPersonalitiesEngine.calculate(sixResponses);

        const profileData = {
            candidateName,
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

        const profileId = await this.repo.savePsychProfile(candidateId, undefined, profileData);

        return { profileId, profileData };
    }
}
