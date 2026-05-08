import { ICandidateRepository } from "@/modules/candidates/domain/repositories/icandidate-repository.interface";
import { EntityNotFoundError } from "@shared/domain/errors/domain-errors";
import { Either, left, right } from "@shared/domain/errors/either";
import { Inject, Injectable } from "@nestjs/common";
import { CandidateStatus } from "../../domain/entities/candidate.entity";
import { CANDIDATE_REPOSITORY } from "../../domain/repositories/candidate.repository.interface";


@Injectable()
export class UpdateCandidateStatusUseCase {
    constructor(@Inject(CANDIDATE_REPOSITORY) private readonly repo: ICandidateRepository) { }

    async execute(id: string, companyId: string, status: CandidateStatus): Promise<Either<EntityNotFoundError, { status: string }>> {
        const c = await this.repo.findById(id, companyId);
        if (!c) return left(new EntityNotFoundError('Candidate', id));

        c.updateStatus(status);
        await this.repo.update(c);

        return right({ status: c.status });
    }
}