import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { Cnpj } from '@shared/domain/value-objects/cnpj.vo';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { ICompanyRepository } from '@/interfaces/icompany-repository.interface';
import { CompanyContext } from '@/interfaces/company-context.interface';
import { CompanyAddress } from '@/interfaces/company-address.interface';
import { PrismaCompanyRecord } from '../interface/prisma.interface';
import { Company, CompanyProfile, OnboardingStatus } from '../../domain/entities/company.entity';

@Injectable()
export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<Company | null> {
    const record = await this.prisma.company.findFirst({
      where: { id, deletedAt: null, isActive: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByCnpj(cnpj: Cnpj): Promise<Company | null> {
    const record = await this.prisma.company.findFirst({
      where: { cnpj: cnpj.value, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(company: Company): Promise<void> {
    await this.prisma.company.create({
      data: {
        id: company.id.value,
        razaoSocial: company.razaoSocial,
        cnpj: company.cnpj.value,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl,
        cep: company.address?.cep,
        logradouro: company.address?.logradouro,
        numero: company.address?.numero,
        complemento: company.address?.complemento,
        bairro: company.address?.bairro,
        cidade: company.address?.cidade,
        estado: company.address?.estado,
        companyProfile: company.context.companyProfile,
        companyContext: company.context.companyContext,
        cultureValues: company.context.cultureValues,
        mainChallenges: company.context.mainChallenges,
        leadershipStyle: company.context.leadershipStyle,
        onboardingStatus: company.onboardingStatus,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  }

  async update(company: Company): Promise<void> {
    await this.prisma.company.update({
      where: { id: company.id.value },
      data: {
        razaoSocial: company.razaoSocial,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl,
        cep: company.address?.cep,
        logradouro: company.address?.logradouro,
        numero: company.address?.numero,
        complemento: company.address?.complemento,
        bairro: company.address?.bairro,
        cidade: company.address?.cidade,
        estado: company.address?.estado,
        companyProfile: company.context.companyProfile,
        companyContext: company.context.companyContext,
        cultureValues: company.context.cultureValues,
        mainChallenges: company.context.mainChallenges,
        leadershipStyle: company.context.leadershipStyle,
        onboardingStatus: company.onboardingStatus,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async existsByCnpj(cnpj: Cnpj): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { cnpj: cnpj.value, deletedAt: null },
    });
    return count > 0;
  }

  // ─── Mapper: Prisma → Domain ───────────────────────────────────────────────
  private toDomain(record: PrismaCompanyRecord): Company {
    const cnpjOrError = Cnpj.create(record.cnpj);
    if (cnpjOrError.isLeft()) {
      throw new Error(`Invalid CNPJ in database: ${record.cnpj}`);
    }

    const address: CompanyAddress | undefined =
      record.cep && record.logradouro && record.numero && record.bairro && record.cidade && record.estado
        ? {
          cep: record.cep,
          logradouro: record.logradouro,
          numero: record.numero,
          complemento: record.complemento ?? undefined,
          bairro: record.bairro,
          cidade: record.cidade,
          estado: record.estado,
        }
        : undefined;

    const context: CompanyContext = {
      companyProfile: record.companyProfile as CompanyProfile | undefined,
      companyContext: record.companyContext ?? undefined,
      cultureValues: record.cultureValues,
      mainChallenges: record.mainChallenges ?? undefined,
      leadershipStyle: record.leadershipStyle ?? undefined,
    };

    return Company.reconstitute(
      {
        razaoSocial: record.razaoSocial,
        cnpj: cnpjOrError.value,
        logoUrl: record.logoUrl ?? undefined,
        websiteUrl: record.websiteUrl ?? undefined,
        address,
        context,
        onboardingStatus: record.onboardingStatus as OnboardingStatus,
        isActive: record.isActive,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        deletedAt: record.deletedAt ?? undefined,
      },
      new UniqueEntityID(record.id),
    );
  }
}
