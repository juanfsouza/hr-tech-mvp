import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@shared/domain/errors/either';
import {
  ResourceAlreadyExistsError,
  InvalidValueObjectError,
  BusinessRuleViolationError,
} from '@shared/domain/errors/domain-errors';
import { Email } from '@shared/domain/value-objects/email.vo';
import { Password } from '@shared/domain/value-objects/password.vo';
import { User } from '@modules/users/domain/entities/user.entity';
import { ICompanyRepository } from '@/modules/companies/domain/repositories/icompany-repository.interface';
import { IHashService } from '@/modules/auth/application/interfaces/ihash-service.interface';
import { RegisterInput } from '@/modules/auth/domain/interfaces/register-input.interface';
import { RegisterOutput } from '@/modules/auth/domain/interfaces/register-output.interface';
import { UseCase } from '../../../users/domain/interfaces/use-case.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { COMPANY_REPOSITORY } from '@/modules/companies/domain/repositories/company.repository.interface';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { HASH_SERVICE } from '@/shared/domain/services/hash.service.interface';
import { EmailService } from '@/shared/infrastructure/email/email.service';
import { v4 as uuidv4 } from 'uuid';

type RegisterError =
  | ResourceAlreadyExistsError
  | InvalidValueObjectError
  | BusinessRuleViolationError;

@Injectable()
export class RegisterUseCase implements UseCase<RegisterInput, RegisterOutput, RegisterError> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: ICompanyRepository,
    @Inject(HASH_SERVICE) private readonly hashService: IHashService,
    private readonly emailService: EmailService,
  ) { }

  async execute(input: RegisterInput): Promise<Either<RegisterError, RegisterOutput>> {
    // 1. Verificar que a empresa existe (opcional no cadastro inicial)
    if (input.companyId) {
      const company = await this.companyRepository.findById(input.companyId);
      if (!company) {
        return left(new BusinessRuleViolationError('Company not found or inactive.'));
      }
    }

    // 2. Validar Email VO
    const emailOrError = Email.create(input.email);
    if (emailOrError.isLeft()) {
      return left(emailOrError.value);
    }

    // 3. Verificar duplicidade de e-mail
    const exists = await this.userRepository.existsByEmail(emailOrError.value);
    if (exists) {
      return left(new ResourceAlreadyExistsError('User with this e-mail'));
    }

    // 4. Validar senha
    const passwordOrError = Password.createRaw(input.password);
    if (passwordOrError.isLeft()) {
      return left(passwordOrError.value);
    }

    // 5. Hash da senha
    const hash = await this.hashService.hash(passwordOrError.value.getRawValue());
    const hashedPassword = Password.createHashed(hash);

    // 6. Criar entidade User com token de verificação
    const verificationToken = uuidv4();
    const user = User.create({
      companyId: input.companyId,
      email: emailOrError.value,
      password: hashedPassword,
      name: input.name.trim(),
      role: input.role ?? 'HR',
    });
    user.setVerificationToken(verificationToken);

    // 7. Persistir
    await this.userRepository.save(user);

    // 8. Enviar e-mail de verificação (Síncrono para debug)
    await this.emailService.sendVerificationEmail(user.email.value, user.name, verificationToken);

    return right({
      userId: user.id.value,
      name: user.name,
      email: user.email.value,
      role: user.role,
    });
  }
}
