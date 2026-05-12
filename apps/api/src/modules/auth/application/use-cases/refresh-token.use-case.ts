import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Either, left, right } from '@shared/domain/errors/either';
import { UnauthorizedError } from '@shared/domain/errors/domain-errors';
import { TOKEN_REPOSITORY } from '@modules/auth/domain/repositories/token.repository.interface';
import { AppConfig } from 'src/config/app.config';
import { RefreshTokenInput } from '@/modules/auth/application/interfaces/refresh-token-input.interface';
import { RefreshTokenOutput } from '@/modules/auth/application/interfaces/refresh-token-output.interface';
import { ITokenRepository } from '@/modules/auth/domain/repositories/itoken-repository.interface';
import { UseCase } from '../../../users/domain/interfaces/use-case.interface';
import { USER_REPOSITORY } from '@/modules/users/domain/repositories/user.repository.interface';
import { IUserRepository } from '@/modules/users/domain/repositories/iuser-repository.interface';


@Injectable()
export class RefreshTokenUseCase
  implements UseCase<RefreshTokenInput, RefreshTokenOutput, UnauthorizedError> {
  constructor(
    @Inject(TOKEN_REPOSITORY) private readonly tokenRepository: ITokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) { }

  async execute(input: RefreshTokenInput): Promise<Either<UnauthorizedError, RefreshTokenOutput>> {
    // 1. Verificar assinatura JWT
    let payload: any;
    try {
      payload = this.jwtService.verify(input.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      console.log('[Auth] RefreshToken: Payload verificado:', JSON.stringify(payload));
    } catch (err: any) {
      console.error('[Auth] RefreshToken: Falha na verificação do JWT:', err.message);
      return left(new UnauthorizedError());
    }

    // 2. Verificar se token existe no banco e não foi revogado
    const stored = await this.tokenRepository.findByToken(input.refreshToken);
    if (!stored) {
      console.warn('[Auth] RefreshToken: Token não encontrado no banco');
      return left(new UnauthorizedError());
    }
    if (stored.revokedAt) {
      console.warn('[Auth] RefreshToken: Token revogado em:', stored.revokedAt);
      return left(new UnauthorizedError());
    }
    if (stored.expiresAt < new Date()) {
      console.warn('[Auth] RefreshToken: Token expirado em:', stored.expiresAt);
      return left(new UnauthorizedError());
    }

    // 3. Buscar dados atualizados do usuário
    console.log('[Auth] RefreshToken: Verificando usuário para sub:', payload.sub);
    const user = await this.userRepository.findById(payload.sub);
    
    if (!user) {
      console.warn('[Auth] RefreshToken: Usuário não encontrado no banco:', payload.sub);
      return left(new UnauthorizedError());
    }

    if (!user.isActive) {
      console.warn('[Auth] RefreshToken: Usuário inativo:', payload.sub);
      return left(new UnauthorizedError());
    }

    // 3.1 Revogar token antigo (token rotation)
    await this.tokenRepository.revoke(input.refreshToken);

    // 4. Emitir novos tokens
    const tokenPayload = {
      sub: user.id.value,
      email: user.email.value,
      companyId: user.companyId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const newRefreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // 5. Salvar novo refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.tokenRepository.save({
      userId: payload.sub,
      token: newRefreshToken,
      expiresAt,
    });

    return right({ accessToken, refreshToken: newRefreshToken });
  }
}
