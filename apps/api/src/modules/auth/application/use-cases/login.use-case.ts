import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/app.config';
import { IHashService } from '@/modules/auth/application/interfaces/ihash-service.interface';
import { ITokenRepository } from '@/modules/auth/domain/repositories/itoken-repository.interface';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { LoginInput } from '@/modules/auth/domain/interfaces/login-input.interface';
import { LoginOutput } from '@/modules/auth/domain/interfaces/login-output.interface';
import { InvalidCredentialsError, EntityNotFoundError, BusinessRuleViolationError } from '@/shared/domain/errors/domain-errors';
import { Email } from '@/shared/domain/value-objects';
import { UseCase } from '../../../users/domain/interfaces/use-case.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { HASH_SERVICE } from '@/shared/domain/services/hash.service.interface';
import { TOKEN_REPOSITORY } from '../../domain/repositories/token.repository.interface';
import { Either, left, right } from '@/shared/domain/errors/either';

type LoginError = InvalidCredentialsError | EntityNotFoundError | BusinessRuleViolationError;


@Injectable()
export class LoginUseCase implements UseCase<LoginInput, LoginOutput, LoginError> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: IHashService,
    @Inject(TOKEN_REPOSITORY) private readonly tokenRepository: ITokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) { }

  async execute(input: LoginInput): Promise<Either<LoginError, LoginOutput>> {
    // 1. Validar email VO
    const emailOrError = Email.create(input.email);
    if (emailOrError.isLeft()) {
      return left(new InvalidCredentialsError());
    }

    // 2. Buscar usuário por email
    const user = await this.userRepository.findByEmail(emailOrError.value);
    
    if (!user || !user.isActive) {
      return left(new InvalidCredentialsError());
    }

    // Se o usuário já tem empresa vinculada, mas o login não informou nenhuma
    // ou informou uma diferente, barramos. 
    // Se o usuário NÃO tem empresa (onboarding pendente), deixamos passar.
    if (user.companyId && input.companyId && user.companyId !== input.companyId) {
      return left(new InvalidCredentialsError());
    }

    // 2.1 Verificar se está verificado
    if (!user.isVerified) {
      return left(new BusinessRuleViolationError('Por favor, verifique seu e-mail antes de fazer login.'));
    }

    // 3. Verificar senha
    const passwordMatches = await this.hashService.compare(
      input.password,
      user.password.getRawValue(),
    );
    if (!passwordMatches) {
      return left(new InvalidCredentialsError());
    }

    // 4. Emitir tokens
    const payload = {
      sub: user.id.value,
      email: user.email.value,
      companyId: user.companyId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // 5. Salvar refresh token (permite revogar sessão)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.tokenRepository.save({
      userId: user.id.value,
      token: refreshToken,
      expiresAt,
    });

    // 6. Registrar último login
    user.recordLogin();
    await this.userRepository.update(user);

    return right({
      accessToken,
      refreshToken,
      user: {
        id: user.id.value,
        name: user.name,
        email: user.email.value,
        role: user.role,
        companyId: user.companyId,
        avatarUrl: user.avatarUrl,
      },
    });
  }
}

