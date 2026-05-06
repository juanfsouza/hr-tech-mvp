import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import { EntityNotFoundError, BusinessRuleViolationError } from '@shared/domain/errors/domain-errors';
import { CreateCandidateInput } from '@/interfaces/create-candidate-input.interface';
import { ListCandidatesByJobInput } from '@/interfaces/list-candidates-by-job-input.interface';
import { CANDIDATE_REPOSITORY } from '@/repositories/candidate.repository.interface';
import { ICandidateRepository } from '@/interfaces/icandidate-repository.interface';
import { Candidate, CandidateStatus } from '@/entities/candidate.entity';

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
