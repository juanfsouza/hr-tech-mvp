import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AppConfig } from 'src/config/app.config';
import { ClaudeMessage } from '../interfaces/claude-message.interface';
import { ClaudeOptions } from '../interfaces/claude-options.interface';
import { ClaudeResponse } from '../interfaces/claude-response.interface';

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: ConfigService<AppConfig>) {
    const apiKey = config.get('OPENAI_API_KEY', { infer: true });
    const baseURL = config.get('OPENAI_BASE_URL', { infer: true }) || 'https://api.openai.com/v1';
    
    // Se o baseURL contiver x.ai, usamos o modelo do Grok, senão gpt-4o
    this.model = baseURL.includes('x.ai') ? 'grok-latest' : 'gpt-4o';

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });
  }

  async chat(messages: ClaudeMessage[], options: ClaudeOptions = {}): Promise<ClaudeResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        ...messages.map((m) => ({ 
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user', 
          content: m.content 
        })),
      ],
      max_tokens: options.maxTokens ?? 2048,
    });

    const content = response.choices[0]?.message?.content || '';

    return {
      content,
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      model: response.model,
    };
  }

  async chatWithStructuredOutput<T>(
    messages: ClaudeMessage[],
    toolSchema: Record<string, unknown>,
    options: ClaudeOptions = {},
  ): Promise<{ result: T; inputTokens: number; outputTokens: number }> {
    // Para simplificar a compatibilidade entre Grok e OpenAI, usamos response_format ou function calling básico
    // Aqui usaremos o modo JSON se o modelo suportar
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: `${options.systemPrompt || ''}\nResponda estritamente em JSON seguindo este esquema: ${JSON.stringify(toolSchema)}` },
        ...messages.map((m) => ({ 
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user', 
          content: m.content 
        })),
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    return {
      result: JSON.parse(content) as T,
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
    };
  }
}
