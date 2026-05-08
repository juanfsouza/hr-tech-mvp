import { Global, Module } from '@nestjs/common';
import { ClaudeService } from '../shared/infrastructure/ai/claude.service';
import { OpenAiService } from '../shared/infrastructure/ai/openai.service';
import { EmbeddingsService } from '../shared/infrastructure/ai/embeddings.service';
import { AiOrchestrationService } from './ai/services/ai-orchestration.service';
import { AiController } from './ai/controllers/ai.controller';

@Global()
@Module({
  controllers: [AiController],
  providers: [ClaudeService, OpenAiService, EmbeddingsService, AiOrchestrationService],
  exports: [ClaudeService, OpenAiService, EmbeddingsService, AiOrchestrationService],
})
export class AiModule { }
