import {
  Controller, Post, Get, Body, Param,
  UseGuards, HttpCode, HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/infrastructure/http/decorators/current-user.decorator';
import { MatchService } from '@modules/match/application/match.service';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { AuthenticatedUser } from '@shared/infrastructure/http/decorators/current-user.decorator';

class TriggerMatchDto {
  @ApiProperty() @IsUUID() candidateId!: string;
  @ApiProperty() @IsUUID() jobId!: string;
}

@ApiTags('Match')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly prisma: PrismaService,
  ) { }

  @Post('analyze')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Disparar análise de match candidato ↔ vaga (assíncrono)' })
  async triggerAnalysis(
    @Body() dto: TriggerMatchDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ jobQueueId: string; message: string }> {
    const jobQueueId = await this.matchService.enqueueAnalysis({
      candidateId: dto.candidateId,
      jobId: dto.jobId,
      companyId: user.companyId!,
    });

    return {
      jobQueueId,
      message: 'Analysis queued. Results will be available shortly.',
    };
  }

  @Get('candidate/:candidateId')
  @ApiOperation({ summary: 'Obter resultados de match de um candidato' })
  async getByCandidate(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<object[]> {
    const matches = await this.prisma.match.findMany({
      where: { candidateId, companyId: user.companyId! },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, jobId: true, overallScore: true,
        recommendation: true, summary: true, createdAt: true,
      },
    });
    return matches;
  }

  @Get(':matchId')
  @ApiOperation({ summary: 'Obter análise completa de match' })
  async getMatch(
    @Param('matchId') matchId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<object> {
    const match = await this.prisma.match.findFirst({
      where: { id: matchId, companyId: user.companyId! },
    });
    if (!match) throw new NotFoundException('Match analysis not found.');

    return {
      id: match.id,
      candidateId: match.candidateId,
      jobId: match.jobId,
      overallScore: match.overallScore,
      recommendation: match.recommendation,
      summary: match.summary,
      details: match.fullAnalysis,
      createdAt: match.createdAt,
    };
  }
}
