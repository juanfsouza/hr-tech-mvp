import { api } from '@/lib/api';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  matchScore?: number;
  matchId?: string;
  status: string;
}

export const candidateService = {
  async list() {
    const { data } = await api.get<{ items: Candidate[] }>('/candidates');
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Candidate>(`/candidates/${id}`);
    return data;
  }
};
