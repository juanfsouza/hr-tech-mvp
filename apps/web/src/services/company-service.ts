import { api } from '@/lib/api';

export interface CreateCompanyInput {
  razaoSocial: string;
  cnpj: string;
  websiteUrl?: string;
  userId: string;
}

export interface UpdateOnboardingInput {
  onboardingStatus?: string;
  companyContext?: string;
  perfilRitmo?: string;
  valores?: string[];
  isComplete?: boolean;
}

export const companyService = {
  async create(input: CreateCompanyInput) {
    const { data } = await api.post<{ companyId: string; cnpj: string }>('/companies', input);
    return data;
  },

  async updateOnboarding(id: string, input: UpdateOnboardingInput) {
    const { data } = await api.patch(`/companies/${id}/onboarding`, input);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/companies/${id}`);
    return data;
  }
};
