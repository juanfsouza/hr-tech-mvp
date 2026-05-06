import { Candidate } from "@/entities/candidate.entity";
import { CreateCandidateInput } from "@/interfaces/create-candidate-input.interface";
import { ICandidateRepository } from "@/interfaces/icandidate-repository.interface";
import { CANDIDATE_REPOSITORY } from "@/repositories/candidate.repository.interface";
import { BusinessRuleViolationError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";



@Injectable()
export class CreateCandidateUseCase {
    constructor(@Inject(CANDIDATE_REPOSITORY) private readonly repo: ICandidateRepository) { }

    async execute(input: CreateCandidateInput): Promise<Either<BusinessRuleViolationError, { id: string; name: string; email: string }>> {
        const existing = await this.repo.findByEmail(input.email, input.companyId);
        if (existing) return left(new BusinessRuleViolationError('Candidate with this email already registered for this company.'));

        const candidate = Candidate.create({
            companyId: input.companyId,
            jobId: input.jobId,
            name: input.name,
            email: input.email,
            phone: input.phone,
        });

        await this.repo.save(candidate);
        return right({ id: candidate.id.value, name: candidate.name, email: candidate.email });
    }
}