import { Module } from '@nestjs/common';
import { PrismaCompanyRepository } from './companies/infrastructure/repositories/prisma-company.repository';
import { COMPANY_REPOSITORY } from './companies/domain/repositories/company.repository.interface';
import { CreateCompanyUseCase } from './companies/application/use-cases/create-company.use-case';
import { UpdateOnboardingUseCase } from './companies/application/use-cases/update-onboarding.use-case';
import { GetCompanyUseCase } from './companies/application/use-cases/get-company.use-case';
import { UpdateCompanyUseCase } from './companies/application/use-cases/update-company.use-case';
import { CompaniesController } from './companies/controllers/companies.controller';
import { UsersModule } from './users.module';

@Module({
  imports: [UsersModule],
  controllers: [CompaniesController],
  providers: [
    { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
    CreateCompanyUseCase,
    UpdateOnboardingUseCase,
    GetCompanyUseCase,
    UpdateCompanyUseCase,
  ],
  exports: [COMPANY_REPOSITORY],
})
export class CompaniesModule { }
