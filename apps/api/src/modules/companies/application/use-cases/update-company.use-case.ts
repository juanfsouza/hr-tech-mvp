import { Injectable, Inject } from '@nestjs/common';
import { COMPANY_REPOSITORY } from '@/modules/companies/domain/repositories/company.repository.interface';
import { EntityNotFoundError, BusinessRuleViolationError } from '@/shared/domain/errors/domain-errors';
import { Either, left, right } from '@/shared/domain/errors/either';
import { ICompanyRepository } from '@/modules/companies/domain/repositories/icompany-repository.interface';
import { Cnpj } from '@/shared/domain/value-objects/cnpj.vo';
import { UseCase } from '@/modules/users/domain/interfaces/use-case.interface';
import { UpdateCompanyInput } from '../interfaces/update-company-input.interface';
import { UpdateCompanyOutput } from '../interfaces/update-company-output.interface';

type UpdateCompanyError = EntityNotFoundError | BusinessRuleViolationError;

@Injectable()
export class UpdateCompanyUseCase implements UseCase<UpdateCompanyInput, UpdateCompanyOutput, UpdateCompanyError> {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) { }

  async execute(input: UpdateCompanyInput): Promise<Either<UpdateCompanyError, UpdateCompanyOutput>> {
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

      // Validação de unicidade caso o CNPJ tenha mudado
      if (!cnpjVO.equals(company.cnpj)) {
        const exists = await this.companyRepository.existsByCnpj(cnpjVO);
        if (exists) {
          return left(new BusinessRuleViolationError('Este CNPJ já está cadastrado para outra empresa.'));
        }
      }
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
