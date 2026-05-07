import { EmbeddingResult } from '@/modules/ai/application/interfaces/embedding-result.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class EmbeddingsService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: ConfigService<AppConfig>) {
    const baseURL = config.get('OPENAI_BASE_URL');
    const isXai = baseURL?.includes('x.ai');

    this.client = new OpenAI({
      apiKey: config.getOrThrow('OPENAI_API_KEY'),
      baseURL,
    });

    this.model = isXai ? 'v1' : 'text-embedding-3-small';
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text.slice(0, 8000),
    });

    return {
      vector: response.data[0]!.embedding,
      inputTokens: response.usage.prompt_tokens,
    };
  }

  async embedMany(texts: string[]): Promise<EmbeddingResult[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts.map((t) => t.slice(0, 8000)),
    });

    return response.data.map((d) => ({
      vector: d.embedding,
      inputTokens: Math.round(response.usage.prompt_tokens / texts.length),
    }));
  }

  static cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i]!, 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (normA * normB);
  }
}
