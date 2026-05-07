import { Candidate, CandidateStatus } from '@/entities/candidate.entity';
import { ICandidateRepository } from '@/modules/candidates/domain/repositories/icandidate-repository.interface';
import { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';
import { PaginationParams } from '@/shared/domain/interfaces/pagination-params.interface';
import { normalizePaginationParams } from '@/shared/application/pagination';
import { UniqueEntityID } from '@/shared/domain/value-objects';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { PrismaCandidateRecord } from '../interfaces/candidate.interface';


@Injectable()
export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, companyId: string): Promise<Candidate | null> {
    const r = await this.prisma.candidate.findFirst({ where: { id, companyId, deletedAt: null } });
    return r ? this.toDomain(r) : null;
  }

  async findByJob(jobId: string, companyId: string, params: PaginationParams): Promise<PaginatedResult<Candidate>> {
    const { cursor, take } = normalizePaginationParams(params);
    const records = await this.prisma.candidate.findMany({
      where: { jobId, companyId, deletedAt: null },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasNextPage = records.length > take;
    const items = hasNextPage ? records.slice(0, take) : records;
    return {
      items: items.map((r: PrismaCandidateRecord) => this.toDomain(r)),
      nextCursor: hasNextPage ? items[items.length - 1]!.id : null,
      hasNextPage,
    };
  }

  async findByEmail(email: string, companyId: string): Promise<Candidate | null> {
    const r = await this.prisma.candidate.findFirst({ where: { email, companyId, deletedAt: null } });
    return r ? this.toDomain(r) : null;
  }

  async save(candidate: Candidate): Promise<void> {
    await this.prisma.candidate.create({
      data: {
        id: candidate.id.value, companyId: candidate.companyId,
        jobId: candidate.jobId, name: candidate.name, email: candidate.email,
        phone: candidate.phone, resumeUrl: candidate.resumeUrl,
        status: candidate.status, lgpdConsent: candidate.lgpdConsent,
        consentAt: candidate.consentAt, createdAt: candidate.createdAt, updatedAt: candidate.updatedAt,
      },
    });
  }

  async update(candidate: Candidate): Promise<void> {
    await this.prisma.candidate.update({
      where: { id: candidate.id.value },
      data: {
        name: candidate.name, email: candidate.email, phone: candidate.phone,
        resumeUrl: candidate.resumeUrl, status: candidate.status,
        lgpdConsent: candidate.lgpdConsent, consentAt: candidate.consentAt,
        deletedAt: candidate.deletedAt, updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.candidate.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private toDomain(r: PrismaCandidateRecord): Candidate {
    return Candidate.reconstitute({
      companyId: r.companyId, jobId: r.jobId ?? undefined,
      name: r.name, email: r.email, phone: r.phone ?? undefined,
      resumeUrl: r.resumeUrl ?? undefined, status: r.status as CandidateStatus,
      lgpdConsent: r.lgpdConsent, consentAt: r.consentAt ?? undefined,
      createdAt: r.createdAt, updatedAt: r.updatedAt, deletedAt: r.deletedAt ?? undefined,
    }, new UniqueEntityID(r.id));
  }
}
