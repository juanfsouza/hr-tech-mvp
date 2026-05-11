import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  UseGuards,
  Query,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@modules/auth/application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '@modules/auth/application/use-cases/refresh-token.use-case';
import { VerifyEmailUseCase } from '@modules/auth/application/use-cases/verify-email.use-case';
import { OAuthLoginUseCase } from '@modules/auth/application/use-cases/oauth-login.use-case';
import { ForgotPasswordUseCase } from '@modules/auth/application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '@modules/auth/application/use-cases/reset-password.use-case';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../infrastructure/guards/google-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@shared/infrastructure/http/decorators/current-user.decorator';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from '../application/dtos/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) { }

  // ─── POST /auth/login ──────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário de RH' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ accessToken: string; user: object }> {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
      companyId: dto.companyId,
    });

    if (result.isLeft()) {
      const err = result.value;
      if (err.code === 'INVALID_CREDENTIALS') {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }

    const { accessToken, refreshToken, user } = result.value;

    // Access token via HTTP-only cookie
    reply.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax', // Permite envio em navegações cross-site básicas
      path: '/',
      maxAge: 60 * 60, // 1 hora
    });

    // Refresh token via HTTP-only cookie
    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/', // Mudado para / para facilitar acesso e limpeza
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return { accessToken, user };
  }

  // ─── POST /auth/register ───────────────────────────────────────────────────
  @ApiOperation({ summary: 'Registrar novo usuário de RH' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto): Promise<{ userId: string; message: string }> {
    const result = await this.registerUseCase.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });

    if (result.isLeft()) {
      const err = result.value;
      if (err.code === 'RESOURCE_ALREADY_EXISTS') throw new ConflictException(err.message);
      throw new BadRequestException(err.message);
    }

    return { userId: result.value.userId, message: 'User registered successfully.' };
  }

  // ─── GET /auth/verify ──────────────────────────────────────────────────────
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar e-mail do usuário' })
  async verify(@Query('token') token: string): Promise<{ message: string }> {
    const result = await this.verifyEmailUseCase.execute({ token });
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return { message: result.value.message };
  }

  // ─── POST /auth/refresh ────────────────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token via refresh token (cookie)' })
  @ApiCookieAuth('refresh_token')
  async refresh(
    @Req() request: any,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ accessToken: string }> {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token provided.');

    const result = await this.refreshTokenUseCase.execute({ refreshToken });
    if (result.isLeft()) {
      throw new UnauthorizedException(result.value.message);
    }

    const { accessToken, refreshToken: newRefreshToken } = result.value;

    reply.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    reply.setCookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { accessToken };
  }

  // ─── POST /auth/logout ─────────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão (revogar refresh token)' })
  async logout(@Res({ passthrough: true }) reply: FastifyReply): Promise<void> {
    reply.clearCookie('access_token', { path: '/' });
    reply.clearCookie('refresh_token', { path: '/' });
  }

  // ─── GET /auth/me ──────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  async me(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthenticatedUser> {
    return user;
  }

  // ─── POST /auth/forgot-password ────────────────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    const result = await this.forgotPasswordUseCase.execute({ email: dto.email });
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  // ─── POST /auth/reset-password ─────────────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha usando token' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    const result = await this.resetPasswordUseCase.execute({
      token: dto.token,
      newPassword: dto.newPassword,
    });
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return result.value;
  }

  // ─── GOOGLE AUTH ───────────────────────────────────────────────────────────
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Iniciar login via Google' })
  async googleAuth() {
    // O Guard inicia o redirecionamento para o Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback do Google OAuth' })
  async googleAuthRedirect(
    @Res() reply: FastifyReply,
    @CurrentUser() googleUser: any,
  ) {
    const logger = new Logger('GoogleAuth');
    logger.log(`Usuário autenticado via Google: ${googleUser?.email}`);
    const result = await this.oauthLoginUseCase.execute({
      email: googleUser.email,
      name: `${googleUser.firstName} ${googleUser.lastName}`,
      picture: googleUser.picture,
    });

    const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';

    if (result.isLeft()) {
      const errorUrl = `${frontendUrl}/login?error=${encodeURIComponent(result.value.message)}`;
      logger.error(`Redirecionando com erro para: ${errorUrl}`);
      return reply.redirect(errorUrl);
    }

    const { accessToken, refreshToken, user } = result.value;

    // Configurar Cookies
    reply.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    const userBase64 = Buffer.from(JSON.stringify(user)).toString('base64');
    const redirectUrl = `${frontendUrl}/dashboard?auth=google&user=${userBase64}`;

    logger.log(`Redirecionando via HTML (Seguro para Cookies): ${redirectUrl}`);

    // Enviamos um HTML simples que faz o redirecionamento. 
    // Isso garante que o Fastify processe os Cookies antes da mudança de página.
    return reply.type('text/html').send(`
      <html>
        <head>
          <title>Redirecionando...</title>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </head>
        <body style="background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <p>Autenticação concluída! Redirecionando para o dashboard...</p>
          </div>
        </body>
      </html>
    `);
  }
}
