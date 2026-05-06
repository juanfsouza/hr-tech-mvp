import { Global, Module } from '@nestjs/common';
import { ClaudeService } from '../shared/infrastructure/ai/claude.service';
import { EmbeddingsService } from '../shared/infrastructure/ai/embeddings.service';
import { AiOrchestrationService } from './ai/services/ai-orchestration.service';
import { AiController } from './ai/controllers/ai.controller';

@Global()
@Module({
  controllers: [AiController],
  providers: [ClaudeService, EmbeddingsService, AiOrchestrationService],
  exports: [ClaudeService, EmbeddingsService, AiOrchestrationService],
})
export class AiModule { }
