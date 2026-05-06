/**
 * Enneagram Engine — Motor TypeScript puro
 *
 * Baseado no RHETI (Riso-Hudson Enneagram Type Indicator) simplificado:
 * - 36 pares de afirmações (A vs B)
 * - Cada par pontua para dois tipos diferentes
 * - Tipo com maior score = tipo principal
 * - Wing = tipo adjacente com segunda maior pontuação
 *
 * Tipos: 1-Perfeccionista, 2-Ajudador, 3-Realizador, 4-Individualista,
 *        5-Investigador, 6-Leal, 7-Entusiasta, 8-Desafiador, 9-Pacificador
 */

import { EnneagramPairAnswer } from "@/interfaces/enneagram-pair-answer.interface";
import { EnneagramResult } from "@/interfaces/enneagram-result.interface";

export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
const TYPE_NAMES: Record<EnneagramType, string> = {
  1: 'O Perfeccionista',
  2: 'O Ajudador',
  3: 'O Realizador',
  4: 'O Individualista',
  5: 'O Investigador',
  6: 'O Leal',
  7: 'O Entusiasta',
  8: 'O Desafiador',
  9: 'O Pacificador',
};

const TYPE_DESCRIPTIONS: Record<EnneagramType, string> = {
  1: 'Principista e idealista, busca a perfeição e melhoria constante.',
  2: 'Generoso e atencioso, foca em ajudar os outros e construir relacionamentos.',
  3: 'Adaptável e orientado ao sucesso, motivado por conquistas e reconhecimento.',
  4: 'Expressivo e introspectivo, busca autenticidade e profundidade emocional.',
  5: 'Analítico e observador, acumula conhecimento antes de agir.',
  6: 'Comprometido e responsável, busca segurança e confia em sistemas.',
  7: 'Espontâneo e versátil, orientado a experiências positivas e possibilidades.',
  8: 'Confiante e decisivo, protege o que é seu e desafia limitações.',
  9: 'Receptivo e apoiador, busca harmonia e evita conflitos.',
};

const TYPE_STRENGTHS: Record<EnneagramType, string[]> = {
  1: ['Ético', 'Organizado', 'Responsável', 'Detalhista'],
  2: ['Empático', 'Generoso', 'Relacional', 'Altruísta'],
  3: ['Eficiente', 'Adaptável', 'Motivado', 'Confiante'],
  4: ['Criativo', 'Autêntico', 'Sensível', 'Inspirador'],
  5: ['Analítico', 'Inovador', 'Objetivo', 'Independente'],
  6: ['Leal', 'Responsável', 'Colaborativo', 'Vigilante'],
  7: ['Entusiasmado', 'Versátil', 'Espontâneo', 'Produtivo'],
  8: ['Corajoso', 'Direto', 'Protetor', 'Decidido'],
  9: ['Paciente', 'Harmonioso', 'Mediador', 'Estável'],
};

const TYPE_CHALLENGES: Record<EnneagramType, string[]> = {
  1: ['Perfeccionismo excessivo', 'Crítico consigo e outros', 'Rigidez'],
  2: ['Dificuldade em receber ajuda', 'Dependência de aprovação', 'Burnout'],
  3: ['Workaholism', 'Dificuldade com vulnerabilidade', 'Superficialidade'],
  4: ['Melancolia', 'Inveja', 'Hipersensibilidade'],
  5: ['Isolamento', 'Avareza de tempo/energia', 'Distanciamento emocional'],
  6: ['Ansiedade', 'Indecisão', 'Desconfiança'],
  7: ['Dificuldade com comprometimento', 'Superficialidade', 'Fuga de problemas'],
  8: ['Impulsividade', 'Dominância excessiva', 'Dificuldade com vulnerabilidade'],
  9: ['Procrastinação', 'Passividade', 'Auto-esquecimento'],
};

// Wings adjacentes por tipo
const ADJACENT_TYPES: Record<EnneagramType, [EnneagramType, EnneagramType]> = {
  1: [9, 2], 2: [1, 3], 3: [2, 4], 4: [3, 5], 5: [4, 6],
  6: [5, 7], 7: [6, 8], 8: [7, 9], 9: [8, 1],
};

export class EnneagramEngine {
  static calculate(answers: EnneagramPairAnswer[]): EnneagramResult {
    const scores: Record<EnneagramType, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    for (const a of answers) {
      if (a.choice === 'A') scores[a.typeA] += 1;
      else scores[a.typeB] += 1;
    }

    // Tipo principal = maior score
    const sorted = (Object.keys(scores) as unknown as EnneagramType[])
      .map((t) => ({ type: Number(t) as EnneagramType, score: scores[Number(t) as EnneagramType] }))
      .sort((a, b) => b.score - a.score);

    const mainType = sorted[0]!.type;

    // Wing = tipo adjacente com maior score
    const [adj1, adj2] = ADJACENT_TYPES[mainType];
    const wing = scores[adj1] >= scores[adj2] ? adj1 : adj2;

    // Nível de integração: calculado por dispersão do score (1=muito concentrado = saudável)
    const maxScore = sorted[0]!.score;
    const totalAnswers = answers.length;
    const integrationLevel = Math.max(1, Math.min(9, Math.round(9 - (maxScore / totalAnswers) * 8)));

    return {
      type: mainType,
      wing: `${mainType}w${wing}`,
      integrationLevel,
      typeName: TYPE_NAMES[mainType],
      description: TYPE_DESCRIPTIONS[mainType],
      strengths: TYPE_STRENGTHS[mainType],
      challenges: TYPE_CHALLENGES[mainType],
      scores,
    };
  }

  static parseResponses(
    responses: Array<{ questionId: string; answer: string }>,
  ): EnneagramPairAnswer[] {
    return responses.map((r) => {
      const parsed = JSON.parse(r.answer) as {
        choice: 'A' | 'B';
        typeA: EnneagramType;
        typeB: EnneagramType;
      };
      return { pairId: r.questionId, ...parsed };
    });
  }
}
