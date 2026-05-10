import { Injectable, Inject } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/modules/companies/domain/repositories/company.repository.interface';
import { EntityNotFoundError, BusinessRuleViolationError } from '@/shared/domain/errors/domain-errors';
import { Either, left, right } from '@/shared/domain/errors/either';
import { ICompanyRepository } from '../../domain/repositories/icompany-repository.interface';
import { Cnpj } from '@/shared/domain/value-objects/cnpj.vo';

export interface UpdateCompanyInput {
  companyId: string;
  razaoSocial?: string;
  cnpj?: string;
  websiteUrl?: string;
}

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) { }

  async execute(input: UpdateCompanyInput): Promise<Either<EntityNotFoundError | BusinessRuleViolationError, { success: boolean }>> {
    const company = await this.companyRepository.findById(input.companyId);

    if (!company) {
      return left(new EntityNotFoundError('Company', input.companyId));
    }

    let cnpjVO: Cnpj | undefined;
    if (input.cnpj) {
      const cnpjOrError = Cnpj.create(input.cnpj);
      if (cnpjOrError.isLeft()) {
        return left(new BusinessRuleViolationError('CNPJ inválido.'));
      }
      cnpjVO = cnpjOrError.value;
    }

    company.updateBasicInfo({
      razaoSocial: input.razaoSocial,
      cnpj: cnpjVO,
      websiteUrl: input.websiteUrl,
    });

    await this.companyRepository.update(company);

    return right({ success: true });
  }
}
