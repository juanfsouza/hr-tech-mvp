import { Controller, Body, Sse, MessageEvent, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '@shared/infrastructure/http/guards/jwt-auth.guard';
import { ClaudeService } from '@/shared/infrastructure/ai/claude.service';

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

  @Sse('stream')
  @ApiOperation({ summary: 'Conversar com IA do RH via Server-Sent Events (SSE)' })
  streamChat(@Body() body: ChatRequestDto): Observable<MessageEvent> {
    if (!body.messages || body.messages.length === 0) {
      throw new BadRequestException('Messages array cannot be empty');
    }

    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          const stream = this.claudeService.stream(body.messages, {
            systemPrompt: 'Você é um assistente de RH focado em análise de candidatos e processos seletivos. Responda de forma concisa e útil.',
          });

          for await (const chunk of stream) {
            subscriber.next({ data: { text: chunk } } as MessageEvent);
          }

          subscriber.next({ data: '[DONE]' } as MessageEvent);
          subscriber.complete();
        } catch (error: unknown) {
          subscriber.error(error instanceof Error ? error.message : 'Unknown error');
        }
      })();
    });
  }
}
