import { ITestRepository } from "@/modules/tests/domain/repositories/itest-repository.interface";
import { SaveProgressInput } from "@/modules/tests/application/interfaces/save-progress-input.interface";
import { EntityNotFoundError, BusinessRuleViolationError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";
import { TEST_REPOSITORY } from "../../domain/repositories/test.repository.interface";

@Injectable()
export class SaveProgressUseCase {
  constructor(@Inject(TEST_REPOSITORY) private readonly repo: ITestRepository) { }

  async execute(
    input: SaveProgressInput,
  ): Promise<Either<EntityNotFoundError | BusinessRuleViolationError, { saved: true }>> {
    const session = await this.repo.findSessionByToken(input.token);
    if (!session) return left(new EntityNotFoundError('TestSession', input.token));
    if (!session.isAccessible()) return left(new BusinessRuleViolationError('Session is not accessible.'));

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
