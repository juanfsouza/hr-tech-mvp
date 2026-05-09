import { api } from '@/lib/api';

export interface CreateJobInput {
  title: string;
  description?: string;
  department?: string;
  location?: string;
  type?: string;
  requirements?: string[];
  responsibilities?: string[];
}

export interface Job {
  id: string;
  title: string;
  status: string;
  description?: string;
  companyId: string;
}

export const jobService = {
  async create(input: CreateJobInput) {
    const { data } = await api.post<Job>('/jobs', input);
    return data;
  },

  async list(cursor?: string, take?: number) {
    const { data } = await api.get<{ items: Job[] }>('/jobs', { params: { cursor, take } });
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

  async update(id: string, input: Partial<CreateJobInput>) {
    const { data } = await api.patch<{ id: string }>(`/jobs/${id}`, input);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Job>(`/jobs/${id}`);
    return data;
  }
};
