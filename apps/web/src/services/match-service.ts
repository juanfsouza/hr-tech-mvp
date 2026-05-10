import { api } from '@/lib/api';

export interface MatchAnalysis {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO';
  summary: string;
  details: {
    jobMatch: {
      score: number;
      rationale: string;
      strengths: string[];
      risks: string[];
    };
    leaderMatch: {
      score: number;
      rationale: string;
      communicationTip: string;
    };
    cultureMatch: {
      score: number;
      rationale: string;
    };
    developmentPlan: string[];
  };
  createdAt: string;
}

export const matchService = {
  async triggerAnalysis(candidateId: string, jobId: string) {
    const { data } = await api.post<{ jobQueueId: string; message: string }>('/match/analyze', {
      candidateId,
      jobId
    });
    return data;
  },

  async getMatch(matchId: string) {
    const { data } = await api.get<MatchAnalysis>(`/match/${matchId}`);
    return data;
  },

  async getByCandidate(candidateId: string) {
    const { data } = await api.get<Partial<MatchAnalysis>[]>(`/match/candidate/${candidateId}`);
    return data;
  }
};
