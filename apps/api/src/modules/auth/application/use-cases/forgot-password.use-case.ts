import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { EmailService } from '@/shared/infrastructure/email/email.service';
import { Email } from '@/shared/domain/value-objects/email.vo';
import { v4 as uuidv4 } from 'uuid';
import { Either, left, right } from '@/shared/domain/errors/either';
import { DomainError } from '@/shared/domain/errors/domain-errors';

export interface ForgotPasswordInput {
  email: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<Either<DomainError, { message: string }>> {
    const emailOrError = Email.create(input.email);
    if (emailOrError.isLeft()) {
        // Por segurança, não confirmamos se o email existe ou não, mas aqui retornamos erro de VO
        return left(emailOrError.value);
    }

    const user = await this.userRepository.findByEmail(emailOrError.value);
    
    if (!user) {
      // Retornamos sucesso mesmo se não existir para evitar enumeração de usuários
      return right({ message: 'Se este e-mail estiver cadastrado, um link de recuperação será enviado.' });
    }

    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hora de validade

    user.setPasswordResetToken(token, expires);
    await this.userRepository.update(user);

    await this.emailService.sendPasswordResetEmail(user.email.value, user.name, token);

    return right({ message: 'Se este e-mail estiver cadastrado, um link de recuperação será enviado.' });
  }
}
