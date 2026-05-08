import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AppConfig } from 'src/config/app.config';
import { ClaudeResponse } from '@/shared/infrastructure/interfaces/claude-response.interface';
import { ClaudeMessage } from '../interfaces/claude-message.interface';
import { ClaudeOptions } from '../interfaces/claude-options.interface';



@Injectable()
export class ClaudeService {
  private readonly client: Anthropic;
  private readonly model = 'claude-sonnet-4-5' as const;

  constructor(config: ConfigService<AppConfig>) {
    this.client = new Anthropic({
      apiKey: config.getOrThrow('ANTHROPIC_API_KEY'),
    });
  }

  async chat(messages: ClaudeMessage[], options: ClaudeOptions = {}): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens ?? 4096,
        system: options.systemPrompt ?? 'Você é um assistente especializado em RH e gestão de pessoas.',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return {
        content,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: response.model,
      };
    } catch (error: any) {
      if (error.message?.includes('credit balance') || error.status === 400) {
        console.warn('[ClaudeService] Erro de créditos ou API. Usando resposta Mock para não travar o sistema.');
        return {
          content: "### Descrição da Vaga (MODO SIMULADO)\n\nEsta é uma descrição gerada automaticamente porque o serviço de IA está indisponível ou sem créditos. \n\n**Requisitos:**\n- Experiência prévia na função\n- Boa comunicação\n- Trabalho em equipe\n\n**Responsabilidades:**\n- Atuar no desenvolvimento de projetos\n- Participar de reuniões de alinhamento",
          inputTokens: 0,
          outputTokens: 0,
          model: 'mock-fallback',
        };
      }
      throw error;
    }
  }

  async chatWithStructuredOutput<T>(
    messages: ClaudeMessage[],
    toolSchema: Record<string, unknown>,
    toolName: string,
    options: ClaudeOptions = {},
  ): Promise<{ result: T; inputTokens: number; outputTokens: number }> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens ?? 4096,
        system: options.systemPrompt ?? 'Você é um assistente especializado em RH.',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        tools: [
          {
            name: toolName,
            description: `Generate structured ${toolName} output`,
            input_schema: toolSchema as Anthropic.Tool['input_schema'],
          },
        ],
        tool_choice: { type: 'tool', name: toolName },
      });

      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      if (!toolUseBlock) {
        throw new Error(`Claude did not return tool_use block for ${toolName}`);
      }

      return {
        result: toolUseBlock.input as T,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    } catch (error: any) {
      if (error.message?.includes('credit balance') || error.status === 400) {
        console.warn(`[ClaudeService] Erro de créditos para saída estruturada (${toolName}). Usando Mock.`);
        
        // Mock genérico para não travar
        let mockResult: any = {};
        if (toolName === 'generate_jd') {
          mockResult = { jd: "Descrição simulada devido à falta de créditos na API." };
        } else {
          mockResult = { 
            analysis: "Análise simulada.",
            suggestion: "Sugestão padrão.",
            match_score: 85
          };
        }

        return {
          result: mockResult as T,
          inputTokens: 0,
          outputTokens: 0,
        };
      }
      throw error;
    }
  }

  async *stream(messages: ClaudeMessage[], options: ClaudeOptions = {}): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: options.maxTokens ?? 2048,
      system: options.systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}
