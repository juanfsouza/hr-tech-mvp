import {
  Controller, Post, Get, Patch, Body, Param,
  UseGuards, HttpCode, HttpStatus,
  NotFoundException, BadRequestException,
} from '@nestjs/common';

import { CurrentUser, } from '@shared/infrastructure/http/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { DISC_QUESTIONS } from '@modules/tests/engine/disc/disc.questions';
import { ENNEAGRAM_QUESTIONS } from '@modules/tests/engine/enneagram/enneagram.questions';
import { IPIP_120_QUESTIONS } from '@modules/tests/engine/sixteen-personalities/ipip120.questions';
import { AuthenticatedUser } from '@/shared/infrastructure/http/interfaces/authenticated-user.interface';
import { CompleteTestUseCase } from '../application/use-cases/complete-session.use-case';
import { CreateTestSessionUseCase } from '../application/use-cases/create-session.use-case';
import { GetTestSessionByTokenUseCase } from '../application/use-cases/list.session.use-case';
import { SaveProgressUseCase } from '../application/use-cases/save-session.use-case';

class CreateSessionDto {
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() candidateId?: string;
  @ApiProperty({ required: false, default: 72 }) @IsOptional() @IsNumber() expiryHours?: number;
}

class SaveProgressDto {
  @ApiProperty({ enum: ['DISC', 'ENNEAGRAM', 'SIXTEEN_PERSONALITIES'] })
  @IsIn(['DISC', 'ENNEAGRAM', 'SIXTEEN_PERSONALITIES'])
  testType!: 'DISC' | 'ENNEAGRAM' | 'SIXTEEN_PERSONALITIES';

  @ApiProperty() @IsString() @IsNotEmpty() questionId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() answer!: string;
}

class CompleteTestDto {
  @ApiProperty({ enum: ['DISC', 'ENNEAGRAM', 'SIXTEEN_PERSONALITIES'] })
  @IsIn(['DISC', 'ENNEAGRAM', 'SIXTEEN_PERSONALITIES'])
  testType!: 'DISC' | 'ENNEAGRAM' | 'SIXTEEN_PERSONALITIES';
}

@ApiTags('Tests')
@Controller('tests')
export class TestsController {
  constructor(
    private readonly createSession: CreateTestSessionUseCase,
    private readonly getByToken: GetTestSessionByTokenUseCase,
    private readonly saveProgress: SaveProgressUseCase,
    private readonly completeTest: CompleteTestUseCase,
  ) { }

  // ─── POST /tests/sessions (autenticado — RH cria link) ───────────────────
  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar link de teste para candidato' })
  async createTestSession(
    @Body() dto: CreateSessionDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ token: string; portalUrl: string; expiresAt: Date }> {
    const result = await this.createSession.execute({
      companyId: user.companyId!,
      candidateId: dto.candidateId,
      expiryHours: dto.expiryHours,
    });

    // BUG FIX: verificar erro antes de acessar result.value
    if (result.isLeft()) throw new BadRequestException('Falha ao criar sessão de teste.');

    const { token, portalUrl, expiresAt } = result.value;
    return { token, portalUrl, expiresAt };
  }

  // ─── GET /tests/portal/:token (público — candidato acessa) ───────────────
  @Get('portal/:token')
  @ApiOperation({ summary: 'Verificar validade do link de teste (portal white-label)' })
  async getSession(@Param('token') token: string): Promise<{
    sessionId: string; status: string; currentTest?: string; expiresAt: Date;
  }> {
    const result = await this.getByToken.execute(token);
    if (result.isLeft()) throw new BadRequestException(result.value.message);
    return result.value;
  }

  // ─── PATCH /tests/portal/:token/progress (público — candidato salva resposta) ──
  @Patch('portal/:token/progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Salvar resposta incremental (anti-perda de dados)' })
  async saveAnswer(
    @Param('token') token: string,
    @Body() dto: SaveProgressDto,
  ): Promise<{ saved: boolean }> {
    const result = await this.saveProgress.execute({ token, ...dto });
    if (result.isLeft()) {
      const err = result.value;
      if (err.code === 'ENTITY_NOT_FOUND') throw new NotFoundException(err.message);
      throw new BadRequestException(err.message);
    }
    return { saved: true };
  }

  // ─── POST /tests/portal/:token/complete (público — finaliza um teste) ────
  @Post('portal/:token/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar um teste e avançar para o próximo (ou calcular perfil)' })
  async complete(
    @Param('token') token: string,
    @Body() dto: CompleteTestDto,
  ): Promise<{ allCompleted: boolean; nextTest?: string; profileId?: string }> {
    const result = await this.completeTest.execute({ token, testType: dto.testType });
    if (result.isLeft()) {
      const err = result.value;
      if (err.code === 'ENTITY_NOT_FOUND') throw new NotFoundException(err.message);
      throw new BadRequestException(err.message);
    }
    return result.value;
  }

  // ─── GET /tests/questions/:type (público — servir banco de questões) ─────
  @Get('questions/:type')
  @ApiOperation({ summary: 'Retornar banco de questões de um tipo de teste' })
  getQuestions(
    @Param('type') type: string,
  ): object {
    switch (type.toUpperCase()) {
      case 'DISC':
        return { type: 'DISC', totalBlocks: DISC_QUESTIONS.length, questions: DISC_QUESTIONS };
      case 'ENNEAGRAM':
        return { type: 'ENNEAGRAM', totalPairs: ENNEAGRAM_QUESTIONS.length, questions: ENNEAGRAM_QUESTIONS };
      case 'SIXTEEN_PERSONALITIES':
        return { type: 'SIXTEEN_PERSONALITIES', totalItems: IPIP_120_QUESTIONS.length, questions: IPIP_120_QUESTIONS };
      default:
        throw new BadRequestException(`Unknown test type: ${type}. Valid: DISC, ENNEAGRAM, SIXTEEN_PERSONALITIES`);
    }
  }
}
