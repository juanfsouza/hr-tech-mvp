import { PrismaService } from "@/shared/infrastructure/database/prisma.service";
import { CreateCandidateInput } from "@/modules/candidates/application/interfaces/create-candidate-input.interface";
import { ICandidateRepository } from "@/modules/candidates/domain/repositories/icandidate-repository.interface";
import { BusinessRuleViolationError } from "@/shared/domain/errors/domain-errors";
import { Either, left, right } from "@/shared/domain/errors/either";
import { Injectable, Inject } from "@nestjs/common";
import { CANDIDATE_REPOSITORY } from "../../domain/repositories/candidate.repository.interface";
import { Candidate } from "../../domain/entities/candidate.entity";

@Injectable()
export class CreateCandidateUseCase {
    constructor(
        @Inject(CANDIDATE_REPOSITORY) private readonly repo: ICandidateRepository,
        private readonly prisma: PrismaService
    ) { }

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

        // Log de auditoria para o dashboard
        await this.prisma.auditLog.create({
            data: {
                companyId: input.companyId,
                userId: null,
                action: 'CANDIDATE_REGISTERED',
                entityType: 'Candidate',
                entityId: candidate.id.value,
                metadata: {
                    details: `Novo candidato cadastrado: ${candidate.name}`
                }
            }
        });

        return right({ id: candidate.id.value, name: candidate.name, email: candidate.email });
    }
}