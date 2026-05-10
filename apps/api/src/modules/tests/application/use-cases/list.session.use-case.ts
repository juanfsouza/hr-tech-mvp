import { GetSessionOutput } from "@/modules/tests/application/interfaces/get-session-output.interface";
import { ITestRepository } from "@/modules/tests/domain/repositories/itest-repository.interface";
import { EntityNotFoundError, BusinessRuleViolationError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";
import { TEST_REPOSITORY } from "../../domain/repositories/test.repository.interface";

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

        // Se estiver concluído, retornamos os dados mas sem as questões (o frontend tratará)
        if (session.status === 'COMPLETED') {
            return right({
                sessionId: session.id.value,
                companyId: session.companyId,
                status: 'COMPLETED',
                currentTest: session.currentTest,
                expiresAt: session.expiresAt,
                candidateId: session.candidateId,
            });
        }

        // Buscar respostas já dadas para o teste atual para permitir retomar de onde parou
        let responses: Record<string, string> = {};
        if (session.currentTest) {
            const rawResponses = await this.repo.findResponses(session.id.value, session.currentTest);
            responses = rawResponses.reduce((acc, curr) => {
                acc[curr.questionId] = curr.answer;
                return acc;
            }, {} as Record<string, string>);
        }

        return right({
            sessionId: session.id.value,
            companyId: session.companyId,
            status: session.status,
            currentTest: session.currentTest,
            expiresAt: session.expiresAt,
            candidateId: session.candidateId,
            responses, // Novo campo
        });
    }
}