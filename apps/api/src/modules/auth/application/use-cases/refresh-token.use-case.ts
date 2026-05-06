import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Either, left, right } from '@shared/domain/errors/either';
import { UnauthorizedError } from '@shared/domain/errors/domain-errors';
import { TOKEN_REPOSITORY } from '@modules/auth/domain/repositories/token.repository.interface';
import { AppConfig } from 'src/config/app.config';
import { RefreshTokenInput } from '@/interfaces/refresh-token-input.interface';
import { RefreshTokenOutput } from '@/interfaces/refresh-token-output.interface';
import { UseCase } from '@/interfaces/use-case.interface';
import { ITokenRepository } from '@/interfaces/itoken-repository.interface';


@Injectable()
export class RefreshTokenUseCase
  implements UseCase<RefreshTokenInput, RefreshTokenOutput, UnauthorizedError> {
  constructor(
    @Inject(TOKEN_REPOSITORY) private readonly tokenRepository: ITokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) { }

  async execute(input: RefreshTokenInput): Promise<Either<UnauthorizedError, RefreshTokenOutput>> {
    // 1. Verificar assinatura JWT
    let payload: { sub: string; email: string; companyId: string; role: string };
    try {
      payload = this.jwtService.verify<typeof payload>(input.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      return left(new UnauthorizedError());
    }

    // 2. Verificar se token existe no banco e não foi revogado
    const stored = await this.tokenRepository.findByToken(input.refreshToken);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return left(new UnauthorizedError());
    }

    // 3. Revogar token antigo (token rotation)
    await this.tokenRepository.revoke(input.refreshToken);

    // 4. Emitir novos tokens
    const tokenPayload = {
      sub: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
      role: payload.role,
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
