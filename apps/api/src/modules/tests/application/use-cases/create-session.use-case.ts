import { AppConfig } from "@/config/app.config";
import { CreateTestSessionInput } from "@/modules/tests/application/interfaces/create-test-session-input.interface";
import { CreateTestSessionOutput } from "@/modules/tests/application/interfaces/create-test-session-output.interface";
import { ITestRepository } from "@/modules/tests/domain/repositories/itest-repository.interface";
import { Either, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TestSession } from "../../domain/entities/test-session.entity";
import { TEST_REPOSITORY } from "../../domain/repositories/test.repository.interface";

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
            collaboratorId: input.collaboratorId,
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