import {
  Controller, Post, Get, Body, Param,
  UseGuards, HttpCode, HttpStatus,
  NotFoundException, Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/infrastructure/http/decorators/current-user.decorator';
import { MatchService } from '@modules/match/application/match.service';
import { PrismaService } from '@shared/infrastructure/database/prisma.service';
import { AuthenticatedUser } from '@shared/infrastructure/http/decorators/current-user.decorator';
import { PdfService } from '@shared/infrastructure/pdf/pdf.service';

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
    private readonly pdfService: PdfService,
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

  @Get(':matchId/pdf')
  @ApiOperation({ summary: 'Exportar relatório de match em PDF' })
  async downloadPdf(
    @Param('matchId') matchId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: any,
  ) {
    try {
      const match = await this.prisma.match.findFirst({
        where: { id: matchId, companyId: user.companyId! },
        include: { candidate: true },
      });
      if (!match) throw new NotFoundException('Match not found');

      console.log(`[MatchController] Gerando PDF para candidato: ${match.candidate.name}`);
      
      const pdfBuffer = await this.pdfService.generateMatchReportPdf(
        match.candidate.name,
        match.fullAnalysis,
      );

      res.header('Content-Type', 'application/pdf');
      res.header('Content-Disposition', `attachment; filename=match-report-${match.candidate.name}.pdf`);
      res.header('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error: any) {
      console.error('[MatchController] Erro ao gerar PDF:', error.message || error);
      return res.status(500).send({
        statusCode: 500,
        message: 'Falha ao gerar o arquivo PDF. Verifique os logs do servidor.',
        error: error.message
      });
    }
  }
}
