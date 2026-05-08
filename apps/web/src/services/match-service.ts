import { api } from '@/lib/api';

export interface MatchAnalysis {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  recommendation: 'HIRE' | 'RECONSIDER' | 'NO';
  summary: string;
  details: {
    cultureMatch: number;
    technicalSkills: number;
    leadershipPotential: number;
    softSkills: string[];
    risks?: string[];
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
