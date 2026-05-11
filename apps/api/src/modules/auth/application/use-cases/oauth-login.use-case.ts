import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/app.config';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';
import { ITokenRepository } from '@/modules/auth/domain/repositories/itoken-repository.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { TOKEN_REPOSITORY } from '../../domain/repositories/token.repository.interface';
import { Email } from '@/shared/domain/value-objects/email.vo';
import { Password } from '@/shared/domain/value-objects/password.vo';
import { User } from '@/modules/users/domain/entities/user.entity';
import { Either, right, left } from '@/shared/domain/errors/either';
import { DomainError, BusinessRuleViolationError } from '@/shared/domain/errors/domain-errors';
import { v4 as uuidv4 } from 'uuid';

export interface OAuthLoginInput {
  email: string;
  name: string;
  picture?: string;
}

export interface OAuthLoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId?: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(TOKEN_REPOSITORY) private readonly tokenRepository: ITokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) { }

  async execute(input: OAuthLoginInput): Promise<Either<DomainError, OAuthLoginOutput>> {
    const emailOrError = Email.create(input.email);
    if (emailOrError.isLeft()) return left(new BusinessRuleViolationError('Invalid email from OAuth provider'));

    let user = await this.userRepository.findByEmail(emailOrError.value);

    // Se o usuário não existe, criamos um novo
    if (!user) {
      // Como é OAuth, criamos uma senha aleatória que nunca será usada
      const randomPassword = Password.createHashed(uuidv4()); 
      
      user = User.create({
        email: emailOrError.value,
        name: input.name,
        password: randomPassword,
        role: 'HR', // Default role
        avatarUrl: input.picture,
      });

      // Usuários vindos do Google já são considerados verificados
      user.verifyEmail();
      await this.userRepository.save(user);
    }

    if (!user.isActive) return left(new BusinessRuleViolationError('User account is inactive'));

    // Emitir tokens
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

    // Salvar refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.tokenRepository.save({
      userId: user.id.value,
      token: refreshToken,
      expiresAt,
    });

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
