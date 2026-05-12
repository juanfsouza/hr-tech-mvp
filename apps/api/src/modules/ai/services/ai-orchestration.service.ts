import { GenerateJdInput } from '@/modules/ai/application/interfaces/generate-jd-input.interface';
import { MatchAnalysisInput } from '@/modules/match/application/interfaces/match-analysis-input.interface';
import { MatchAnalysisOutput } from '@/modules/match/application/interfaces/match-analysis-output.interface';
import { ClaudeService } from '@/shared/infrastructure/ai/claude.service';
import { OpenAiService } from '@/shared/infrastructure/ai/openai.service';
import { PrismaService } from '@/shared/infrastructure/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiOrchestrationService {
  constructor(
    private readonly claude: ClaudeService,
    private readonly grok: OpenAiService,
    private readonly prisma: PrismaService,
  ) { }

  async *streamContextualChat(messages: any[], jobId?: string, companyId?: string) {
    let systemPrompt = 'Você é um assistente de RH focado em análise de candidatos e processos seletivos. Responda de forma concisa e útil.';

    if (jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: jobId, companyId },
        include: {
          candidates: {
            include: {
              matches: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
          }
        }
      });

      if (job) {
        const candidatesContext = job.candidates.map(c => {
          const match = c.matches[0];
          return `- ${c.name} (Email: ${c.email}): Match ${match?.overallScore || 'Pendente'}%. Perfil: ${match?.summary || 'Aguardando teste'}`;
        }).join('\n');

        systemPrompt = `
Você é o Co-piloto de Recrutamento para a vaga "${job.title}".
Contexto da Vaga: ${job.description}

Lista de Candidatos:
${candidatesContext}

Sua missão é ajudar o recrutador a analisar esses talentos. Se o match estiver baixo, explique o porquê com base nos perfis. Se estiver alto, destaque as sinergias.
        `.trim();
      }
    } else {
      // Contexto Global da Empresa
      const jobs = await this.prisma.job.findMany({
        where: { companyId, status: 'ACTIVE' },
        include: {
          candidates: {
            include: {
              matches: { orderBy: { createdAt: 'desc' }, take: 1 }
            },
            take: 10 // Top 10 candidatos gerais para não estourar o contexto
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const globalContext = jobs.map(j => {
        const candList = j.candidates.map(c => {
          const match = c.matches[0];
          return `  * ${c.name} (Match: ${match?.overallScore || 'N/A'}%)`;
        }).join('\n');
        return `Vaga: ${j.title}\nCandidatos:\n${candList}`;
      }).join('\n\n');

      systemPrompt = `
Você é o Co-piloto de IA da plataforma de RH. Você tem acesso a todos os processos seletivos da empresa.
Aqui está o resumo atual das vagas e candidatos:

${globalContext}

Sua tarefa é responder dúvidas estratégicas sobre o pipeline de contratação. Se perguntarem pelos "melhores", olhe para os scores de match.
Sempre responda em Português do Brasil de forma profissional e executiva.
      `.trim();
    }

    try {
      console.log('[AiOrchestration] Iniciando chat contextual com Claude...');
      const stream = await this.claude.stream(messages, { systemPrompt });
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error: any) {
      console.warn('[AiOrchestration] Claude falhou no chat. Tentando com Grok (xAI)...', error.message || error);
      try {
        const stream = await this.grok.stream(messages, { systemPrompt });
        for await (const chunk of stream) {
          yield chunk;
        }
      } catch (grokError: any) {
        console.error('[AiOrchestration] Falha total no chat assistente.', grokError.message || grokError);
        yield 'Desculpe, estou tendo dificuldades técnicas para acessar meus modelos de IA no momento. Por favor, tente novamente em alguns instantes.';
      }
    }
  }

  async generateCompanyContext(input: { companyName: string; profile: string; tags: string[] }): Promise<string> {
    const prompt = `
Escreva uma narrativa profissional e inspiradora para o momento atual da empresa "${input.companyName}".
O perfil de ritmo da empresa é: ${input.profile}.
Alguns valores/tags: ${input.tags.join(', ')}.

O texto deve ter cerca de 100 palavras, ser engajante para novos candidatos e explicar o que a empresa busca nesse momento. 
Responda apenas com o texto da narrativa, em Português do Brasil.
    `.trim();

    try {
      const response = await this.claude.chat([{ role: 'user', content: prompt }], {
        systemPrompt: 'Você é um especialista em employer branding e comunicação corporativa.',
        maxTokens: 1000,
      });
      return response.content;
    } catch (error) {
      const response = await this.grok.chat([{ role: 'user', content: prompt }], {
        systemPrompt: 'Você é um especialista em employer branding e comunicação corporativa.',
        maxTokens: 1000,
      });
      return response.content;
    }
  }

  async generateJobDescription(input: GenerateJdInput): Promise<string> {
    const prompt = `
Gere uma Job Description profissional e atrativa em português para a vaga abaixo.

**Título da Vaga**: ${input.jobTitle}
**Remoto**: ${input.isRemote ? 'Sim' : 'Não'}
${input.salaryRange ? `**Faixa Salarial**: R$ ${input.salaryRange.min.toLocaleString('pt-BR')} – R$ ${input.salaryRange.max.toLocaleString('pt-BR')}` : ''}
**Requisitos**: ${input.requirements.join(', ')}

**Contexto da Empresa**:
${input.companyContext}

Estruture a JD com: Sobre a empresa, Responsabilidades, Requisitos obrigatórios, Requisitos desejáveis, Benefícios e Processo seletivo.
Seja direto, profissional e engajante. Máximo 600 palavras.
    `.trim();

    try {
      console.log('[AiOrchestration] Tentando gerar JD com Claude...');
      const response = await this.claude.chat([{ role: 'user', content: prompt }], {
        systemPrompt: 'Você é um especialista em recrutamento e employer branding.',
        maxTokens: 1500,
      });

      // Se o Claude devolveu o mock (porque ele mesmo já tem fallback), tentamos o Grok
      if (response.model === 'mock-fallback') {
        throw new Error('Claude no credits');
      }

      return response.content;
    } catch (error) {
      try {
        console.warn('[AiOrchestration] Claude falhou. Tentando gerar JD com Grok (xAI)...');
        const response = await this.grok.chat([{ role: 'user', content: prompt }], {
          systemPrompt: 'Você é um especialista em recrutamento e employer branding.',
          maxTokens: 1500,
        });
        return response.content;
      } catch (grokError: any) {
        console.error('[AiOrchestration] Erro no Grok (xAI):', grokError.message || grokError);
        console.error('[AiOrchestration] Ambas as IAs falharam. Usando Modo Simulado.');
        return `### Descrição da Vaga (MODO SIMULADO)

Esta é uma descrição gerada automaticamente porque o serviço de IA está indisponível ou sem créditos.

**Requisitos:**
- Experiência prévia na função
- Boa comunicação
- Trabalho em equipe

**Responsabilidades:**
- Atuar no desenvolvimento de projetos
- Participar de reuniões de alinhamento`;
      }
    }
  }

  async analyzeCandidateMatch(input: MatchAnalysisInput): Promise<MatchAnalysisOutput> {
    const toolSchema = {
      type: 'object',
      properties: {
        overallScore: { type: 'number', description: 'Score geral 0-100' },
        jobMatch: {
          type: 'object',
          properties: {
            score: { type: 'number' }, rationale: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
          },
          required: ['score', 'rationale', 'strengths', 'risks'],
        },
        leaderMatch: {
          type: 'object',
          properties: {
            score: { type: 'number' }, rationale: { type: 'string' }, communicationTip: { type: 'string' },
          },
          required: ['score', 'rationale', 'communicationTip'],
        },
        cultureMatch: {
          type: 'object',
          properties: { score: { type: 'number' }, rationale: { type: 'string' } },
          required: ['score', 'rationale'],
        },
        recommendation: { type: 'string', enum: ['STRONG_YES', 'YES', 'MAYBE', 'NO'] },
        developmentPlan: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['overallScore', 'jobMatch', 'leaderMatch', 'cultureMatch', 'recommendation', 'developmentPlan', 'summary'],
    };

    const prompt = `
Analise a compatibilidade do candidato com a vaga e empresa abaixo.
IMPORTANTE: Retorne TODOS os textos (resumo, justificativas, pontos fortes, riscos e plano de desenvolvimento) em PORTUGUÊS DO BRASIL.

**CANDIDATO**: ${input.candidate.name}
- DISC: D=${input.candidate.disc.D}%, I=${input.candidate.disc.I}%, S=${input.candidate.disc.S}%, C=${input.candidate.disc.C}% (Dominante: ${input.candidate.disc.dominant})
- Eneagrama: Tipo ${input.candidate.enneagram.type}w${input.candidate.enneagram.wing} (${input.candidate.enneagram.typeName})
- MBTI: ${input.candidate.mbti.type}

**VAGA**: ${input.job.title}
${input.job.description}
Requisitos: ${input.job.requirements.join(', ')}

${input.leader ? `**LÍDER DIRETO**: ${input.leader.name}
DISC do líder: ${JSON.stringify(input.leader.disc)}
Eneagrama do líder: Tipo ${input.leader.enneagram?.type}` : '**LÍDER**: Não informado'}

**CONTEXTO DA EMPRESA**:
${input.companyContext}

Avalie com rigor mas construtividade. Considere compatibilidade de personalidade, estilo de trabalho e cultura.
    `.trim();

    try {
      console.log('[AiOrchestration] Analisando match com Claude...');
      const { result } = await this.claude.chatWithStructuredOutput<MatchAnalysisOutput>(
        [{ role: 'user', content: prompt }],
        toolSchema,
        'analyze_match',
        { systemPrompt: 'Você é um psicólogo organizacional especializado em assessment de pessoas.', maxTokens: 2048 },
      );
      return result;
    } catch (error) {
      try {
        console.warn('[AiOrchestration] Claude falhou na análise. Tentando com Grok...');
        const { result } = await this.grok.chatWithStructuredOutput<MatchAnalysisOutput>(
          [{ role: 'user', content: prompt }],
          toolSchema,
          { systemPrompt: 'Você é um psicólogo organizacional especializado em assessment de pessoas.', maxTokens: 2048 },
        );
        return result;
      } catch (grokError: any) {
        console.error('[AiOrchestration] Erro no Grok (Análise):', grokError.message || grokError);
        console.error('[AiOrchestration] Falha total na análise. Usando Mock.');
        return {
          overallScore: 75,
          jobMatch: { score: 70, rationale: 'Análise simulada.', strengths: ['Proatividade'], risks: ['Adaptação'] },
          leaderMatch: { score: 80, rationale: 'Alinhamento ok.', communicationTip: 'Seja direto.' },
          cultureMatch: { score: 75, rationale: 'Cultura compatível.' },
          recommendation: 'YES',
          developmentPlan: ['Curso de gestão'],
          summary: 'O candidato possui bom perfil para a vaga em modo de teste.'
        };
      }
    }
  }
}
