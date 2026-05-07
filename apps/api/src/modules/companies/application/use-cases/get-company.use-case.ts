import { Injectable, Inject } from '@nestjs/common';
import { Either, right, left } from '@shared/domain/errors/either';
import { EntityNotFoundError } from '@shared/domain/errors/domain-errors';
import { GetCompanyOutput } from '@/modules/companies/application/interfaces/get-company-output.interface';
import { COMPANY_REPOSITORY } from '@/repositories/company.repository.interface';
import { ICompanyRepository } from '@/modules/companies/domain/repositories/icompany-repository.interface';


@Injectable()
export class GetCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: ICompanyRepository,
  ) { }

  async execute(companyId: string): Promise<Either<EntityNotFoundError, GetCompanyOutput>> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      return left(new EntityNotFoundError('Company', companyId));
    }

    return right({
      id: company.id.value,
      razaoSocial: company.razaoSocial,
      cnpj: company.cnpj.formatted,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      address: company.address,
      context: {
        companyProfile: company.context.companyProfile,
        companyContext: company.context.companyContext,
        cultureValues: company.context.cultureValues,
        mainChallenges: company.context.mainChallenges,
        leadershipStyle: company.context.leadershipStyle,
      },
      onboardingStatus: company.onboardingStatus,
      createdAt: company.createdAt,
    });
  }
}
