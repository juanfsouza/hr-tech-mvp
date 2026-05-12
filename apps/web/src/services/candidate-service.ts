import { api } from '@/lib/api';
import { Candidate, CreateCandidateInput, CandidateListResponse } from '@/types/candidate';

export const candidateService = {
  async list(cursor?: string, take?: number) {
    const { data } = await api.get<CandidateListResponse>('/candidates', { params: { cursor, take } });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Candidate>(`/candidates/${id}`);
    return data;
  },

  async create(input: CreateCandidateInput) {
    const { data } = await api.post<Candidate>('/candidates', input);
    return data;
  },

  async update(id: string, input: Partial<CreateCandidateInput>) {
    const { data } = await api.patch<Candidate>(`/candidates/${id}`, input);
    return data;
  },

  async delete(id: string) {
    await api.delete(`/candidates/${id}`);
  }
};
export type { Candidate, CreateCandidateInput, CandidateListResponse };

