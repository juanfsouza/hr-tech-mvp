import { api } from '@/lib/api';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  matchScore?: number;
  matchId?: string;
  status: string;
  jobId?: string;
}

export const candidateService = {
  async list() {
    const { data } = await api.get<{ items: Candidate[] }>('/candidates');
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Candidate>(`/candidates/${id}`);
    return data;
  },

  async create(input: any) {
    const { data } = await api.post<Candidate>('/candidates', input);
    return data;
  },

  async update(id: string, input: any) {
    const { data } = await api.patch<Candidate>(`/candidates/${id}`, input);
    return data;
  },

  async delete(id: string) {
    await api.delete(`/candidates/${id}`);
  }
};
