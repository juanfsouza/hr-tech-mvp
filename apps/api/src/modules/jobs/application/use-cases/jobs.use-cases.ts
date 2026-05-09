import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import { BusinessRuleViolationError, EntityNotFoundError } from '@shared/domain/errors/domain-errors';
import { CreateJobInput } from '@/modules/jobs/application/interfaces/create-job-input.interface';
import { ListJobsInput } from '@/modules/jobs/application/interfaces/list-jobs-input.interface';
import { IJobRepository } from '@/modules/jobs/domain/repositories/ijob-repository.interface';
import { ICompanyRepository } from '@/modules/companies/domain/repositories/icompany-repository.interface';
import { AiOrchestrationService } from '@/modules/ai/services/ai-orchestration.service';
import { COMPANY_REPOSITORY } from '@/modules/companies/domain/repositories/company.repository.interface';
import { JOB_REPOSITORY } from '../../domain/repositories/job.repository.interface';
import { Job } from '../../domain/entities/job.entity';

@Injectable()
export class CreateJobUseCase {
  constructor(@Inject(JOB_REPOSITORY) private readonly repo: IJobRepository) { }

  async execute(input: CreateJobInput): Promise<Either<never, { id: string; title: string; status: string }>> {
    const job = Job.create({
      companyId: input.companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements ?? [],
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      location: input.location,
      isRemote: input.isRemote ?? false,
      responsibleId: input.responsibleId,
    });

    await this.repo.save(job);
    return right({ id: job.id.value, title: job.title, status: job.status });
  }
}

@Injectable()
export class ListJobsUseCase {
  constructor(@Inject(JOB_REPOSITORY) private readonly repo: IJobRepository) { }

  async execute(input: ListJobsInput): Promise<Either<never, object>> {
    const result = await this.repo.findByCompany(input.companyId, {
      cursor: input.cursor,
      take: input.take,
    });

    return right({
      items: result.items.map(job => ({
        id: job.id.value,
        title: job.title,
        description: job.description,
        status: job.status,
        createdAt: job.createdAt,
      })),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    });
  }
}

@Injectable()
export class GetJobByIdUseCase {
  constructor(@Inject(JOB_REPOSITORY) private readonly repo: IJobRepository) { }

  async execute(id: string, companyId: string): Promise<Either<EntityNotFoundError, object>> {
    const job = await this.repo.findById(id, companyId);
    if (!job) return left(new EntityNotFoundError('Job', id));

    return right({
      id: job.id.value, title: job.title, description: job.description,
      requirements: job.requirements, salaryMin: job.salaryMin, salaryMax: job.salaryMax,
      location: job.location, isRemote: job.isRemote, status: job.status,
      aiGeneratedJd: job.aiGeneratedJd, createdAt: job.createdAt,
    });
  }
}

@Injectable()
export class GenerateJobDescriptionUseCase {
  constructor(
    @Inject(JOB_REPOSITORY) private readonly jobRepo: IJobRepository,
    @Inject(COMPANY_REPOSITORY) private readonly companyRepo: ICompanyRepository,
    private readonly ai: AiOrchestrationService,
  ) { }

  async execute(id: string, companyId: string): Promise<Either<EntityNotFoundError | BusinessRuleViolationError, { jd: string }>> {
    const job = await this.jobRepo.findById(id, companyId);
    if (!job) return left(new EntityNotFoundError('Job', id));

    const company = await this.companyRepo.findById(companyId);
    if (!company) return left(new BusinessRuleViolationError('Company not found.'));

    const jd = await this.ai.generateJobDescription({
      jobTitle: job.title,
      companyContext: company.context?.companyContext ?? company.razaoSocial,
      requirements: job.requirements,
      isRemote: job.isRemote,
      salaryRange: job.salaryMin && job.salaryMax
        ? { min: job.salaryMin, max: job.salaryMax }
        : undefined,
    });

    job.setAiJd(jd);
    await this.jobRepo.update(job);

    return right({ jd });
  }
}

@Injectable()
export class PublishJobUseCase {
  constructor(@Inject(JOB_REPOSITORY) private readonly repo: IJobRepository) { }

  async execute(id: string, companyId: string): Promise<Either<EntityNotFoundError, { status: string }>> {
    const job = await this.repo.findById(id, companyId);
    if (!job) return left(new EntityNotFoundError('Job', id));

    job.publish();
    await this.repo.update(job);
    return right({ status: job.status });
  }
}

@Injectable()
export class CloseJobUseCase {
  constructor(@Inject(JOB_REPOSITORY) private readonly repo: IJobRepository) { }

  async execute(id: string, companyId: string): Promise<Either<EntityNotFoundError, { status: string }>> {
    const job = await this.repo.findById(id, companyId);
    if (!job) return left(new EntityNotFoundError('Job', id));

    job.close();
    await this.repo.update(job);
    return right({ status: job.status });
  }
}
@Injectable()
export class UpdateJobUseCase {
  constructor(@Inject(JOB_REPOSITORY) private readonly repo: IJobRepository) { }

  async execute(id: string, companyId: string, data: Partial<CreateJobInput>): Promise<Either<EntityNotFoundError, { id: string }>> {
    const job = await this.repo.findById(id, companyId);
    if (!job) return left(new EntityNotFoundError('Job', id));

    job.update(data);

    await this.repo.update(job);
    return right({ id: job.id.value });
  }
}
