import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import { EntityNotFoundError, BusinessRuleViolationError } from '@shared/domain/errors/domain-errors';
import { ICompanyRepository } from '@/modules/companies/domain/repositories/icompany-repository.interface';
import { UpdateOnboardingInput } from '@/modules/companies/application/interfaces/update-onboarding-input.interface';
import { UpdateOnboardingOutput } from '@/modules/companies/application/interfaces/update-onboarding-output.interface';
import { UseCase } from '@/modules/users/domain/interfaces/use-case.interface';
import { COMPANY_REPOSITORY } from '../../domain/repositories/company.repository.interface';

type UpdateOnboardingError = EntityNotFoundError | BusinessRuleViolationError;


@Injectable()
export class UpdateOnboardingUseCase
  implements UseCase<UpdateOnboardingInput, UpdateOnboardingOutput, UpdateOnboardingError> {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: ICompanyRepository,
  ) { }

  async execute(input: UpdateOnboardingInput): Promise<Either<UpdateOnboardingError, UpdateOnboardingOutput>> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      return left(new EntityNotFoundError('Company', input.companyId));
    }

    if (input.step === 1) {
      if (input.address) company.updateAddress(input.address);
      if (input.logoUrl) company.updateLogo(input.logoUrl);
      company.advanceOnboarding('IN_PROGRESS');
    }

    if (input.step === 4 && input.context) {
      company.updateContext(input.context);

      if (!company.hasCompleteContext()) {
        const count = input.context.companyContext?.trim().split(/\s+/).filter(w => w.length > 0).length || 0;
        return left(
          new BusinessRuleViolationError(
            `O contexto da empresa precisa de pelo menos 100 palavras. Atual: ${count} palavras.`,
          ),
        );
      }
      company.completeOnboarding();
    }

    if (input.step !== 1 && input.step !== 4) {
      company.advanceOnboarding('IN_PROGRESS');
    }

    await this.companyRepository.update(company);

    return right({
      companyId: company.id.value,
      onboardingStatus: company.onboardingStatus,
      isComplete: company.isOnboardingComplete(),
    });
  }
}
