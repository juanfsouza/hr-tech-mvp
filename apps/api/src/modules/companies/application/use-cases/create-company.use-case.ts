import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import {
  ResourceAlreadyExistsError,
  InvalidValueObjectError,
} from '@shared/domain/errors/domain-errors';
import { Cnpj } from '@shared/domain/value-objects/cnpj.vo';
import { Company } from '@modules/companies/domain/entities/company.entity';
import { CreateCompanyInput } from '@/modules/companies/application/interfaces/create-company-input.interface';
import { ICompanyRepository } from '@/modules/companies/domain/repositories/icompany-repository.interface';
import { CreateCompanyOutput } from '@/modules/companies/application/interfaces/create-company-output.interface';
import { UseCase } from '@/modules/users/domain/interfaces/use-case.interface';
import { COMPANY_REPOSITORY } from '../../domain/repositories/company.repository.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { BusinessRuleViolationError } from '@/shared/domain/errors/domain-errors';

type CreateCompanyError = ResourceAlreadyExistsError | InvalidValueObjectError | BusinessRuleViolationError;


@Injectable()
export class CreateCompanyUseCase
  implements UseCase<CreateCompanyInput, CreateCompanyOutput, CreateCompanyError> {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: ICompanyRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) { }

  async execute(input: CreateCompanyInput): Promise<Either<CreateCompanyError, CreateCompanyOutput>> {

    const cnpjOrError = Cnpj.create(input.cnpj);
    if (cnpjOrError.isLeft()) {
      return left(cnpjOrError.value);
    }

    const exists = await this.companyRepository.existsByCnpj(cnpjOrError.value);
    if (exists) {
      return left(new ResourceAlreadyExistsError('Company with this CNPJ'));
    }

    const company = Company.create({
      razaoSocial: input.razaoSocial.trim(),
      cnpj: cnpjOrError.value,
      websiteUrl: input.websiteUrl,
    });

    await this.companyRepository.save(company);

    // ─── Associar empresa ao usuário que a criou ───────────────────────────────
    const user = await this.userRepository.findById(input.userId);
    if (user) {
      user.assignToCompany(company.id.value);
      await this.userRepository.update(user);
    }

    return right({
      companyId: company.id.value,
      razaoSocial: company.razaoSocial,
      cnpj: company.cnpj.formatted,
    });
  }
}
