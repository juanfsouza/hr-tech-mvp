import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/app.config';
import { LoginUseCase } from './auth/application/use-cases/login.use-case';
import { RegisterUseCase } from './auth/application/use-cases/register.use-case';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token.use-case';
import { JwtStrategy } from './auth/infrastructure/jwt.strategy';
import { BcryptHashService } from './auth/infrastructure/bcrypt-hash.service';
import { PrismaTokenRepository } from './auth/infrastructure/prisma-token.repository';
import { AuthController } from './auth/presentation/auth.controller';
import { HASH_SERVICE } from '../shared/domain/services/hash.service.interface';
import { TOKEN_REPOSITORY } from './auth/domain/repositories/token.repository.interface';
import { CompaniesModule } from './companies.module';
import { UsersModule } from './users.module';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<AppConfig>) => ({
        secret: config.getOrThrow('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.getOrThrow('JWT_ACCESS_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CompaniesModule,
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    JwtStrategy,
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_REPOSITORY, useClass: PrismaTokenRepository },
  ],
  exports: [JwtModule, PassportModule, HASH_SERVICE],
})
export class AuthModule { }
