import { Controller, Body, Post, Res, UseGuards, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { AiOrchestrationService } from '../services/ai-orchestration.service';
import { FastifyReply } from 'fastify';
import { AuthenticatedUser, CurrentUser } from '@shared/infrastructure/http/decorators/current-user.decorator';

export class ChatMessageDto {
  role!: 'user' | 'assistant';
  content!: string;
}

export class ChatRequestDto {
  messages!: ChatMessageDto[];
  jobId?: string;
}

export class GenerateContextDto {
  companyName!: string;
  profile!: string;
  tags!: string[];
}

@ApiTags('AI Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/chat')
export class AiController {
  constructor(private readonly aiOrchestration: AiOrchestrationService) { }

  @Post('stream')
  @ApiOperation({ summary: 'Conversar com IA do RH via Stream (POST)' })
  async streamChat(
    @Body() body: ChatRequestDto,
    @Res() res: FastifyReply,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!body.messages || body.messages.length === 0) {
      throw new BadRequestException('Messages array cannot be empty');
    }

    // Configurar cabeçalhos para Server-Sent Events (SSE)
    res.raw.setHeader('Content-Type', 'text/event-stream');
    res.raw.setHeader('Cache-Control', 'no-cache');
    res.raw.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.aiOrchestration.streamContextualChat(
        body.messages,
        body.jobId,
        user.companyId
      );

      for await (const chunk of stream) {
        res.raw.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      res.raw.write(`data: [DONE]\n\n`);
      res.raw.end();
    } catch (error: any) {
      res.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.raw.end();
    }
  }

  @Post('generate-context')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar narrativa de contexto da empresa via IA' })
  async generateContext(@Body() dto: GenerateContextDto) {
    const text = await this.aiOrchestration.generateCompanyContext(dto);
    return { text };
  }
}
