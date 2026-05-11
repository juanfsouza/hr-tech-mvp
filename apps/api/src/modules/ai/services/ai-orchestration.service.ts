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
          return `- ${c.name} (${c.email}): Score ${match?.overallScore || 'N/A'}%. Resumo: ${match?.summary || 'Sem análise'}`;
        }).join('\n');

        systemPrompt = `
Você é o assistente de IA especialista da vaga "${job.title}".
Contexto da Vaga: ${job.description}

Candidatos nesta vaga:
${candidatesContext}

Sua tarefa é ajudar o recrutador a tomar decisões, comparar candidatos e sugerir próximos passos. 
Use os dados acima para fundamentar suas respostas. Se falarem de um candidato específico, use o resumo de match dele.
Responda sempre em Português do Brasil.
        `.trim();
      }
    }

    try {
      console.log('[AiOrchestration] Iniciando chat contextual com Claude...');
      return await this.claude.stream(messages, { systemPrompt });
    } catch (error) {
      console.warn('[AiOrchestration] Claude falhou no chat. Tentando com Grok...', error);
      try {
        return await this.grok.stream(messages, { systemPrompt });
      } catch (grokError) {
        console.error('[AiOrchestration] Falha total no chat assistente.', grokError);
        throw new Error('Ambos os serviços de IA estão indisponíveis.');
      }
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
