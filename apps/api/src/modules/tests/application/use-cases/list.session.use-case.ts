import { GetSessionOutput } from "@/modules/tests/application/interfaces/get-session-output.interface";
import { ITestRepository } from "@/modules/tests/domain/repositories/itest-repository.interface";
import { TEST_REPOSITORY } from "@/repositories/test.repository.interface";
import { EntityNotFoundError, BusinessRuleViolationError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";

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