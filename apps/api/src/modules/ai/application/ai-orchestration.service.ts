import { Injectable } from '@nestjs/common';
import { ClaudeService } from '@modules/ai/claude/claude.service';

/**
 * AiOrchestrationService — orquestra chamadas ao Claude para tarefas de RH
 */
@Injectable()
export class AiOrchestrationService {
  constructor(private readonly claude: ClaudeService) {}

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

    const response = await this.claude.chat([{ role: 'user', content: prompt }], {
      systemPrompt: 'Você é um especialista em recrutamento e employer branding.',
      maxTokens: 1500,
    });

    return response.content;
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

    const { result } = await this.claude.chatWithStructuredOutput<MatchAnalysisOutput>(
      [{ role: 'user', content: prompt }],
      toolSchema,
      'analyze_match',
      { systemPrompt: 'Você é um psicólogo organizacional especializado em assessment de pessoas.', maxTokens: 2048 },
    );

    return result;
  }
}
