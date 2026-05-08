import { ICandidateRepository } from "@/modules/candidates/domain/repositories/icandidate-repository.interface";
import { ListCandidatesByJobInput } from "@/modules/candidates/application/interfaces/list-candidates-by-job-input.interface";
import { EntityNotFoundError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Inject, Injectable } from "@nestjs/common";
import { CANDIDATE_REPOSITORY } from "../../domain/repositories/candidate.repository.interface";

@Injectable()
export class ListCandidatesByJobUseCase {
    constructor(@Inject(CANDIDATE_REPOSITORY) private readonly repo: ICandidateRepository) { }

    async execute(input: ListCandidatesByJobInput): Promise<Either<never, object>> {
        const result = await this.repo.findByJob(input.jobId, input.companyId, {
            cursor: input.cursor,
            take: input.take,
        });
        return right(result);
    }
}

@Injectable()
export class GetCandidateByIdUseCase {
    constructor(@Inject(CANDIDATE_REPOSITORY) private readonly repo: ICandidateRepository) { }

    async execute(id: string, companyId: string): Promise<Either<EntityNotFoundError, object>> {
        const c = await this.repo.findById(id, companyId);
        if (!c) return left(new EntityNotFoundError('Candidate', id));

        return right({
            id: c.id.value, name: c.name, email: c.email, phone: c.phone,
            jobId: c.jobId, status: c.status, lgpdConsent: c.lgpdConsent,
            resumeUrl: c.resumeUrl, createdAt: c.createdAt,
        });
    }
}
