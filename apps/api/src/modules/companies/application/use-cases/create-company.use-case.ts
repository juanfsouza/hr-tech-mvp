import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import {
  ResourceAlreadyExistsError,
  InvalidValueObjectError,
} from '@shared/domain/errors/domain-errors';
import { Cnpj } from '@shared/domain/value-objects/cnpj.vo';
import { Company } from '@modules/companies/domain/entities/company.entity';
import { CreateCompanyInput } from '@/interfaces/create-company-input.interface';
import { ICompanyRepository } from '@/interfaces/icompany-repository.interface';
import { CreateCompanyOutput } from '@/interfaces/create-company-output.interface';
import { UseCase } from '@/interfaces/use-case.interface';
import { COMPANY_REPOSITORY } from '@/repositories/company.repository.interface';

type CreateCompanyError = ResourceAlreadyExistsError | InvalidValueObjectError;


@Injectable()
export class CreateCompanyUseCase
  implements UseCase<CreateCompanyInput, CreateCompanyOutput, CreateCompanyError> {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: ICompanyRepository,
  ) { }

  async execute(input: CreateCompanyInput): Promise<Either<CreateCompanyError, CreateCompanyOutput>> {
    // 1. Validar CNPJ
    const cnpjOrError = Cnpj.create(input.cnpj);
    if (cnpjOrError.isLeft()) {
      return left(cnpjOrError.value);
    }

    // 2. Verificar duplicidade
    const exists = await this.companyRepository.existsByCnpj(cnpjOrError.value);
    if (exists) {
      return left(new ResourceAlreadyExistsError('Company with this CNPJ'));
    }

    // 3. Criar entidade
    const company = Company.create({
      razaoSocial: input.razaoSocial.trim(),
      cnpj: cnpjOrError.value,
      websiteUrl: input.websiteUrl,
    });

    // 4. Persistir
    await this.companyRepository.save(company);

    return right({
      companyId: company.id.value,
      razaoSocial: company.razaoSocial,
      cnpj: company.cnpj.formatted,
    });
  }
}
