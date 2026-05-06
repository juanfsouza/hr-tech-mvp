import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import { EntityNotFoundError, BusinessRuleViolationError } from '@shared/domain/errors/domain-errors';
import { ICompanyRepository } from '@/interfaces/icompany-repository.interface';
import { UpdateOnboardingInput } from '@/interfaces/update-onboarding-input.interface';
import { UpdateOnboardingOutput } from '@/interfaces/update-onboarding-output.interface';
import { UseCase } from '@/interfaces/use-case.interface';
import { COMPANY_REPOSITORY } from '@/repositories/company.repository.interface';

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

    // Aplicar dados de acordo com o step
    if (input.step === 1) {
      if (input.address) company.updateAddress(input.address);
      if (input.logoUrl) company.updateLogo(input.logoUrl);
      company.advanceOnboarding('IN_PROGRESS');
    }

    if (input.step === 4 && input.context) {
      company.updateContext(input.context);

      // Validar contexto mínimo antes de marcar como completo
      if (!company.hasCompleteContext()) {
        return left(
          new BusinessRuleViolationError(
            'Company context requires at least 100 words in the description and one culture value.',
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
