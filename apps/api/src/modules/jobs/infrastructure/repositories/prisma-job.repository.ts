import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Job, JobStatus } from '@modules/jobs/domain/entities/job.entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { IJobRepository } from '@/modules/jobs/domain/repositories/ijob-repository.interface';
import { normalizePaginationParams } from '@/shared/application/pagination';
import { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';
import { PaginationParams } from '@/shared/domain/interfaces/pagination-params.interface';


@Injectable()
export class PrismaJobRepository implements IJobRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, companyId: string): Promise<Job | null> {
    const r = await this.prisma.job.findFirst({ where: { id, companyId, deletedAt: null } });
    return r ? this.toDomain(r) : null;
  }

  async findByCompany(companyId: string, params: PaginationParams): Promise<PaginatedResult<Job>> {
    const { cursor, take } = normalizePaginationParams(params);
    const records = await this.prisma.job.findMany({
      where: { companyId, deletedAt: null },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasNextPage = records.length > take;
    const items = hasNextPage ? records.slice(0, take) : records;

    return {
      items: items.map((r: PrismaJobRecord) => this.toDomain(r)),
      nextCursor: hasNextPage ? items[items.length - 1]!.id : null,
      hasNextPage,
    };
  }

  async save(job: Job): Promise<void> {
    await this.prisma.job.create({
      data: {
        id: job.id.value, companyId: job.companyId, title: job.title,
        description: job.description, requirements: job.requirements,
        salaryMin: job.salaryMin, salaryMax: job.salaryMax,
        location: job.location, isRemote: job.isRemote, status: job.status,
        responsibleId: job.responsibleId, aiGeneratedJd: job.aiGeneratedJd,
        createdAt: job.createdAt, updatedAt: job.updatedAt,
      },
    });
  }

  async update(job: Job): Promise<void> {
    await this.prisma.job.update({
      where: { id: job.id.value },
      data: {
        title: job.title, description: job.description, requirements: job.requirements,
        salaryMin: job.salaryMin, salaryMax: job.salaryMax,
        location: job.location, isRemote: job.isRemote, status: job.status,
        responsibleId: job.responsibleId, aiGeneratedJd: job.aiGeneratedJd,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.job.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private toDomain(r: PrismaJobRecord): Job {
    return Job.reconstitute({
      companyId: r.companyId, title: r.title,
      description: r.description ?? undefined, requirements: r.requirements,
      salaryMin: r.salaryMin ? Number(r.salaryMin) : undefined,
      salaryMax: r.salaryMax ? Number(r.salaryMax) : undefined,
      location: r.location ?? undefined, isRemote: r.isRemote,
      status: r.status as JobStatus, responsibleId: r.responsibleId ?? undefined,
      aiGeneratedJd: r.aiGeneratedJd ?? undefined,
      createdAt: r.createdAt, updatedAt: r.updatedAt,
      deletedAt: r.deletedAt ?? undefined,
    }, new UniqueEntityID(r.id));
  }
}
