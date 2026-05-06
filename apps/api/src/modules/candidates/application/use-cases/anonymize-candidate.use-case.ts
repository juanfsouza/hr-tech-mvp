import { ICandidateRepository } from "@/interfaces/icandidate-repository.interface";
import { CANDIDATE_REPOSITORY } from "@/repositories/candidate.repository.interface";
import { EntityNotFoundError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";


@Injectable()
export class AnonymizeCandidateUseCase {
    constructor(@Inject(CANDIDATE_REPOSITORY) private readonly repo: ICandidateRepository) { }

    async execute(id: string, companyId: string): Promise<Either<EntityNotFoundError, void>> {
        const c = await this.repo.findById(id, companyId);
        if (!c) return left(new EntityNotFoundError('Candidate', id));

        c.anonymize();
        await this.repo.update(c);

        return right(undefined);
    }
}