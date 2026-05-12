import { api } from '@/lib/api';
import { Job, CreateJobInput } from '@/types/job';

export const jobService = {
  async create(input: CreateJobInput) {
    const { data } = await api.post<Job>('/jobs', input);
    return data;
  },

  async list(cursor?: string, take?: number) {
    const { data } = await api.get<{ items: Job[], nextCursor?: string, hasNextPage?: boolean }>('/jobs', { params: { cursor, take } });
    return data;
  },

  async generateJd(id: string) {
    const { data } = await api.post<{ jd: string }>(`/jobs/${id}/generate-jd`);
    return data;
  },

  async publish(id: string) {
    const { data } = await api.patch<{ status: string }>(`/jobs/${id}/publish`);
    return data;
  },

  async pause(id: string) {
    const { data } = await api.patch<{ status: string }>(`/jobs/${id}/pause`);
    return data;
  },

  async close(id: string) {
    const { data } = await api.patch<{ status: string }>(`/jobs/${id}/close`);
    return data;
  },

  async delete(id: string) {
    await api.delete(`/jobs/${id}`);
  },

  async update(id: string, input: Partial<CreateJobInput>) {
    const { data } = await api.patch<{ id: string }>(`/jobs/${id}`, input);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Job>(`/jobs/${id}`);
    return data;
  }
};

export type { Job, CreateJobInput };
