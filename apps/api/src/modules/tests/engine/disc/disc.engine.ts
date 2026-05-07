/**
 * DISC Engine — Motor TypeScript puro
 *
 * Baseado no algoritmo clássico DISC (William Marston):
 * - 28 blocos de 4 afirmações cada
 * - Candidato escolhe a que "MAIS" e a que "MENOS" descreve
 * - Cada afirmação mapeia para D, I, S ou C
 *
 * Scoring:
 *   +1 na dimensão da escolha "MAIS"
 *   -1 na dimensão da escolha "MENOS"
 *   Normalizado para 0-100%
 */

import { DiscQuestionChoice } from "@/modules/tests/domain/interfaces/disc-question-choice.interface";
import { DiscResult } from "@/modules/tests/domain/interfaces/disc-result.interface";

export type DiscDimension = 'D' | 'I' | 'S' | 'C';
const DISC_DESCRIPTIONS: Record<DiscDimension, string> = {
  D: 'Dominante: orientado a resultados, direto, decisivo e competitivo.',
  I: 'Influente: comunicativo, entusiasta, otimista e persuasivo.',
  S: 'Estável: paciente, consistente, leal e bom ouvinte.',
  C: 'Consciencioso: analítico, preciso, sistemático e orientado a qualidade.',
};

export class DiscEngine {

  static calculate(choices: DiscQuestionChoice[]): DiscResult {
    const scores: { [key in DiscDimension]: number } = { D: 0, I: 0, S: 0, C: 0 };

    for (const choice of choices) {
      const mostLike = choice.mostLike as DiscDimension;
      const leastLike = choice.leastLike as DiscDimension;

      scores[mostLike] += 1;
      scores[leastLike] -= 1;
    }

    const values = Object.values(scores);
    const min = Math.min(...values);
    const shifted: Record<DiscDimension, number> = {
      D: scores.D - min,
      I: scores.I - min,
      S: scores.S - min,
      C: scores.C - min,
    };

    const total = Object.values(shifted).reduce((s, v) => s + v, 0) || 1;
    const normalized: Record<DiscDimension, number> = {
      D: Math.round((shifted.D / total) * 100),
      I: Math.round((shifted.I / total) * 100),
      S: Math.round((shifted.S / total) * 100),
      C: Math.round((shifted.C / total) * 100),
    };

    const sorted = (Object.keys(normalized) as DiscDimension[]).sort(
      (a, b) => normalized[b] - normalized[a],
    );

    const dominantProfile = sorted[0]!;
    const secondaryProfile = sorted[1]!;

    return {
      ...normalized,
      dominantProfile,
      secondaryProfile,
      profileDescription: DISC_DESCRIPTIONS[dominantProfile],
    };
  }

  static parseResponses(responses: Array<{ questionId: string; answer: string }>): DiscQuestionChoice[] {
    return responses.map((r) => {
      const parsed = JSON.parse(r.answer) as { mostLike: DiscDimension; leastLike: DiscDimension };
      return { questionId: r.questionId, mostLike: parsed.mostLike, leastLike: parsed.leastLike };
    });
  }
}
