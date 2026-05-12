import { api } from '@/lib/api';
import { 
  Company, 
  CreateCompanyInput, 
  UpdateOnboardingInput, 
  OrganogramNode 
} from '@/types/company';

export const companyService = {
  async create(input: CreateCompanyInput) {
    const { data } = await api.post<{ companyId: string; cnpj: string; razaoSocial: string }>('/companies', input);
    return data;
  },

  async updateOnboarding(id: string, input: UpdateOnboardingInput) {
    const { data } = await api.patch<Company>(`/companies/${id}/onboarding`, input);
    return data;
  },

  async update(id: string, input: Partial<CreateCompanyInput>) {
    const { data } = await api.patch<Company>(`/companies/${id}`, input);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<Company>(`/companies/${id}`);
    return data;
  },

  async syncOrganogram(companyId: string, nodes: OrganogramNode[], personalityResults: Record<string, any>) {
    const { data } = await api.post<{ success: boolean }>(`/companies/${companyId}/sync-organogram`, {
      nodes,
      personalityResults
    });
    return data;
  }
};

export type { Company, CreateCompanyInput, UpdateOnboardingInput, OrganogramNode };
