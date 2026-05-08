import { Controller, Body, Post, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { ClaudeService } from '@/shared/infrastructure/ai/claude.service';
import { FastifyReply } from 'fastify';

export class ChatMessageDto {
  role!: 'user' | 'assistant';
  content!: string;
}

export class ChatRequestDto {
  messages!: ChatMessageDto[];
}

@ApiTags('AI Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/chat')
export class AiController {
  constructor(private readonly claudeService: ClaudeService) { }

  @Post('stream')
  @ApiOperation({ summary: 'Conversar com IA do RH via Stream (POST)' })
  async streamChat(
    @Body() body: ChatRequestDto,
    @Res() res: FastifyReply,
  ) {
    if (!body.messages || body.messages.length === 0) {
      throw new BadRequestException('Messages array cannot be empty');
    }

    // Configurar cabeçalhos para Server-Sent Events (SSE)
    res.raw.setHeader('Content-Type', 'text/event-stream');
    res.raw.setHeader('Cache-Control', 'no-cache');
    res.raw.setHeader('Connection', 'keep-alive');

    try {
      const stream = this.claudeService.stream(body.messages, {
        systemPrompt: 'Você é um assistente de RH focado em análise de candidatos e processos seletivos. Responda de forma concisa e útil.',
      });

      for await (const chunk of stream) {
        // Enviar no formato SSE: "data: content\n\n"
        res.raw.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      res.raw.write(`data: [DONE]\n\n`);
      res.raw.end();
    } catch (error: any) {
      res.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.raw.end();
    }
  }
}
