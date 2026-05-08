import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import { EntityNotFoundError, BusinessRuleViolationError } from '@shared/domain/errors/domain-errors';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { UseCase } from '../../../users/domain/interfaces/use-case.interface';

interface VerifyEmailInput {
  token: string;
}

interface VerifyEmailOutput {
  success: boolean;
  message: string;
}

type VerifyEmailError = EntityNotFoundError | BusinessRuleViolationError;

@Injectable()
export class VerifyEmailUseCase implements UseCase<VerifyEmailInput, VerifyEmailOutput, VerifyEmailError> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) { }

  async execute(input: VerifyEmailInput): Promise<Either<VerifyEmailError, VerifyEmailOutput>> {
    console.log(`[VerifyEmail] Tentando verificar token: ${input.token}`);
    const user = await this.userRepository.findByVerificationToken(input.token);

    if (!user) {
      return left(new EntityNotFoundError('VerificationToken', input.token));
    }

    if (user.isVerified) {
      return right({ success: true, message: 'Email already verified.' });
    }

    user.verifyEmail();
    await this.userRepository.update(user);

    return right({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  }
}
