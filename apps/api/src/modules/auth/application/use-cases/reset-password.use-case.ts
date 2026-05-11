import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { IHashService } from '@/modules/auth/application/interfaces/ihash-service.interface';
import { HASH_SERVICE } from '@/shared/domain/services/hash.service.interface';
import { Password } from '@/shared/domain/value-objects/password.vo';
import { Either, left, right } from '@/shared/domain/errors/either';
import { DomainError, BusinessRuleViolationError } from '@/shared/domain/errors/domain-errors';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: IHashService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<Either<DomainError, { message: string }>> {
    const user = await this.userRepository.findByResetToken(input.token);

    if (!user) {
      return left(new BusinessRuleViolationError('Token de recuperação inválido ou expirado.'));
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return left(new BusinessRuleViolationError('Token de recuperação expirado.'));
    }

    // Validar nova senha
    const passwordOrError = Password.createRaw(input.newPassword);
    if (passwordOrError.isLeft()) {
      return left(passwordOrError.value);
    }

    // Hash da nova senha
    const hash = await this.hashService.hash(passwordOrError.value.getRawValue());
    const hashedPassword = Password.createHashed(hash);

    // Atualizar senha e limpar token
    user.updatePassword(hashedPassword);
    user.clearPasswordReset();

    await this.userRepository.update(user);

    return right({ message: 'Senha redefinida com sucesso!' });
  }
}
