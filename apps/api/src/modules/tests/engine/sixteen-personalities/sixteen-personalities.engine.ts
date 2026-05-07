/**
 * 16 Personalities Engine (IPIP-120) — Motor TypeScript puro
 *
 * Baseado no IPIP-NEO-120 (International Personality Item Pool) — Domínio Público
 * Referência: https://ipip.ori.org
 *
 * - 120 itens em escala Likert 1-5
 * - Mede as 5 dimensões Big Five (OCEAN)
 * - Converte para tipo MBTI-style (4 letras)
 *
 * Mapeamento Big Five → MBTI:
 *   Extraversion   → E (alto) / I (baixo)
 *   Openness       → N (alto) / S (baixo)
 *   Conscientiousness → J (alto) / P (baixo)
 *   Agreeableness  → F (alto) / T (baixo) [invertido]
 *   Neuroticism    → indicador de estabilidade emocional (não mapeado diretamente)
 */

import { BigFiveScores } from "@/modules/tests/domain/interfaces/big-five-scores.interface";
import { IpipItemResponse } from "@/modules/tests/domain/interfaces/ipip-item-response.interface";
import { SixteenPResult } from "@/modules/tests/domain/interfaces/sixteen-presult.interface";

export type MbtiLetter = 'E' | 'I' | 'N' | 'S' | 'T' | 'F' | 'J' | 'P';
export type BigFiveDimension = 'O' | 'C' | 'E' | 'A' | 'N';
const MBTI_DESCRIPTIONS: Record<string, string> = {
  INTJ: 'O Arquiteto: Estratégico, independente e determinado. Excelente em planejamento de longo prazo.',
  INTP: 'O Lógico: Analítico, objetivo e inventivo. Adora teorias e sistemas complexos.',
  ENTJ: 'O Comandante: Líder nato, eficiente e determinado. Excelente em organizar pessoas.',
  ENTP: 'O Inovador: Criativo, engenhoso e debatedor. Gosta de desafiar convenções.',
  INFJ: 'O Advogado: Altruísta, visionário e reservado. Busca significado em tudo.',
  INFP: 'O Mediador: Idealista, empático e criativo. Guiado por valores profundos.',
  ENFJ: 'O Protagonista: Carismático, altruísta e líder inspirador. Foco nas pessoas.',
  ENFP: 'O Campeão: Entusiasmado, criativo e sociável. Vê potencial em todos.',
  ISTJ: 'O Logístico: Confiável, organizado e dedicado. Valoriza tradição e responsabilidade.',
  ISFJ: 'O Defensor: Protetor, dedicado e caloroso. Sempre disposto a ajudar.',
  ESTJ: 'O Executivo: Organizador, leal e decidido. Excelente em gerenciar projetos.',
  ESFJ: 'O Cônsul: Cuidadoso, sociável e leal. Foca em harmonia e cooperação.',
  ISTP: 'O Virtuoso: Observador, prático e analítico. Gosta de entender como as coisas funcionam.',
  ISFP: 'O Aventureiro: Flexível, charmoso e curioso. Aprecia beleza e experiências.',
  ESTP: 'O Empreendedor: Esperto, energético e perceptivo. Ama agir e resolver problemas.',
  ESFP: 'O Animador: Espontâneo, energético e entusiasmado. Faz qualquer situação divertida.',
};

export class SixteenPersonalitiesEngine {

  static calculate(responses: IpipItemResponse[]): SixteenPResult {
    const rawScores: Record<BigFiveDimension, number[]> = { O: [], C: [], E: [], A: [], N: [] };

    for (const r of responses) {
      const adjusted = r.keyed === '-' ? (6 - r.score) : r.score;
      const dimension = r.dimension as BigFiveDimension;
      rawScores[dimension].push(adjusted);
    }

    const normalize = (scores: number[]): number => {
      if (scores.length === 0) return 50;
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      return Math.round(((avg - 1) / 4) * 100);
    };

    const bigFive: BigFiveScores = {
      openness: normalize(rawScores.O),
      conscientiousness: normalize(rawScores.C),
      extraversion: normalize(rawScores.E),
      agreeableness: normalize(rawScores.A),
      neuroticism: normalize(rawScores.N),
    };

    const E = bigFive.extraversion;
    const I = 100 - E;
    const N = bigFive.openness;
    const S = 100 - N;
    const F = bigFive.agreeableness;
    const T = 100 - F;
    const J = bigFive.conscientiousness;
    const P = 100 - J;

    const mbtiType = `${E >= 50 ? 'E' : 'I'}${N >= 50 ? 'N' : 'S'}${T >= 50 ? 'T' : 'F'}${J >= 50 ? 'J' : 'P'}`;

    const cognitiveStrengths = SixteenPersonalitiesEngine.getCognitiveStrengths(mbtiType, bigFive);

    return {
      mbtiType,
      E, I, N, S, T, F, J, P,
      bigFive,
      typeDescription: MBTI_DESCRIPTIONS[mbtiType] ?? `Tipo ${mbtiType}: perfil único e multifacetado.`,
      cognitiveStrengths,
    };
  }

  private static getCognitiveStrengths(mbtiType: string, bf: BigFiveScores): string[] {
    const strengths: string[] = [];
    if (bf.openness > 70) strengths.push('Alta criatividade e abertura a novas ideias');
    if (bf.conscientiousness > 70) strengths.push('Forte senso de organização e disciplina');
    if (bf.extraversion > 70) strengths.push('Excelente comunicação e energia em grupo');
    if (bf.agreeableness > 70) strengths.push('Alta empatia e habilidade de cooperação');
    if (bf.neuroticism < 30) strengths.push('Grande estabilidade emocional sob pressão');
    if (mbtiType.includes('NT')) strengths.push('Pensamento sistêmico e resolução de problemas complexos');
    if (mbtiType.includes('NF')) strengths.push('Liderança inspiradora e comunicação empática');
    if (mbtiType.includes('SJ')) strengths.push('Confiabilidade, consistência e gestão de processos');
    if (mbtiType.includes('SP')) strengths.push('Adaptabilidade e execução prática de tarefas');
    return strengths.slice(0, 4);
  }

  static parseResponses(
    responses: Array<{ questionId: string; answer: string }>,
  ): IpipItemResponse[] {
    return responses.map((r) => {
      const parsed = JSON.parse(r.answer) as {
        score: 1 | 2 | 3 | 4 | 5;
        dimension: BigFiveDimension;
        keyed: '+' | '-';
      };
      return { itemId: r.questionId, ...parsed };
    });
  }
}
