import { api } from '@/lib/api';

export const aiService = {
  async generateCompanyContext(companyName: string, profile: string, tags: string[]) {
    const { data } = await api.post<{ text: string }>('/ai/generate-context', {
      companyName,
      profile,
      tags
    });
    return data.text;
  }
};
